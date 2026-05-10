"""Tests for Property Manager data models."""

from custom_components.property_manager.models import (
    Asset,
    Calibration,
    Geometry,
    MaintenanceLogEntry,
    Photo,
    Property,
    PropertyStore,
    Schedule,
    Zone,
)


class TestGeometry:
    def test_point_round_trip(self):
        g = Geometry(type="Point", coordinates=[47.6, -122.3])
        d = g.to_dict()
        g2 = Geometry.from_dict(d)
        assert g2.type == "Point"
        assert g2.coordinates == [47.6, -122.3]

    def test_polygon_round_trip(self):
        coords = [[[47.6, -122.3], [47.6, -122.2], [47.5, -122.2]]]
        g = Geometry(type="Polygon", coordinates=coords)
        g2 = Geometry.from_dict(g.to_dict())
        assert g2.type == "Polygon"
        assert g2.coordinates == coords


class TestAsset:
    def test_round_trip(self, sample_asset: Asset):
        d = sample_asset.to_dict()
        a = Asset.from_dict(d)
        assert a.id == sample_asset.id
        assert a.name == sample_asset.name
        assert a.category == "pest_control"
        assert a.geometry.type == "Point"
        assert len(a.schedules) == 1
        assert a.schedules[0].action == "Check and clean trap"

    def test_defaults(self):
        a = Asset()
        assert a.id.startswith("asset_")
        assert a.status == "active"
        assert a.category == "custom"

    def test_from_dict_minimal(self):
        a = Asset.from_dict({"name": "Test"})
        assert a.name == "Test"
        assert a.id.startswith("asset_")


class TestZone:
    def test_round_trip(self, sample_zone: Zone):
        d = sample_zone.to_dict()
        z = Zone.from_dict(d)
        assert z.id == sample_zone.id
        assert z.name == "Back Deck"
        assert z.color == "#78909C"


class TestProperty:
    def test_round_trip(self, sample_property: Property):
        d = sample_property.to_dict()
        p = Property.from_dict(d)
        assert p.name == "Test Home"
        assert p.address == "123 Test St, Seattle, WA 98101"
        assert p.calibration.distance_meters == 14.63


class TestPropertyStore:
    def test_round_trip(self, sample_store: PropertyStore):
        d = sample_store.to_dict()
        s = PropertyStore.from_dict(d)
        assert s.version == 1
        assert len(s.assets) == 1
        assert len(s.zones) == 1
        assert s.property.name == "Test Home"

    def test_empty_store(self):
        s = PropertyStore()
        d = s.to_dict()
        assert d["version"] == 1
        assert d["assets"] == []
        assert d["zones"] == []


class TestSchedule:
    def test_round_trip(self):
        s = Schedule(
            id="sched_1",
            action="Mow lawn",
            frequency="7d",
            season={"start_month": 3, "end_month": 11},
            next_due="2026-05-15",
        )
        d = s.to_dict()
        s2 = Schedule.from_dict(d)
        assert s2.action == "Mow lawn"
        assert s2.frequency == "7d"
        assert s2.season == {"start_month": 3, "end_month": 11}
