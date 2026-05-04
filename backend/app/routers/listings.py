from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import Optional
from ..database import get_db
from ..models.listing import FoodListing
from ..models.user import User
from ..schemas.listing import ListingCreate, ListingUpdate, ListingResponse
from ..services.geo_service import filter_nearby
from ..services.listing_service import notify_nearby_receivers
from ..middleware.auth_middleware import get_current_user, require_donor, require_admin
from ..config import settings

router = APIRouter(prefix="/api/listings", tags=["listings"])


def _build_response(listing: FoodListing, donor_name: str = None, distance_km: float = None) -> ListingResponse:
    data = ListingResponse.model_validate(listing)
    data.donor_name = donor_name
    data.distance_km = distance_km
    return data


@router.post("/", response_model=ListingResponse, status_code=201)
async def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(require_donor),
    db: AsyncSession = Depends(get_db),
):
    listing = FoodListing(**payload.model_dump(), donor_id=current_user.id)
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    # Notify nearby receivers asynchronously
    await notify_nearby_receivers(db, listing)
    return _build_response(listing, donor_name=current_user.name)


@router.get("/nearby", response_model=list[ListingResponse])
async def get_nearby_listings(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(default=5.0, le=50.0),
    category: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    query = select(FoodListing, User.name).join(User, FoodListing.donor_id == User.id).where(
        FoodListing.status == "available",
        FoodListing.expires_at > datetime.utcnow(),
    )
    if category:
        query = query.where(FoodListing.food_category == category)
    result = await db.execute(query)
    rows = result.all()

    nearby = []
    for listing, donor_name in rows:
        from ..services.geo_service import haversine_distance
        dist = haversine_distance(lat, lng, listing.latitude, listing.longitude)
        if dist <= radius_km:
            nearby.append((listing, donor_name, round(dist, 2)))
    nearby.sort(key=lambda x: x[2])
    return [_build_response(l, d, dist) for l, d, dist in nearby]


@router.get("/my", response_model=list[ListingResponse])
async def get_my_listings(
    current_user: User = Depends(require_donor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FoodListing).where(FoodListing.donor_id == current_user.id).order_by(FoodListing.created_at.desc())
    )
    listings = result.scalars().all()
    return [_build_response(l, current_user.name) for l in listings]


@router.get("/", response_model=list[ListingResponse])
async def get_all_listings(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FoodListing, User.name)
        .join(User, FoodListing.donor_id == User.id)
        .where(FoodListing.status == "available")
        .order_by(FoodListing.created_at.desc())
        .offset(skip).limit(limit)
    )
    return [_build_response(l, d) for l, d in result.all()]


@router.get("/{listing_id}", response_model=ListingResponse)
async def get_listing(listing_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(FoodListing, User.name).join(User, FoodListing.donor_id == User.id).where(FoodListing.id == listing_id)
    )
    row = result.first()
    if not row:
        raise HTTPException(status_code=404, detail="Listing not found")
    return _build_response(row[0], row[1])


@router.put("/{listing_id}", response_model=ListingResponse)
async def update_listing(
    listing_id: str,
    payload: ListingUpdate,
    current_user: User = Depends(require_donor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FoodListing).where(FoodListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.donor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your listing")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(listing, field, value)
    await db.commit()
    await db.refresh(listing)
    return _build_response(listing, current_user.name)


@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: str,
    current_user: User = Depends(require_donor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FoodListing).where(FoodListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.donor_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not your listing")
    listing.status = "deleted"
    await db.commit()
    return {"message": "Listing deleted"}


@router.patch("/{listing_id}/expire")
async def expire_listing(
    listing_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FoodListing).where(FoodListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.status = "expired"
    await db.commit()
    return {"message": "Listing expired"}
