"""Data update coordinator for Property Manager."""

from __future__ import annotations

import logging
from datetime import timedelta
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from .const import DOMAIN
from .store import PropertyManagerStore

_LOGGER = logging.getLogger(__name__)

UPDATE_INTERVAL = timedelta(minutes=30)


class PropertyManagerCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Coordinator to manage property data refresh."""

    def __init__(self, hass: HomeAssistant, store: PropertyManagerStore) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=UPDATE_INTERVAL,
        )
        self._store = store

    async def _async_update_data(self) -> dict[str, Any]:
        """Fetch data from the store."""
        return self._store.data.to_dict()
