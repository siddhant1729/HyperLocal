import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, DateTime
from sqlalchemy.orm import relationship
from ..database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="receiver")  # donor | receiver | admin
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    fcm_token = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    listings = relationship("FoodListing", back_populates="donor", foreign_keys="FoodListing.donor_id")
    claims = relationship("Transaction", back_populates="receiver", foreign_keys="Transaction.receiver_id")
    notifications = relationship("Notification", back_populates="user")
