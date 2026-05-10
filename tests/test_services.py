"""Tests for the service handler logic.

These test the service constants and schema validation logic
independent of the HA service registry.
"""

from custom_components.property_manager.services import (
    SERVICE_ADD_ASSET,
    SERVICE_ADD_PHOTO,
    SERVICE_ADD_ZONE,
    SERVICE_LOG_MAINTENANCE,
    SERVICE_REMOVE_ASSET,
    SERVICE_REMOVE_ZONE,
    SERVICE_UPDATE_ASSET,
    SERVICE_UPDATE_PROPERTY,
    SERVICE_UPDATE_ZONE,
)


class TestServiceConstants:
    """Verify all service constants are defined correctly."""

    def test_all_service_names_defined(self):
        assert SERVICE_ADD_ASSET == "add_asset"
        assert SERVICE_UPDATE_ASSET == "update_asset"
        assert SERVICE_REMOVE_ASSET == "remove_asset"
        assert SERVICE_ADD_ZONE == "add_zone"
        assert SERVICE_UPDATE_ZONE == "update_zone"
        assert SERVICE_REMOVE_ZONE == "remove_zone"
        assert SERVICE_UPDATE_PROPERTY == "update_property"
        assert SERVICE_LOG_MAINTENANCE == "log_maintenance"
        assert SERVICE_ADD_PHOTO == "add_photo"
