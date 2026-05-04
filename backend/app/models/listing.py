import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..database import Base


class FoodListing(Base):
    __tablename__ = "food_listings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    donor_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    food_type = Column(String(255), nullable=False)
    food_category = Column(String(20), nullable=False, default="veg")  # veg | non-veg | vegan
    quantity = Column(Float, nullable=False)
    quantity_unit = Column(String(20), nullable=False, default="servings")  # kg | servings | items
    description = Column(Text, nullable=True)
    pickup_address = Column(String(500), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    prepared_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=False)
    status = Column(String(20), nullable=False, default="available")  # available | claimed | expired | deleted
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    donor = relationship("User", back_populates="listings", foreign_keys=[donor_id])
    transactions = relationship("Transaction", back_populates="listing")
