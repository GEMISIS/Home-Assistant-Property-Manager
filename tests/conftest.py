"""Shared test fixtures for Property Manager tests."""

from __future__ import annotations

import pytest

from custom_components.property_manager.models import (
    Asset,
    Calibration,
    Geometry,
    Property,
    PropertyStore,
    Schedule,
    Zone,
)


@pytest.fixture
def sample_property() -> Property:
    """Return a sample property for testing."""
    return Property(
        name="Test Home",
        boundary=[
            [47.6062, -122.3321],
            [47.6062, -122.3310],
            [47.6050, -122.3310],
            [47.6050, -122.3321],
        ],
        calibration=Calibration(
            point_a=[47.6062, -122.3321],
            point_b=[47.6062, -122.3310],
            distance_meters=14.63,
        ),
        address="123 Test St, Seattle, WA 98101",
        timezone="America/Los_Angeles",
    )


@pytest.fixture
def sample_asset() -> Asset:
    """Return a sample asset for testing."""
    return Asset(
        id="asset_test001",
        name="Yellowjacket Trap - NW Corner",
        type="wasp_trap",
        category="pest_control",
        geometry=Geometry(type="Point", coordinates=[47.6060, -122.3318]),
        status="active",
        metadata={"bait_type": "protein", "trap_model": "RESCUE!"},
        linked_entities=[],
        schedules=[
            Schedule(
                id="sched_test001",
                action="Check and clean trap",
                frequency="14d",
                season={"start_month": 4, "end_month": 10},
                next_due="2026-05-12",
            ),
        ],
    )


@pytest.fixture
def sample_zone() -> Zone:
    """Return a sample zone for testing."""
    return Zone(
        id="zone_test001",
        name="Back Deck",
        category="structures",
        geometry=Geometry(
            type="Polygon",
            coordinates=[
                [
                    [47.6058, -122.3316],
                    [47.6058, -122.3312],
                    [47.6055, -122.3312],
                    [47.6055, -122.3316],
                ]
            ],
        ),
        color="#78909C",
    )


@pytest.fixture
def sample_store(sample_property, sample_asset, sample_zone) -> PropertyStore:
    """Return a sample property store for testing."""
    return PropertyStore(
        version=1,
        property=sample_property,
        assets=[sample_asset],
        zones=[sample_zone],
    )
