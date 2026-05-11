"""Property Manager integration for Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .api import async_register_api
from .const import DOMAIN
from .coordinator import PropertyManagerCoordinator
from .services import async_register_services
from .store import PropertyManagerStore

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[str] = ["sensor"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Property Manager from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    store = PropertyManagerStore(hass)
    await store.async_load()

    # Populate property with config entry data on first setup
    if not store.data.property.latitude:
        store.data.property.name = entry.data.get("property_name", "Home")
        store.data.property.address = entry.data.get("address", "")
        store.data.property.latitude = entry.data.get("latitude")
        store.data.property.longitude = entry.data.get("longitude")
        await store.async_save()

    coordinator = PropertyManagerCoordinator(hass, store)
    await coordinator.async_config_entry_first_refresh()

    hass.data[DOMAIN][entry.entry_id] = {
        "store": store,
        "coordinator": coordinator,
    }

    # Register the frontend panel
    frontend_dir = str(Path(__file__).parent / "frontend")

    from homeassistant.components.http import StaticPathConfig

    await hass.http.async_register_static_paths(
        [StaticPathConfig("/property_manager/frontend", frontend_dir, cache_headers=False)]
    )

    from homeassistant.components.frontend import (
        async_register_built_in_panel,
        async_remove_panel,
    )

    # Remove existing panel if re-loading (prevents "Overwriting panel" error)
    try:
        async_remove_panel(hass, "property-manager")
    except (ValueError, KeyError):
        pass  # Panel doesn't exist yet, that's fine

    async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Property Map",
        sidebar_icon="mdi:map-marker-radius",
        frontend_url_path="property-manager",
        config={
            "_panel_custom": {
                "name": "property-manager-panel",
                "module_url": "/property_manager/frontend/property-manager-panel.js",
            }
        },
        require_admin=False,
    )

    # Register services and API
    await async_register_services(hass)
    async_register_api(hass)

    # Set up platforms
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    if unload_ok:
        hass.data[DOMAIN].pop(entry.entry_id)

    return unload_ok
