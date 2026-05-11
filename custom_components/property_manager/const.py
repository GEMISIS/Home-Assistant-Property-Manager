"""Constants for the Property Manager integration."""

from __future__ import annotations

DOMAIN = "property_manager"
STORAGE_KEY = "property_manager"
STORAGE_VERSION = 1

CONF_PROPERTY_NAME = "property_name"
CONF_ADDRESS = "address"
CONF_LATITUDE = "latitude"
CONF_LONGITUDE = "longitude"

# Asset geometry types
GEOMETRY_POINT = "Point"
GEOMETRY_LINE = "LineString"
GEOMETRY_POLYGON = "Polygon"

# Asset categories
CATEGORY_STRUCTURES = "structures"
CATEGORY_LANDSCAPING = "landscaping"
CATEGORY_WATER = "water"
CATEGORY_UTILITIES = "utilities"
CATEGORY_PEST_CONTROL = "pest_control"
CATEGORY_PATHS = "paths_access"
CATEGORY_LIGHTING = "lighting"
CATEGORY_RECREATION = "recreation"
CATEGORY_VEHICLES = "vehicles"
CATEGORY_SEPTIC = "septic"
CATEGORY_WELL = "well_water"
CATEGORY_HVAC_MINI_SPLIT = "hvac_mini_split"
CATEGORY_HVAC_AC = "hvac_ac"
CATEGORY_CUSTOM = "custom"

ASSET_CATEGORIES: dict[str, dict[str, str]] = {
    CATEGORY_STRUCTURES: {
        "name": "Structures",
        "icon": "mdi:home-outline",
        "color": "#78909C",
    },
    CATEGORY_LANDSCAPING: {
        "name": "Landscaping",
        "icon": "mdi:tree",
        "color": "#66BB6A",
    },
    CATEGORY_WATER: {
        "name": "Water / Irrigation",
        "icon": "mdi:water",
        "color": "#42A5F5",
    },
    CATEGORY_UTILITIES: {
        "name": "Utilities",
        "icon": "mdi:flash",
        "color": "#FFA726",
    },
    CATEGORY_PEST_CONTROL: {
        "name": "Pest Control",
        "icon": "mdi:bug",
        "color": "#FDD835",
    },
    CATEGORY_PATHS: {
        "name": "Paths & Access",
        "icon": "mdi:walk",
        "color": "#A1887F",
    },
    CATEGORY_LIGHTING: {
        "name": "Lighting",
        "icon": "mdi:lightbulb-outline",
        "color": "#FFB300",
    },
    CATEGORY_RECREATION: {
        "name": "Recreation",
        "icon": "mdi:basketball",
        "color": "#AB47BC",
    },
    CATEGORY_VEHICLES: {
        "name": "Vehicles",
        "icon": "mdi:car",
        "color": "#78909C",
    },
    CATEGORY_SEPTIC: {
        "name": "Septic Systems",
        "icon": "mdi:pipe",
        "color": "#8D6E63",
    },
    CATEGORY_WELL: {
        "name": "Well / Water Well",
        "icon": "mdi:water-well",
        "color": "#0288D1",
    },
    CATEGORY_HVAC_MINI_SPLIT: {
        "name": "Mini-Split (Outdoor)",
        "icon": "mdi:hvac",
        "color": "#26A69A",
    },
    CATEGORY_HVAC_AC: {
        "name": "AC Condenser (Outdoor)",
        "icon": "mdi:air-conditioner",
        "color": "#5C6BC0",
    },
    CATEGORY_CUSTOM: {
        "name": "Custom",
        "icon": "mdi:map-marker",
        "color": "#9E9E9E",
    },
}

# Asset statuses
STATUS_ACTIVE = "active"
STATUS_INACTIVE = "inactive"
STATUS_NEEDS_ATTENTION = "needs_attention"
STATUS_OVERDUE = "overdue"

ASSET_STATUSES = [STATUS_ACTIVE, STATUS_INACTIVE, STATUS_NEEDS_ATTENTION, STATUS_OVERDUE]
