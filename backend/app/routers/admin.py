from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from ..database import get_db
from ..models.user import User
from ..models.listing import FoodListing
from ..models.transaction import Transaction
from ..schemas.user import UserResponse
from ..schemas.listing import ListingResponse
from ..schemas.transaction import TransactionResponse
from ..middleware.auth_middleware import require_admin

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).offset(skip).limit(limit))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.delete("/users/{user_id}")
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}


@router.get("/listings", response_model=list[ListingResponse])
async def list_all_listings(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FoodListing, User.name)
        .join(User, FoodListing.donor_id == User.id)
        .offset(skip).limit(limit)
    )
    out = []
    for listing, donor_name in result.all():
        r = ListingResponse.model_validate(listing)
        r.donor_name = donor_name
        out.append(r)
    return out


@router.delete("/listings/{listing_id}")
async def force_delete_listing(
    listing_id: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(FoodListing).where(FoodListing.id == listing_id))
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.status = "deleted"
    await db.commit()
    return {"message": "Listing removed"}


@router.get("/stats")
async def get_stats(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_listings = (await db.execute(select(func.count(FoodListing.id)))).scalar()
    active_listings = (await db.execute(
        select(func.count(FoodListing.id)).where(FoodListing.status == "available")
    )).scalar()
    completed_txns = (await db.execute(
        select(func.count(Transaction.id)).where(Transaction.status == "completed")
    )).scalar()
    total_kg_saved = (await db.execute(
        select(func.sum(FoodListing.quantity)).where(
            FoodListing.status.in_(["claimed", "completed"]),
            FoodListing.quantity_unit == "kg",
        )
    )).scalar() or 0
    return {
        "total_users": total_users,
        "total_listings": total_listings,
        "active_listings": active_listings,
        "completed_transactions": completed_txns,
        "total_kg_saved": round(float(total_kg_saved), 2),
    }


@router.get("/transactions", response_model=list[TransactionResponse])
async def list_transactions(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).order_by(Transaction.claimed_at.desc()).offset(skip).limit(limit)
    )
    return [TransactionResponse.model_validate(t) for t in result.scalars().all()]
