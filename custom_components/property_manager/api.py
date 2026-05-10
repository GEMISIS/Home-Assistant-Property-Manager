"""REST API views for Property Manager frontend communication."""

from __future__ import annotations

import json
import logging
from typing import Any

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant

from .const import DOMAIN
from .store import PropertyManagerStore

_LOGGER = logging.getLogger(__name__)


def _get_store(hass: HomeAssistant) -> PropertyManagerStore:
    """Get the store from hass.data."""
    for entry_data in hass.data.get(DOMAIN, {}).values():
        if "store" in entry_data:
            return entry_data["store"]
    raise web.HTTPServiceUnavailable(text="Property Manager not configured")


class PropertyManagerDataView(HomeAssistantView):
    """View to serve all property data to the frontend."""

    url = "/api/property_manager/data"
    name = "api:property_manager:data"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        return self.json(store.data.to_dict())


class PropertyManagerAssetsView(HomeAssistantView):
    """View for asset CRUD operations."""

    url = "/api/property_manager/assets"
    name = "api:property_manager:assets"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        category = request.query.get("category")
        assets = store.get_assets(category)
        return self.json([a.to_dict() for a in assets])

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        data = await request.json()
        asset = await store.async_add_asset(data)
        return self.json(asset.to_dict(), status_code=201)


class PropertyManagerAssetView(HomeAssistantView):
    """View for single asset operations."""

    url = "/api/property_manager/assets/{asset_id}"
    name = "api:property_manager:asset"

    async def get(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        asset = store.get_asset(asset_id)
        if asset is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json(asset.to_dict())

    async def put(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        data = await request.json()
        asset = await store.async_update_asset(asset_id, data)
        if asset is None:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json(asset.to_dict())

    async def delete(self, request: web.Request, asset_id: str) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        removed = await store.async_remove_asset(asset_id)
        if not removed:
            raise web.HTTPNotFound(text=f"Asset {asset_id} not found")
        return self.json({"status": "ok"})


class PropertyManagerZonesView(HomeAssistantView):
    """View for zone operations."""

    url = "/api/property_manager/zones"
    name = "api:property_manager:zones"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        return self.json([z.to_dict() for z in store.data.zones])

    async def post(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        data = await request.json()
        zone = await store.async_add_zone(data)
        return self.json(zone.to_dict(), status_code=201)


class PropertyManagerPropertyView(HomeAssistantView):
    """View for property-level settings."""

    url = "/api/property_manager/property"
    name = "api:property_manager:property"

    async def get(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        return self.json(store.data.property.to_dict())

    async def put(self, request: web.Request) -> web.Response:
        hass: HomeAssistant = request.app["hass"]
        store = _get_store(hass)
        data = await request.json()
        await store.async_update_property(data)
        return self.json(store.data.property.to_dict())


class PropertyManagerCategoriesView(HomeAssistantView):
    """View to serve asset category definitions."""

    url = "/api/property_manager/categories"
    name = "api:property_manager:categories"

    async def get(self, request: web.Request) -> web.Response:
        from .const import ASSET_CATEGORIES

        return self.json(ASSET_CATEGORIES)


def async_register_api(hass: HomeAssistant) -> None:
    """Register all Property Manager API views."""
    hass.http.register_view(PropertyManagerDataView)
    hass.http.register_view(PropertyManagerAssetsView)
    hass.http.register_view(PropertyManagerAssetView)
    hass.http.register_view(PropertyManagerZonesView)
    hass.http.register_view(PropertyManagerPropertyView)
    hass.http.register_view(PropertyManagerCategoriesView)
