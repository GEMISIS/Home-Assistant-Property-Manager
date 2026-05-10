"""Sensor platform for Property Manager."""

from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, STATUS_NEEDS_ATTENTION, STATUS_OVERDUE
from .store import PropertyManagerStore


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Property Manager sensor platform."""
    store: PropertyManagerStore = hass.data[DOMAIN][entry.entry_id]["store"]

    async_add_entities(
        [
            PropertyAssetCountSensor(store, entry),
            PropertyAttentionSensor(store, entry),
        ],
        update_before_add=True,
    )


class PropertyAssetCountSensor(SensorEntity):
    """Sensor showing total number of tracked assets."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:map-marker-multiple"

    def __init__(self, store: PropertyManagerStore, entry: ConfigEntry) -> None:
        self._store = store
        self._attr_unique_id = f"{entry.entry_id}_asset_count"
        self._attr_name = "Property Assets"

    @property
    def native_value(self) -> int:
        return len(self._store.data.assets)

    @property
    def extra_state_attributes(self) -> dict[str, int]:
        categories: dict[str, int] = {}
        for asset in self._store.data.assets:
            categories[asset.category] = categories.get(asset.category, 0) + 1
        return {"categories": categories, "zones": len(self._store.data.zones)}


class PropertyAttentionSensor(SensorEntity):
    """Sensor showing number of assets needing attention."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:alert-circle-outline"

    def __init__(self, store: PropertyManagerStore, entry: ConfigEntry) -> None:
        self._store = store
        self._attr_unique_id = f"{entry.entry_id}_attention_count"
        self._attr_name = "Property Attention Needed"

    @property
    def native_value(self) -> int:
        return sum(
            1
            for a in self._store.data.assets
            if a.status in (STATUS_NEEDS_ATTENTION, STATUS_OVERDUE)
        )
