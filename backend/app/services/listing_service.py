from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from ..models.listing import FoodListing
from ..models.notification import Notification
from ..models.user import User
import structlog

logger = structlog.get_logger()


async def expire_stale_listings(db: AsyncSession):
    """Background task: mark listings as expired if expires_at has passed."""
    now = datetime.utcnow()
    result = await db.execute(
        select(FoodListing).where(
            FoodListing.status == "available",
            FoodListing.expires_at <= now,
        )
    )
    listings = result.scalars().all()
    for listing in listings:
        listing.status = "expired"
        # Notify donor
        notif = Notification(
            user_id=listing.donor_id,
            title="Listing Expired",
            message=f"Your listing '{listing.food_type}' has expired.",
            type="warning",
        )
        db.add(notif)
    if listings:
        await db.commit()
        logger.info("Expired listings", count=len(listings))


async def notify_nearby_receivers(db: AsyncSession, listing: FoodListing):
    """Create in-app notifications for receivers near a new listing."""
    from ..services.geo_service import haversine_distance
    from ..config import settings

    result = await db.execute(
        select(User).where(User.role == "receiver", User.is_active == True)
    )
    receivers = result.scalars().all()
    for receiver in receivers:
        if receiver.latitude is None or receiver.longitude is None:
            continue
        dist = haversine_distance(
            receiver.latitude, receiver.longitude,
            listing.latitude, listing.longitude,
        )
        if dist <= settings.DEFAULT_RADIUS_KM:
            notif = Notification(
                user_id=receiver.id,
                title="New Food Nearby!",
                message=f"{listing.food_type} available {dist:.1f} km away at {listing.pickup_address}",
                type="info",
            )
            db.add(notif)
    await db.commit()
