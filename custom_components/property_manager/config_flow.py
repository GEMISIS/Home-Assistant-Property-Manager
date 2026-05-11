"""Config flow for Property Manager integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.helpers.selector import (
    LocationSelector,
    LocationSelectorConfig,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .const import CONF_ADDRESS, CONF_PROPERTY_NAME, CONF_LATITUDE, CONF_LONGITUDE, DOMAIN


class PropertyManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Property Manager."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            # Only allow a single instance
            await self.async_set_unique_id(DOMAIN)
            self._abort_if_unique_id_configured()

            # Extract location from the location selector
            location = user_input.get("location", {})
            entry_data = {
                CONF_PROPERTY_NAME: user_input[CONF_PROPERTY_NAME],
                CONF_ADDRESS: user_input.get(CONF_ADDRESS, ""),
                CONF_LATITUDE: location.get("latitude", self.hass.config.latitude),
                CONF_LONGITUDE: location.get("longitude", self.hass.config.longitude),
            }

            return self.async_create_entry(
                title=entry_data[CONF_PROPERTY_NAME],
                data=entry_data,
            )

        # Default to HA's configured home location
        default_lat = self.hass.config.latitude
        default_lng = self.hass.config.longitude

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_PROPERTY_NAME, default="Home"): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                    vol.Optional(CONF_ADDRESS, default=""): TextSelector(
                        TextSelectorConfig(type=TextSelectorType.TEXT)
                    ),
                    vol.Optional(
                        "location",
                        default={
                            "latitude": default_lat,
                            "longitude": default_lng,
                            "radius": 50,
                        },
                    ): LocationSelector(LocationSelectorConfig(radius=True)),
                }
            ),
            errors=errors,
        )
