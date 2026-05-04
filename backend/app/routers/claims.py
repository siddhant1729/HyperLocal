from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from ..database import get_db
from ..models.listing import FoodListing
from ..models.transaction import Transaction
from ..models.user import User
from ..schemas.transaction import ClaimCreate, ClaimComplete, ClaimCancel, TransactionResponse
from ..services.notification_service import create_notification
from ..middleware.auth_middleware import get_current_user, require_receiver, require_donor

router = APIRouter(prefix="/api/claims", tags=["claims"])


@router.post("/", response_model=TransactionResponse, status_code=201)
async def claim_listing(
    payload: ClaimCreate,
    current_user: User = Depends(require_receiver),
    db: AsyncSession = Depends(get_db),
):
    # Lock listing row
    result = await db.execute(
        select(FoodListing).where(FoodListing.id == payload.listing_id)
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.status != "available":
        raise HTTPException(status_code=400, detail="Listing is not available")
    if listing.donor_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot claim your own listing")

    listing.status = "claimed"
    txn = Transaction(
        listing_id=listing.id,
        receiver_id=current_user.id,
        donor_id=listing.donor_id,
        status="pending",
    )
    db.add(txn)
    await db.commit()
    await db.refresh(txn)

    # Notify donor
    await create_notification(
        db,
        user_id=listing.donor_id,
        title="Your food was claimed!",
        message=f"{current_user.name} claimed '{listing.food_type}'. Please prepare for pickup.",
        notif_type="success",
    )
    return TransactionResponse.model_validate(txn)


@router.get("/my", response_model=list[TransactionResponse])
async def get_my_claims(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction)
        .where(Transaction.receiver_id == current_user.id)
        .order_by(Transaction.claimed_at.desc())
    )
    return [TransactionResponse.model_validate(t) for t in result.scalars().all()]


@router.delete("/{claim_id}")
async def cancel_claim(
    claim_id: str,
    payload: ClaimCancel = ClaimCancel(),
    current_user: User = Depends(require_receiver),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Transaction).where(Transaction.id == claim_id))
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Claim not found")
    if txn.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your claim")
    if txn.status not in ("pending", "confirmed"):
        raise HTTPException(status_code=400, detail="Cannot cancel this claim")

    txn.status = "cancelled"
    txn.cancelled_at = datetime.utcnow()
    txn.cancel_reason = payload.cancel_reason

    # Restore listing
    listing_result = await db.execute(select(FoodListing).where(FoodListing.id == txn.listing_id))
    listing = listing_result.scalar_one_or_none()
    if listing:
        listing.status = "available"

    await db.commit()
    return {"message": "Claim cancelled"}


@router.put("/{claim_id}/complete")
async def complete_claim(
    claim_id: str,
    payload: ClaimComplete = ClaimComplete(),
    current_user: User = Depends(require_donor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Transaction).where(Transaction.id == claim_id))
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Claim not found")
    if txn.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your listing")

    txn.status = "completed"
    txn.completed_at = datetime.utcnow()
    txn.feedback_rating = payload.feedback_rating
    txn.feedback_text = payload.feedback_text
    await db.commit()

    await create_notification(
        db,
        user_id=txn.receiver_id,
        title="Pickup Confirmed!",
        message="The donor has confirmed your pickup. Thank you for reducing food waste!",
        notif_type="success",
    )
    return {"message": "Pickup marked complete"}


@router.get("/listing/{listing_id}", response_model=list[TransactionResponse])
async def get_claims_for_listing(
    listing_id: str,
    current_user: User = Depends(require_donor),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Transaction).where(Transaction.listing_id == listing_id).order_by(Transaction.claimed_at.desc())
    )
    return [TransactionResponse.model_validate(t) for t in result.scalars().all()]
