"""GIS utilities for Property Manager — coordinate math and parcel import."""

from __future__ import annotations

import json
import math
from typing import Any


def haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Calculate the great-circle distance between two points in meters."""
    r = 6_371_000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def polygon_area_sq_meters(coords: list[list[float]]) -> float:
    """Approximate area of a lat/lng polygon in square meters using the Shoelace formula.

    Converts to a local Cartesian approximation first. Good enough for
    residential-scale properties.
    """
    if len(coords) < 3:
        return 0.0

    # Use the centroid as the local origin
    avg_lat = sum(c[0] for c in coords) / len(coords)
    avg_lng = sum(c[1] for c in coords) / len(coords)

    # Convert to meters relative to centroid
    m_per_deg_lat = 111_320.0
    m_per_deg_lng = 111_320.0 * math.cos(math.radians(avg_lat))

    points = [
        ((c[0] - avg_lat) * m_per_deg_lat, (c[1] - avg_lng) * m_per_deg_lng)
        for c in coords
    ]

    # Shoelace formula
    n = len(points)
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += points[i][0] * points[j][1]
        area -= points[j][0] * points[i][1]
    return abs(area) / 2.0


def parse_geojson_boundary(geojson_str: str) -> list[list[float]]:
    """Parse a GeoJSON Feature or Geometry into a boundary coordinate list.

    Accepts a GeoJSON string for manual parcel import. Returns a list of
    [lat, lng] pairs suitable for the Property boundary field.
    """
    data = json.loads(geojson_str)

    # Handle FeatureCollection — take the first feature
    if data.get("type") == "FeatureCollection":
        features = data.get("features", [])
        if not features:
            return []
        data = features[0]

    # Handle Feature wrapper
    if data.get("type") == "Feature":
        data = data.get("geometry", {})

    if data.get("type") != "Polygon":
        raise ValueError(f"Expected Polygon geometry, got {data.get('type')}")

    # GeoJSON coordinates are [lng, lat]; we store [lat, lng]
    ring = data.get("coordinates", [[]])[0]
    return [[coord[1], coord[0]] for coord in ring]


def calibration_scale_factor(
    point_a: list[float],
    point_b: list[float],
    known_distance_meters: float,
) -> float:
    """Compute a scale factor from a two-point calibration.

    Returns the ratio: known_distance / haversine_distance.
    A value of ~1.0 means the map coordinates are already well-calibrated.
    """
    computed = haversine_distance(point_a[0], point_a[1], point_b[0], point_b[1])
    if computed == 0:
        return 1.0
    return known_distance_meters / computed
