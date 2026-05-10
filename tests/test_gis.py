"""Tests for GIS utility functions."""

import json
import math

from custom_components.property_manager.gis import (
    calibration_scale_factor,
    haversine_distance,
    parse_geojson_boundary,
    polygon_area_sq_meters,
)


class TestHaversineDistance:
    def test_same_point(self):
        assert haversine_distance(47.6, -122.3, 47.6, -122.3) == 0.0

    def test_known_distance(self):
        # Seattle to Portland: ~233 km
        d = haversine_distance(47.6062, -122.3321, 45.5152, -122.6784)
        assert 230_000 < d < 240_000

    def test_short_distance(self):
        # ~111 meters per 0.001 degree latitude
        d = haversine_distance(47.6000, -122.3, 47.6010, -122.3)
        assert 100 < d < 120


class TestPolygonArea:
    def test_empty(self):
        assert polygon_area_sq_meters([]) == 0.0
        assert polygon_area_sq_meters([[0, 0], [1, 1]]) == 0.0

    def test_small_square(self):
        # Roughly 111m x ~75m at lat 47
        coords = [
            [47.0000, -122.0000],
            [47.0010, -122.0000],
            [47.0010, -122.0010],
            [47.0000, -122.0010],
        ]
        area = polygon_area_sq_meters(coords)
        # Should be roughly 111m * 75m = ~8300 sq meters
        assert 7000 < area < 10000


class TestParseGeoJSON:
    def test_polygon(self):
        geojson = json.dumps(
            {
                "type": "Polygon",
                "coordinates": [
                    [
                        [-122.3321, 47.6062],
                        [-122.3310, 47.6062],
                        [-122.3310, 47.6050],
                        [-122.3321, 47.6050],
                        [-122.3321, 47.6062],
                    ]
                ],
            }
        )
        boundary = parse_geojson_boundary(geojson)
        assert len(boundary) == 5
        # Check lng/lat swap to lat/lng
        assert boundary[0] == [47.6062, -122.3321]

    def test_feature(self):
        geojson = json.dumps(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [
                        [[-122.0, 47.0], [-122.1, 47.0], [-122.1, 47.1]]
                    ],
                },
            }
        )
        boundary = parse_geojson_boundary(geojson)
        assert len(boundary) == 3

    def test_feature_collection(self):
        geojson = json.dumps(
            {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [
                                [[-122.0, 47.0], [-122.1, 47.0], [-122.1, 47.1]]
                            ],
                        },
                    }
                ],
            }
        )
        boundary = parse_geojson_boundary(geojson)
        assert len(boundary) == 3


class TestCalibrationScaleFactor:
    def test_perfect_calibration(self):
        # If known distance matches haversine, factor should be ~1.0
        point_a = [47.6000, -122.3000]
        point_b = [47.6010, -122.3000]
        actual = haversine_distance(point_a[0], point_a[1], point_b[0], point_b[1])
        factor = calibration_scale_factor(point_a, point_b, actual)
        assert abs(factor - 1.0) < 0.001

    def test_same_point(self):
        factor = calibration_scale_factor([47.6, -122.3], [47.6, -122.3], 10.0)
        assert factor == 1.0
