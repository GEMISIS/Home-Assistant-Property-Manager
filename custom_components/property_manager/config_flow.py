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

from .const import CONF_PROPERTY_NAME, CONF_LATITUDE, CONF_LONGITUDE, DOMAIN


class PropertyManagerConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Property Manager."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            location = user_input.get("location", {})
            if not location.get("latitude") or not location.get("longitude"):
                errors["location"] = "location_required"
                # Fall through to re-show form with errors
            else:
                entry_data = {
                    CONF_PROPERTY_NAME: user_input[CONF_PROPERTY_NAME],
                    CONF_LATITUDE: location["latitude"],
                    CONF_LONGITUDE: location["longitude"],
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
                    vol.Required(
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
