"""Tests for the PropertyManagerStore.

Note: These tests require pytest-homeassistant-custom-component for the
full HA test harness. For now, we test the data-layer logic independently.
"""

from custom_components.property_manager.models import (
    Asset,
    MaintenanceLogEntry,
    Photo,
    PropertyStore,
    Zone,
)


class TestPropertyStoreDataLayer:
    """Test the PropertyStore data structure (no HA dependency)."""

    def test_add_asset_to_store(self, sample_store: PropertyStore):
        new_asset = Asset(name="New Sensor", category="utilities")
        sample_store.assets.append(new_asset)
        assert len(sample_store.assets) == 2

    def test_remove_asset_from_store(self, sample_store: PropertyStore):
        asset_id = sample_store.assets[0].id
        sample_store.assets = [a for a in sample_store.assets if a.id != asset_id]
        assert len(sample_store.assets) == 0

    def test_update_asset_in_store(self, sample_store: PropertyStore):
        sample_store.assets[0].name = "Updated Name"
        d = sample_store.to_dict()
        restored = PropertyStore.from_dict(d)
        assert restored.assets[0].name == "Updated Name"

    def test_add_zone_to_store(self, sample_store: PropertyStore):
        new_zone = Zone(name="Garden Bed")
        sample_store.zones.append(new_zone)
        assert len(sample_store.zones) == 2

    def test_update_property(self, sample_store: PropertyStore):
        sample_store.property.name = "Updated Home"
        d = sample_store.to_dict()
        restored = PropertyStore.from_dict(d)
        assert restored.property.name == "Updated Home"

    def test_serialization_stability(self, sample_store: PropertyStore):
        """Verify that to_dict -> from_dict -> to_dict is stable."""
        d1 = sample_store.to_dict()
        restored = PropertyStore.from_dict(d1)
        d2 = restored.to_dict()
        assert d1 == d2


class TestMaintenanceLog:
    """Test maintenance log operations on the data model."""

    def test_add_maintenance_log_entry(self, sample_store: PropertyStore):
        asset = sample_store.assets[0]
        entry = MaintenanceLogEntry(
            date="2026-05-10", action="Checked trap", notes="All clear"
        )
        asset.maintenance_log.append(entry)
        assert len(asset.maintenance_log) == 1
        assert asset.maintenance_log[0].action == "Checked trap"

    def test_maintenance_log_round_trip(self, sample_store: PropertyStore):
        asset = sample_store.assets[0]
        asset.maintenance_log.append(
            MaintenanceLogEntry(date="2026-05-10", action="Cleaned", notes="Scrubbed")
        )
        d = sample_store.to_dict()
        restored = PropertyStore.from_dict(d)
        assert len(restored.assets[0].maintenance_log) == 1
        assert restored.assets[0].maintenance_log[0].notes == "Scrubbed"


class TestPhotoModel:
    """Test photo operations on the data model."""

    def test_add_photo(self, sample_store: PropertyStore):
        asset = sample_store.assets[0]
        photo = Photo(path="/media/trap_photo.jpg", taken="2026-05-10", caption="Front view")
        asset.photos.append(photo)
        assert len(asset.photos) == 1
        assert asset.photos[0].path == "/media/trap_photo.jpg"

    def test_photo_round_trip(self, sample_store: PropertyStore):
        asset = sample_store.assets[0]
        asset.photos.append(
            Photo(path="/media/test.jpg", taken="2026-05-10", caption="Test")
        )
        d = sample_store.to_dict()
        restored = PropertyStore.from_dict(d)
        assert len(restored.assets[0].photos) == 1
        assert restored.assets[0].photos[0].caption == "Test"


class TestZoneLookup:
    """Test zone lookup operations on the data model."""

    def test_find_zone_by_id(self, sample_store: PropertyStore):
        zone_id = sample_store.zones[0].id
        found = next((z for z in sample_store.zones if z.id == zone_id), None)
        assert found is not None
        assert found.name == "Back Deck"

    def test_find_zone_missing(self, sample_store: PropertyStore):
        found = next((z for z in sample_store.zones if z.id == "nonexistent"), None)
        assert found is None

    def test_get_all_zones(self, sample_store: PropertyStore):
        assert len(sample_store.zones) == 1
