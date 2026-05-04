from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ListingCreate(BaseModel):
    food_type: str = Field(min_length=1)
    food_category: str = "veg"  # veg | non-veg | vegan
    quantity: float = Field(gt=0)
    quantity_unit: str = "servings"  # kg | servings | items
    description: Optional[str] = None
    pickup_address: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    prepared_at: Optional[datetime] = None
    expires_at: datetime
    image_url: Optional[str] = None


class ListingUpdate(BaseModel):
    food_type: Optional[str] = None
    food_category: Optional[str] = None
    quantity: Optional[float] = None
    quantity_unit: Optional[str] = None
    description: Optional[str] = None
    pickup_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    prepared_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    image_url: Optional[str] = None


class ListingResponse(BaseModel):
    id: str
    donor_id: str
    food_type: str
    food_category: str
    quantity: float
    quantity_unit: str
    description: Optional[str] = None
    pickup_address: str
    latitude: float
    longitude: float
    prepared_at: Optional[datetime] = None
    expires_at: datetime
    status: str
    image_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    donor_name: Optional[str] = None
    distance_km: Optional[float] = None

    model_config = {"from_attributes": True}
