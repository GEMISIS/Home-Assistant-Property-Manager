"""Tests for the PropertyManagerStore.

Note: These tests require pytest-homeassistant-custom-component for the
full HA test harness. For now, we test the data-layer logic independently.
"""

from custom_components.property_manager.models import PropertyStore


class TestPropertyStoreDataLayer:
    """Test the PropertyStore data structure (no HA dependency)."""

    def test_add_asset_to_store(self, sample_store: PropertyStore):
        from custom_components.property_manager.models import Asset

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
        from custom_components.property_manager.models import Zone

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
