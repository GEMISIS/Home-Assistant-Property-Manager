"""Property Manager integration for Home Assistant."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .api import async_register_api
from .store import PropertyManagerStore
from .services import async_register_services

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[str] = ["sensor"]


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Property Manager from a config entry."""
    hass.data.setdefault(DOMAIN, {})

    store = PropertyManagerStore(hass)
    await store.async_load()

    hass.data[DOMAIN][entry.entry_id] = {
        "store": store,
    }

    # Register the frontend panel
    panel_url = str(Path(__file__).parent / "frontend" / "property-manager-panel.js")

    # Check if the panel JS has been built and exists
    hass.http.register_static_path(
        f"/property_manager/frontend",
        str(Path(__file__).parent / "frontend"),
        cache_headers=False,
    )

    hass.components.frontend.async_register_built_in_panel(
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
