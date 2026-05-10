# Property Manager for Home Assistant

An interactive property map inside Home Assistant where homeowners can plot, track, and monitor everything on their property — fences, trees, sprinkler zones, pest traps, paths, garden beds, utility lines, lighting, and more.

**GIS-lite purpose-built for residential properties, deeply integrated with Home Assistant.**

## Features

- **Interactive Leaflet map** with satellite and schematic view modes
- **Asset tracking** with categories: structures, landscaping, water/irrigation, utilities, pest control, paths, lighting, recreation, vehicles, septic, wells, HVAC, and custom
- **Draw tools** for placing points, lines, and polygons on your property
- **HA entity linking** — connect map assets to Home Assistant entities for live state and control
- **Maintenance scheduling** with seasonal awareness and overdue tracking
- **Two-point scale calibration** for spatially accurate measurements
- **GeoJSON parcel import** for setting your property boundary
- **Canvas 2D schematic renderer** with SVG export
- **Dashboard card** for Lovelace showing asset counts and attention items
- **REST API** for frontend communication

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant
2. Go to **Integrations** > **Custom Repositories**
3. Add this repository URL and select **Integration** as the category
4. Click **Install**
5. Restart Home Assistant

### Manual

1. Copy `custom_components/property_manager/` to your HA `custom_components/` directory
2. Build the frontend (see Development below) and ensure the JS is in `custom_components/property_manager/frontend/`
3. Restart Home Assistant

### Setup

1. Go to **Settings** > **Devices & Services** > **Add Integration**
2. Search for **Property Manager**
3. Enter your property name and optional address
4. The Property Manager panel appears in your HA sidebar

## Development

### Prerequisites

- Python 3.12+
- Node.js 18+
- A Home Assistant development environment (or `pytest-homeassistant-custom-component`)

### Backend

```bash
# Create a virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Lint
ruff check custom_components/ tests/
ruff format custom_components/ tests/

# Type check
mypy custom_components/property_manager/
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Development build (with watch)
npm run dev

# Production build
npm run build

# Type check
npm run typecheck
```

The Rollup build outputs the bundled panel JS to `custom_components/property_manager/frontend/property-manager-panel.js`.

### Pre-commit Hooks

```bash
pip install pre-commit
pre-commit install
```

## Architecture

```
ha-property-manager/
├── custom_components/property_manager/   # HA integration (Python)
│   ├── __init__.py          # Integration setup, panel registration
│   ├── config_flow.py       # Setup wizard
│   ├── models.py            # Asset, Zone, Property data models
│   ├── store.py             # Persistent .storage JSON layer
│   ├── services.py          # HA service handlers (CRUD)
│   ├── api.py               # REST API views for frontend
│   ├── sensor.py            # Asset count + attention sensors
│   ├── gis.py               # Coordinate math, GeoJSON import
│   ├── schedule_engine.py   # Maintenance scheduling logic
│   └── frontend/            # Built JS output
├── frontend/                # TypeScript + Lit source
│   ├── src/
│   │   ├── property-manager-panel.ts   # Main panel
│   │   ├── map-engine.ts              # Leaflet wrapper
│   │   ├── asset-detail.ts            # Asset detail panel
│   │   ├── schematic-renderer.ts      # Canvas 2D renderer
│   │   ├── dashboard-card.ts          # Lovelace card
│   │   ├── models.ts                  # TypeScript types
│   │   └── styles.ts                  # Shared styles
│   ├── rollup.config.js
│   └── tsconfig.json
├── tests/                   # pytest test suite
├── hacs.json               # HACS distribution manifest
└── pyproject.toml          # Python project config
```

## Asset Categories

| Category | Color | Examples |
|----------|-------|---------|
| Structures | Gray | Deck, shed, fence, retaining wall |
| Landscaping | Green | Trees, garden beds, lawn zones |
| Water / Irrigation | Blue | Sprinkler heads, valves, hose bibs |
| Utilities | Orange | Electrical outlets, gas lines |
| Pest Control | Yellow | Wasp traps, ant bait, rodent stations |
| Paths & Access | Brown | Walkways, driveways, gates |
| Lighting | Amber | Outdoor lights, solar stakes |
| Recreation | Purple | Play structures, fire pit, pool |
| Vehicles | Slate | Parking spots, EV charger |
| Septic Systems | Brown | Septic tanks, drain fields |
| Well / Water Well | Deep Blue | Well heads, pressure tanks |
| Mini-Split (Outdoor) | Teal | Outdoor mini-split units |
| AC Condenser | Indigo | Traditional AC outdoor units |
| Custom | Gray | Anything else |

## Services

| Service | Description |
|---------|-------------|
| `property_manager.add_asset` | Add a new asset to the map |
| `property_manager.update_asset` | Update an existing asset |
| `property_manager.remove_asset` | Remove an asset |
| `property_manager.add_zone` | Add a new zone |
| `property_manager.update_zone` | Update an existing zone |
| `property_manager.remove_zone` | Remove a zone |
| `property_manager.update_property` | Update property settings |

## REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/property_manager/data` | GET | All property data |
| `/api/property_manager/assets` | GET, POST | List/create assets |
| `/api/property_manager/assets/{id}` | GET, PUT, DELETE | Single asset CRUD |
| `/api/property_manager/zones` | GET, POST | List/create zones |
| `/api/property_manager/property` | GET, PUT | Property settings |
| `/api/property_manager/categories` | GET | Category definitions |

## License

MIT
