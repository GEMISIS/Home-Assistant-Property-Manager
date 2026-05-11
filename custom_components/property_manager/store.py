"""Persistent storage for Property Manager using HA .storage."""

from __future__ import annotations

import logging
from datetime import UTC, datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION
from .models import Asset, MaintenanceLogEntry, Photo, Property, PropertyStore, Zone

_LOGGER = logging.getLogger(__name__)


class PropertyManagerStore:
    """Manage persistent storage for property data."""

    def __init__(self, hass: HomeAssistant, entry_id: str = "") -> None:
        self._hass = hass
        suffix = f".{entry_id}" if entry_id else ".data"
        self._store = Store[dict[str, Any]](
            hass, STORAGE_VERSION, f"{STORAGE_KEY}{suffix}"
        )
        self._data: PropertyStore = PropertyStore()

    @property
    def data(self) -> PropertyStore:
        """Return the current property data."""
        return self._data

    async def async_load(self) -> None:
        """Load data from storage."""
        stored = await self._store.async_load()
        if stored is not None:
            self._data = PropertyStore.from_dict(stored)
            _LOGGER.debug("Loaded property data with %d assets", len(self._data.assets))
        else:
            self._data = PropertyStore()
            _LOGGER.debug("No existing property data found, starting fresh")

    async def async_save(self) -> None:
        """Save data to storage."""
        await self._store.async_save(self._data.to_dict())
        _LOGGER.debug("Saved property data with %d assets", len(self._data.assets))

    # --- Asset CRUD ---

    async def async_add_asset(self, asset_data: dict[str, Any]) -> Asset:
        """Add a new asset."""
        asset = Asset.from_dict(asset_data)
        self._data.assets.append(asset)
        await self.async_save()
        return asset

    async def async_update_asset(
        self, asset_id: str, updates: dict[str, Any]
    ) -> Asset | None:
        """Update an existing asset by ID."""
        for i, asset in enumerate(self._data.assets):
            if asset.id == asset_id:
                merged = {**asset.to_dict(), **updates, "id": asset_id}
                merged["updated"] = datetime.now(UTC).isoformat()
                updated = Asset.from_dict(merged)
                self._data.assets[i] = updated
                await self.async_save()
                return updated
        return None

    async def async_remove_asset(self, asset_id: str) -> bool:
        """Remove an asset by ID."""
        for i, asset in enumerate(self._data.assets):
            if asset.id == asset_id:
                self._data.assets.pop(i)
                await self.async_save()
                return True
        return False

    def get_asset(self, asset_id: str) -> Asset | None:
        """Get a single asset by ID."""
        for asset in self._data.assets:
            if asset.id == asset_id:
                return asset
        return None

    def get_assets(self, category: str | None = None) -> list[Asset]:
        """Get all assets, optionally filtered by category."""
        if category:
            return [a for a in self._data.assets if a.category == category]
        return list(self._data.assets)

    # --- Zone CRUD ---

    def get_zone(self, zone_id: str) -> Zone | None:
        """Get a single zone by ID."""
        for zone in self._data.zones:
            if zone.id == zone_id:
                return zone
        return None

    def get_zones(self) -> list[Zone]:
        """Get all zones."""
        return list(self._data.zones)

    async def async_add_zone(self, zone_data: dict[str, Any]) -> Zone:
        """Add a new zone."""
        zone = Zone.from_dict(zone_data)
        self._data.zones.append(zone)
        await self.async_save()
        return zone

    async def async_update_zone(
        self, zone_id: str, updates: dict[str, Any]
    ) -> Zone | None:
        """Update an existing zone by ID."""
        for i, zone in enumerate(self._data.zones):
            if zone.id == zone_id:
                merged = {**zone.to_dict(), **updates, "id": zone_id}
                updated = Zone.from_dict(merged)
                self._data.zones[i] = updated
                await self.async_save()
                return updated
        return None

    async def async_remove_zone(self, zone_id: str) -> bool:
        """Remove a zone by ID."""
        for i, zone in enumerate(self._data.zones):
            if zone.id == zone_id:
                self._data.zones.pop(i)
                await self.async_save()
                return True
        return False

    # --- Maintenance Log ---

    async def async_add_maintenance_log(
        self, asset_id: str, entry_data: dict[str, Any]
    ) -> MaintenanceLogEntry | None:
        """Add a maintenance log entry to an asset."""
        for asset in self._data.assets:
            if asset.id == asset_id:
                entry = MaintenanceLogEntry.from_dict(entry_data)
                asset.maintenance_log.append(entry)
                await self.async_save()
                return entry
        return None

    # --- Photos ---

    async def async_add_photo(
        self, asset_id: str, photo_data: dict[str, Any]
    ) -> Photo | None:
        """Add a photo to an asset."""
        for asset in self._data.assets:
            if asset.id == asset_id:
                photo = Photo.from_dict(photo_data)
                asset.photos.append(photo)
                await self.async_save()
                return photo
        return None

    # --- Property ---

    async def async_update_property(self, updates: dict[str, Any]) -> None:
        """Update property-level settings."""
        prop_dict = {**self._data.property.to_dict(), **updates}
        self._data.property = Property.from_dict(prop_dict)
        await self.async_save()
