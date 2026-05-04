from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ClaimCreate(BaseModel):
    listing_id: str


class ClaimComplete(BaseModel):
    feedback_rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_text: Optional[str] = None


class ClaimCancel(BaseModel):
    cancel_reason: Optional[str] = None


class TransactionResponse(BaseModel):
    id: str
    listing_id: str
    receiver_id: str
    donor_id: str
    status: str
    claimed_at: datetime
    completed_at: Optional[datetime] = None
    feedback_rating: Optional[int] = None
    feedback_text: Optional[str] = None
    cancelled_at: Optional[datetime] = None
    cancel_reason: Optional[str] = None

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool
    created_at: datetime

    model_config = {"from_attributes": True}
