"""
Standalone dev server for Property Manager frontend.
Mocks the HA API so the panel can be tested without Home Assistant.

Usage: python dev-server/server.py
Then open http://localhost:8125
"""

import json
import uuid
from datetime import datetime
from pathlib import Path
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PROJECT_ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = PROJECT_ROOT / "custom_components" / "property_manager" / "frontend"
print(f"DEBUG: FRONTEND_DIR = {FRONTEND_DIR}, exists = {FRONTEND_DIR.exists()}")

# In-memory mock data
MOCK_DATA = {
    "version": 1,
    "property": {
        "name": "Home",
        "boundary": [],
        "calibration": {"scale_factor": 1.0, "point_a": None, "point_b": None},
        "address": "",
        "timezone": "America/Los_Angeles",
        "latitude": 47.6101,
        "longitude": -122.2015,
    },
    "assets": [],
    "zones": [],
}

MOCK_ENTRIES = [
    {"entry_id": "mock_entry_1", "property_name": "Home"}
]

MOCK_CATEGORIES = {
    "structures": {"name": "Structures", "icon": "mdi:home-outline", "color": "#78909C"},
    "landscaping": {"name": "Landscaping", "icon": "mdi:tree", "color": "#66BB6A"},
    "water": {"name": "Water / Irrigation", "icon": "mdi:water", "color": "#42A5F5"},
    "utilities": {"name": "Utilities", "icon": "mdi:flash", "color": "#FFA726"},
    "pest_control": {"name": "Pest Control", "icon": "mdi:bug", "color": "#FDD835"},
    "paths_access": {"name": "Paths & Access", "icon": "mdi:walk", "color": "#A1887F"},
    "lighting": {"name": "Lighting", "icon": "mdi:lightbulb-outline", "color": "#FFB300"},
    "recreation": {"name": "Recreation", "icon": "mdi:basketball", "color": "#AB47BC"},
    "vehicles": {"name": "Vehicles", "icon": "mdi:car", "color": "#78909C"},
    "septic": {"name": "Septic Systems", "icon": "mdi:pipe", "color": "#8D6E63"},
    "well_water": {"name": "Well / Water Well", "icon": "mdi:water-well", "color": "#0288D1"},
    "hvac_mini_split": {"name": "Mini-Split (Outdoor)", "icon": "mdi:hvac", "color": "#26A69A"},
    "hvac_ac": {"name": "AC Condenser (Outdoor)", "icon": "mdi:air-conditioner", "color": "#5C6BC0"},
    "custom": {"name": "Custom", "icon": "mdi:map-marker", "color": "#9E9E9E"},
}


DEV_HTML = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Property Manager — Dev</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; width: 100%; }
        body {
            font-family: Roboto, sans-serif;
            --primary-font-family: Roboto, sans-serif;
            --primary-background-color: #fafafa;
            --card-background-color: #ffffff;
            --primary-text-color: #212121;
            --secondary-text-color: #757575;
            --divider-color: #e0e0e0;
        }
        property-manager-panel {
            display: block;
            height: 100vh;
            width: 100vw;
        }
        #error-log {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            max-height: 200px;
            overflow-y: auto;
            background: #1a1a1a;
            color: #ff6b6b;
            font-family: monospace;
            font-size: 12px;
            padding: 8px;
            z-index: 99999;
            display: none;
        }
        #error-log.has-errors { display: block; }
        #error-log .error { padding: 2px 0; border-bottom: 1px solid #333; }
        #error-log .warn { color: #ffa726; }
        #error-log .info { color: #64b5f6; }
    </style>
</head>
<body>
    <property-manager-panel></property-manager-panel>
    <div id="error-log"></div>
    <script>
        // Capture console errors for display
        const errorLog = document.getElementById('error-log');
        function logToPanel(msg, cls) {
            errorLog.classList.add('has-errors');
            const div = document.createElement('div');
            div.className = cls;
            div.textContent = new Date().toLocaleTimeString() + ' ' + msg;
            errorLog.appendChild(div);
            errorLog.scrollTop = errorLog.scrollHeight;
        }
        const origError = console.error;
        const origWarn = console.warn;
        console.error = function(...args) {
            logToPanel(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'error');
            origError.apply(console, args);
        };
        console.warn = function(...args) {
            logToPanel(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), 'warn');
            origWarn.apply(console, args);
        };
        window.addEventListener('error', (e) => {
            logToPanel('UNCAUGHT: ' + e.message + ' at ' + e.filename + ':' + e.lineno, 'error');
        });
        window.addEventListener('unhandledrejection', (e) => {
            logToPanel('UNHANDLED PROMISE: ' + e.reason, 'error');
        });

        // Mock HA hass object
        const mockHass = {
            callApi: async function(method, path, data) {
                const url = '/api/' + path;
                const opts = { method, headers: { 'Content-Type': 'application/json' } };
                if (data) opts.body = JSON.stringify(data);
                const resp = await fetch(url, opts);
                if (!resp.ok) throw new Error('API ' + method + ' ' + path + ': ' + resp.status);
                return resp.json();
            },
            states: {},
            connection: {
                subscribeEvents: async function(cb, type) { return function() {}; }
            }
        };

        // Load the panel
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/property_manager/frontend/property-manager-panel.js';
        script.onload = function() {
            console.info('Panel script loaded');
            const panel = document.querySelector('property-manager-panel');
            if (panel) {
                panel.hass = mockHass;
                panel.narrow = window.innerWidth < 768;
                window.addEventListener('resize', () => {
                    panel.narrow = window.innerWidth < 768;
                });
                console.info('Panel initialized with mock hass, narrow=' + panel.narrow);
            } else {
                console.error('property-manager-panel element not found in DOM');
            }
        };
        script.onerror = function(e) {
            console.error('Failed to load panel script: ' + e);
        };
        document.head.appendChild(script);
    </script>
</body>
</html>"""


class DevHandler(SimpleHTTPRequestHandler):
    """Handler that serves the dev page, static frontend files, and mock API."""

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # Dev page
        if path == "/" or path == "/property-manager":
            self._send_json_or_html(DEV_HTML, "text/html")
            return

        # Static frontend files
        if path.startswith("/property_manager/frontend/"):
            rel = path[len("/property_manager/frontend/"):]
            file_path = FRONTEND_DIR / rel
            print(f"  STATIC: rel={rel}, file_path={file_path}, is_file={file_path.is_file()}")
            if file_path.is_file():
                content_type = self._guess_type(file_path)
                self._send_file(file_path, content_type)
                return
            self.send_error(404, f"File not found: {rel}")
            return

        # Mock API endpoints
        if path == "/api/property_manager/data":
            self._send_json(MOCK_DATA)
            return
        if path == "/api/property_manager/entries":
            self._send_json(MOCK_ENTRIES)
            return
        if path == "/api/property_manager/categories":
            self._send_json(MOCK_CATEGORIES)
            return
        if path == "/api/property_manager/assets":
            category = query.get("category", [None])[0]
            assets = MOCK_DATA["assets"]
            if category:
                assets = [a for a in assets if a.get("category") == category]
            self._send_json(assets)
            return
        if path == "/api/property_manager/zones":
            self._send_json(MOCK_DATA["zones"])
            return
        if path == "/api/property_manager/property":
            self._send_json(MOCK_DATA["property"])
            return

        self.send_error(404)

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_len = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_len)) if content_len else {}

        if path == "/api/property_manager/assets":
            asset = {
                "id": str(uuid.uuid4()),
                "name": body.get("name", "New Asset"),
                "category": body.get("category", "custom"),
                "geometry": body.get("geometry", {}),
                "status": body.get("status", "active"),
                "description": body.get("description", ""),
                "ha_entity_id": None,
                "tags": [],
                "photos": [],
                "schedules": [],
                "maintenance_log": [],
                "created": datetime.now().isoformat(),
                "updated": datetime.now().isoformat(),
            }
            MOCK_DATA["assets"].append(asset)
            self._send_json(asset, 201)
            return

        if path == "/api/property_manager/zones":
            zone = {
                "id": str(uuid.uuid4()),
                "name": body.get("name", "New Zone"),
                "category": body.get("category", "custom"),
                "geometry": body.get("geometry", {}),
                "color": body.get("color", "#9E9E9E"),
            }
            MOCK_DATA["zones"].append(zone)
            self._send_json(zone, 201)
            return

        self.send_error(404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_len = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(content_len)) if content_len else {}

        # Asset update
        parts = path.split("/")
        if len(parts) >= 5 and parts[2] == "property_manager" and parts[3] == "assets":
            asset_id = parts[4]
            for asset in MOCK_DATA["assets"]:
                if asset["id"] == asset_id:
                    asset.update(body)
                    asset["updated"] = datetime.now().isoformat()
                    self._send_json(asset)
                    return
            self.send_error(404, "Asset not found")
            return

        self.send_error(404)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        parts = path.split("/")
        if len(parts) >= 5 and parts[2] == "property_manager" and parts[3] == "assets":
            asset_id = parts[4]
            MOCK_DATA["assets"] = [a for a in MOCK_DATA["assets"] if a["id"] != asset_id]
            self._send_json({"status": "ok"})
            return

        self.send_error(404)

    def _send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def _send_json_or_html(self, content, content_type):
        body = content.encode()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, file_path, content_type):
        data = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _guess_type(self, file_path):
        ext = file_path.suffix.lower()
        return {
            ".js": "application/javascript",
            ".css": "text/css",
            ".html": "text/html",
            ".png": "image/png",
            ".svg": "image/svg+xml",
            ".json": "application/json",
        }.get(ext, "application/octet-stream")

    def log_message(self, format, *args):
        # Quieter logging
        if "404" in str(args) or "error" in str(args).lower():
            super().log_message(format, *args)


if __name__ == "__main__":
    port = 8125
    print(f"Property Manager dev server: http://localhost:{port}")
    print(f"Serving frontend from: {FRONTEND_DIR}")
    print(f"Mock property at: {MOCK_DATA['property']['latitude']}, {MOCK_DATA['property']['longitude']}")
    print()
    HTTPServer(("0.0.0.0", port), DevHandler).serve_forever()
