"""Config flow for Property Manager integration."""

from __future__ import annotations

from typing import Any

import voluptuous as vol
from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import CONF_ADDRESS, CONF_PROPERTY_NAME, DOMAIN


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

            return self.async_create_entry(
                title=user_input[CONF_PROPERTY_NAME],
                data=user_input,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_PROPERTY_NAME, default="Home"): str,
                    vol.Optional(CONF_ADDRESS, default=""): str,
                }
            ),
            errors=errors,
        )
