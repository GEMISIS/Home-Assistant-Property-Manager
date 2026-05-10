"""Service handlers for Property Manager."""

from __future__ import annotations

import logging

import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall

from .const import DOMAIN
from .store import PropertyManagerStore

_LOGGER = logging.getLogger(__name__)

SERVICE_ADD_ASSET = "add_asset"
SERVICE_UPDATE_ASSET = "update_asset"
SERVICE_REMOVE_ASSET = "remove_asset"
SERVICE_ADD_ZONE = "add_zone"
SERVICE_UPDATE_ZONE = "update_zone"
SERVICE_REMOVE_ZONE = "remove_zone"
SERVICE_UPDATE_PROPERTY = "update_property"
SERVICE_LOG_MAINTENANCE = "log_maintenance"
SERVICE_ADD_PHOTO = "add_photo"


def _get_store(hass: HomeAssistant) -> PropertyManagerStore:
    """Get the property manager store from hass.data."""
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if "store" in entry_data:
            return entry_data["store"]
    raise ValueError("Property Manager not configured")


async def async_register_services(hass: HomeAssistant) -> None:
    """Register Property Manager services."""

    async def handle_add_asset(call: ServiceCall) -> None:
        store = _get_store(hass)
        asset = await store.async_add_asset(call.data)
        _LOGGER.info("Added asset: %s (%s)", asset.name, asset.id)

    async def handle_update_asset(call: ServiceCall) -> None:
        store = _get_store(hass)
        asset_id = call.data["asset_id"]
        updates = {k: v for k, v in call.data.items() if k != "asset_id"}
        result = await store.async_update_asset(asset_id, updates)
        if result is None:
            _LOGGER.warning("Asset not found: %s", asset_id)

    async def handle_remove_asset(call: ServiceCall) -> None:
        store = _get_store(hass)
        asset_id = call.data["asset_id"]
        removed = await store.async_remove_asset(asset_id)
        if not removed:
            _LOGGER.warning("Asset not found: %s", asset_id)

    async def handle_add_zone(call: ServiceCall) -> None:
        store = _get_store(hass)
        zone = await store.async_add_zone(call.data)
        _LOGGER.info("Added zone: %s (%s)", zone.name, zone.id)

    async def handle_update_zone(call: ServiceCall) -> None:
        store = _get_store(hass)
        zone_id = call.data["zone_id"]
        updates = {k: v for k, v in call.data.items() if k != "zone_id"}
        result = await store.async_update_zone(zone_id, updates)
        if result is None:
            _LOGGER.warning("Zone not found: %s", zone_id)

    async def handle_remove_zone(call: ServiceCall) -> None:
        store = _get_store(hass)
        zone_id = call.data["zone_id"]
        removed = await store.async_remove_zone(zone_id)
        if not removed:
            _LOGGER.warning("Zone not found: %s", zone_id)

    async def handle_update_property(call: ServiceCall) -> None:
        store = _get_store(hass)
        await store.async_update_property(dict(call.data))
        _LOGGER.info("Updated property settings")

    async def handle_log_maintenance(call: ServiceCall) -> None:
        store = _get_store(hass)
        asset_id = call.data["asset_id"]
        entry_data = {k: v for k, v in call.data.items() if k != "asset_id"}
        result = await store.async_add_maintenance_log(asset_id, entry_data)
        if result is None:
            _LOGGER.warning("Asset not found for maintenance log: %s", asset_id)
        else:
            _LOGGER.info("Logged maintenance for asset: %s", asset_id)

    async def handle_add_photo(call: ServiceCall) -> None:
        store = _get_store(hass)
        asset_id = call.data["asset_id"]
        photo_data = {k: v for k, v in call.data.items() if k != "asset_id"}
        result = await store.async_add_photo(asset_id, photo_data)
        if result is None:
            _LOGGER.warning("Asset not found for photo: %s", asset_id)
        else:
            _LOGGER.info("Added photo to asset: %s", asset_id)

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_ASSET,
        handle_add_asset,
        schema=vol.Schema(
            {
                vol.Required("name"): str,
                vol.Optional("type", default=""): str,
                vol.Optional("category", default="custom"): str,
                vol.Optional("geometry"): dict,
                vol.Optional("status", default="active"): str,
                vol.Optional("metadata"): dict,
                vol.Optional("linked_entities"): list,
            },
            extra=vol.ALLOW_EXTRA,
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_ASSET,
        handle_update_asset,
        schema=vol.Schema(
            {vol.Required("asset_id"): str},
            extra=vol.ALLOW_EXTRA,
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_ASSET,
        handle_remove_asset,
        schema=vol.Schema({vol.Required("asset_id"): str}),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_ZONE,
        handle_add_zone,
        schema=vol.Schema(
            {
                vol.Required("name"): str,
                vol.Optional("category", default="custom"): str,
                vol.Optional("geometry"): dict,
                vol.Optional("color", default="#9E9E9E"): str,
                vol.Optional("metadata"): dict,
            },
            extra=vol.ALLOW_EXTRA,
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_ZONE,
        handle_update_zone,
        schema=vol.Schema(
            {vol.Required("zone_id"): str},
            extra=vol.ALLOW_EXTRA,
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_REMOVE_ZONE,
        handle_remove_zone,
        schema=vol.Schema({vol.Required("zone_id"): str}),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_UPDATE_PROPERTY,
        handle_update_property,
        schema=vol.Schema({}, extra=vol.ALLOW_EXTRA),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_LOG_MAINTENANCE,
        handle_log_maintenance,
        schema=vol.Schema(
            {
                vol.Required("asset_id"): str,
                vol.Required("action"): str,
                vol.Optional("date", default=""): str,
                vol.Optional("notes", default=""): str,
            }
        ),
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_ADD_PHOTO,
        handle_add_photo,
        schema=vol.Schema(
            {
                vol.Required("asset_id"): str,
                vol.Required("path"): str,
                vol.Optional("caption", default=""): str,
                vol.Optional("taken", default=""): str,
            }
        ),
    )
