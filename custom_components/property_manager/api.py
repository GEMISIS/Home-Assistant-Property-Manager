"""REST API views for Property Manager frontend communication."""

from __future__ import annotations

import json
import logging

from aiohttp import web
from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .store import PropertyManagerStore

_LOGGER = logging.getLogger(__name__)


async def _parse_json(request: web.Request) -> dict:
    """Parse JSON body, raising HTTPBadRequest on failure."""
    try:
        return await request.json()
    except (json.JSONDecodeError, ValueError) as err:
        raise web.HTTPBadRequest(text=f"Invalid JSON: {err}") from err


def _get_store(hass: HomeAssistant, request: web.Request) -> PropertyManagerStore:
    """Get the store from hass.data, using entry_id query param if provided."""
    entry_id = request.query.get("entry_id")
    domain_data = hass.data.get(DOMAIN, {})

    if entry_id:
        entry_data = domain_data.get(entry_id)
        if isinstance(entry_data, dict) and "store" in entry_data:
            return entry_data["store"]
        raise web.HTTPNotFound(text=f"Property entry {entry_id} not found")

    # Fall back to first available entry
    for key, entry_data in domain_data.items():
        if key.startswith("_"):
            continue
        if isinstance(entry_data, dict) and "store" in entry_data:
            return entry_data["store"]
    raise web.HTTPServiceUnavailable(text="Property Manager not configured")


class PropertyManagerEntriesView(HomeAssistantView):
    """View to list all configured property entries."""

    url = "/api/property_manager/entries"
    name = "api:property_manager:entries"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        entries = []
        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            if entry_id.startswith("_"):
                continue
            if isinstance(entry_data, dict) and "store" in entry_data:
                store: PropertyManagerStore = entry_data["store"]
                entries.append({
                    "entry_id": entry_id,
                    "property_name": store.data.property.name,
                })
        return self.json(entries)


class PropertyManagerDataView(HomeAssistantView):
    """View to serve all property data to the frontend."""

    url = "/api/property_manager/data"
    name = "api:property_manager:data"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        return self.json(store.data.to_dict())


class PropertyManagerAssetsView(HomeAssistantView):
    """View for asset CRUD operations."""

    url = "/api/property_manager/assets"
    name = "api:property_manager:assets"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        category = request.query.get("category")
        assets = store.get_assets(category)
        return self.json([a.to_dict() for a in assets])

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        data = await _parse_json(request)
        asset = await store.async_add_asset(data)
        return self.json(asset.to_dict(), status_code=201)


class PropertyManagerAssetView(HomeAssistantView):
    """View for single asset operations."""

    url = "/api/property_manager/assets/{asset_id}"
    name = "api:property_manager:asset"

    async def get(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        asset = store.get_asset(asset_id)
        if asset is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json(asset.to_dict())

    async def put(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        data = await _parse_json(request)
        asset = await store.async_update_asset(asset_id, data)
        if asset is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json(asset.to_dict())

    async def delete(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        removed = await store.async_remove_asset(asset_id)
        if not removed:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json({"status": "ok"})


class PropertyManagerZonesView(HomeAssistantView):
    """View for zone list/create operations."""

    url = "/api/property_manager/zones"
    name = "api:property_manager:zones"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        return self.json([z.to_dict() for z in store.data.zones])

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        data = await _parse_json(request)
        zone = await store.async_add_zone(data)
        return self.json(zone.to_dict(), status_code=201)


class PropertyManagerZoneView(HomeAssistantView):
    """View for single zone operations."""

    url = "/api/property_manager/zones/{zone_id}"
    name = "api:property_manager:zone"

    async def get(self, request: web.Request, zone_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        zone = store.get_zone(zone_id)
        if zone is None:
            raise web.HTTPNotFound(text=f"Zone {zone_id} not found")
        return self.json(zone.to_dict())

    async def put(self, request: web.Request, zone_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        data = await _parse_json(request)
        zone = await store.async_update_zone(zone_id, data)
        if zone is None:
            raise web.HTTPNotFound(text=f"Zone {zone_id} not found")
        return self.json(zone.to_dict())

    async def delete(self, request: web.Request, zone_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        removed = await store.async_remove_zone(zone_id)
        if not removed:
            raise web.HTTPNotFound(text=f"Zone {zone_id} not found")
        return self.json({"status": "ok"})


class PropertyManagerPropertyView(HomeAssistantView):
    """View for property-level settings."""

    url = "/api/property_manager/property"
    name = "api:property_manager:property"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        return self.json(store.data.property.to_dict())

    async def put(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        data = await _parse_json(request)
        await store.async_update_property(data)
        return self.json(store.data.property.to_dict())


class PropertyManagerCategoriesView(HomeAssistantView):
    """View to serve asset category definitions."""

    url = "/api/property_manager/categories"
    name = "api:property_manager:categories"

    async def get(self, request: web.Request) -> web.Response:
        from .const import ASSET_CATEGORIES

        return self.json(ASSET_CATEGORIES)


class PropertyManagerMaintenanceLogView(HomeAssistantView):
    """View for adding maintenance log entries to an asset."""

    url = "/api/property_manager/assets/{asset_id}/maintenance"
    name = "api:property_manager:asset:maintenance"

    async def get(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        asset = store.get_asset(asset_id)
        if asset is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json([m.to_dict() for m in asset.maintenance_log])

    async def post(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        data = await _parse_json(request)
        entry = await store.async_add_maintenance_log(asset_id, data)
        if entry is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json(entry.to_dict(), status_code=201)


class PropertyManagerPhotosView(HomeAssistantView):
    """View for managing asset photos."""

    url = "/api/property_manager/assets/{asset_id}/photos"
    name = "api:property_manager:asset:photos"

    async def get(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        asset = store.get_asset(asset_id)
        if asset is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json([p.to_dict() for p in asset.photos])

    async def post(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass, request)
        data = await _parse_json(request)
        photo = await store.async_add_photo(asset_id, data)
        if photo is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json(photo.to_dict(), status_code=201)


def async_register_api(hass: HomeAssistant) -> None:
    """Register all Property Manager API views."""
    hass.http.register_view(PropertyManagerEntriesView)
    hass.http.register_view(PropertyManagerDataView)
    hass.http.register_view(PropertyManagerAssetsView)
    hass.http.register_view(PropertyManagerAssetView)
    hass.http.register_view(PropertyManagerZonesView)
    hass.http.register_view(PropertyManagerZoneView)
    hass.http.register_view(PropertyManagerPropertyView)
    hass.http.register_view(PropertyManagerCategoriesView)
    hass.http.register_view(PropertyManagerMaintenanceLogView)
    hass.http.register_view(PropertyManagerPhotosView)
