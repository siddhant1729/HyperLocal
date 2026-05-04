import math
from typing import List


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two lat/lon points (Haversine formula)."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def filter_nearby(user_lat: float, user_lon: float, listings: list, radius_km: float) -> list:
    """
    Filter and annotate listings within radius_km.
    Returns list of (listing, distance_km) sorted by proximity.
    """
    result = []
    for listing in listings:
        dist = haversine_distance(user_lat, user_lon, listing.latitude, listing.longitude)
        if dist <= radius_km:
            result.append((listing, round(dist, 2)))
    result.sort(key=lambda x: x[1])
    return result
