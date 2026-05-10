/**
 * Map Engine — Leaflet wrapper with layer management and drawing tools.
 *
 * Renders assets/zones on a Leaflet map with satellite (OSM) or
 * schematic (Canvas 2D overlay) view modes.
 */
import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import type { PropertyStore, Asset, Zone, CategoryMap } from "./models";
import { CATEGORY_COLORS, SCHEMATIC_FILLS } from "./styles";

// Leaflet types — loaded via CDN in the panel
declare const L: typeof import("leaflet");

@customElement("pm-map-engine")
export class MapEngine extends LitElement {
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) data: PropertyStore | null = null;
  @property({ attribute: false }) categories: CategoryMap = {};
  @property({ type: String }) viewMode: "satellite" | "schematic" = "satellite";

  @query("#map") private _mapEl!: HTMLDivElement;

  private _map: L.Map | null = null;
  private _tileLayer: L.TileLayer | null = null;
  private _assetLayers: Map<string, L.Layer> = new Map();
  private _zoneLayers: Map<string, L.Layer> = new Map();
  private _boundaryLayer: L.Polygon | null = null;
  private _drawControl: any = null;
  private _drawnItems: L.FeatureGroup | null = null;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    #map {
      width: 100%;
      height: 100%;
    }
  `;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this._initMap();
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    if (changedProps.has("data") && this._map) {
      this._renderData();
    }
    if (changedProps.has("viewMode") && this._map) {
      this._updateViewMode();
    }
  }

  private _initMap() {
    // Check if Leaflet is available
    if (typeof L === "undefined") {
      console.error(
        "Leaflet not loaded. Ensure leaflet.js and leaflet.css are included."
      );
      return;
    }

    const mapEl = this._mapEl;
    if (!mapEl) return;

    // Default center: a reasonable default if no property boundary set
    const defaultCenter: [number, number] = [47.6062, -122.3321]; // Seattle
    const defaultZoom = 18;

    this._map = L.map(mapEl, {
      center: defaultCenter,
      zoom: defaultZoom,
      zoomControl: true,
    });

    // Satellite tile layer (OpenStreetMap)
    this._tileLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 22,
      }
    );
    this._tileLayer.addTo(this._map);

    // Drawing layer
    this._drawnItems = L.featureGroup().addTo(this._map);

    // Initialize Leaflet.Draw if available
    if ((L as any).Control?.Draw) {
      this._drawControl = new (L as any).Control.Draw({
        edit: { featureGroup: this._drawnItems },
        draw: {
          polygon: true,
          polyline: true,
          marker: true,
          circle: false,
          rectangle: false,
          circlemarker: false,
        },
      });
      this._map.addControl(this._drawControl);

      // Handle draw:created events
      this._map.on("draw:created" as any, (e: any) => {
        const layer = e.layer;
        this._drawnItems!.addLayer(layer);
        this._handleDrawCreated(e.layerType, layer);
      });
    }

    // Render initial data
    this._renderData();
  }

  private _handleDrawCreated(layerType: string, layer: L.Layer) {
    let geometry: any;

    if (layerType === "marker") {
      const latlng = (layer as L.Marker).getLatLng();
      geometry = {
        type: "Point",
        coordinates: [latlng.lat, latlng.lng],
      };
    } else if (layerType === "polyline") {
      const latlngs = (layer as L.Polyline).getLatLngs() as L.LatLng[];
      geometry = {
        type: "LineString",
        coordinates: latlngs.map((ll) => [ll.lat, ll.lng]),
      };
    } else if (layerType === "polygon") {
      const latlngs = (
        (layer as L.Polygon).getLatLngs() as L.LatLng[][]
      )[0];
      geometry = {
        type: "Polygon",
        coordinates: [latlngs.map((ll) => [ll.lat, ll.lng])],
      };
    }

    if (geometry) {
      this.dispatchEvent(
        new CustomEvent("asset-created", {
          detail: { geometry },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  private _renderData() {
    if (!this._map || !this.data) return;

    // Clear existing layers
    this._assetLayers.forEach((layer) => this._map!.removeLayer(layer));
    this._zoneLayers.forEach((layer) => this._map!.removeLayer(layer));
    this._assetLayers.clear();
    this._zoneLayers.clear();

    if (this._boundaryLayer) {
      this._map.removeLayer(this._boundaryLayer);
      this._boundaryLayer = null;
    }

    // Render property boundary
    const boundary = this.data.property.boundary;
    if (boundary.length > 0) {
      this._boundaryLayer = L.polygon(
        boundary as [number, number][],
        {
          color: "#333",
          weight: 3,
          fillColor: "#333",
          fillOpacity: 0.05,
          dashArray: "10, 5",
        }
      ).addTo(this._map);

      // Fit map to boundary
      this._map.fitBounds(this._boundaryLayer.getBounds(), { padding: [20, 20] });
    }

    // Render zones
    for (const zone of this.data.zones) {
      this._renderZone(zone);
    }

    // Render assets
    for (const asset of this.data.assets) {
      this._renderAsset(asset);
    }
  }

  private _renderAsset(asset: Asset) {
    if (!this._map) return;

    const color = CATEGORY_COLORS[asset.category] ?? "#9E9E9E";
    let layer: L.Layer;

    switch (asset.geometry.type) {
      case "Point": {
        const coords = asset.geometry.coordinates as [number, number];
        layer = L.circleMarker(coords, {
          radius: 8,
          fillColor: color,
          fillOpacity: 0.8,
          color: "#fff",
          weight: 2,
        });
        break;
      }
      case "LineString": {
        const coords = asset.geometry.coordinates as [number, number][];
        layer = L.polyline(coords, {
          color: color,
          weight: 3,
          opacity: 0.8,
        });
        break;
      }
      case "Polygon": {
        const coords = (asset.geometry.coordinates as [number, number][][])[0];
        layer = L.polygon(coords, {
          fillColor: color,
          fillOpacity: 0.3,
          color: color,
          weight: 2,
        });
        break;
      }
      default:
        return;
    }

    // Tooltip
    layer.bindTooltip(asset.name, { direction: "top", offset: [0, -10] });

    // Click handler
    layer.on("click", () => {
      this.dispatchEvent(
        new CustomEvent("asset-select", {
          detail: asset,
          bubbles: true,
          composed: true,
        })
      );
    });

    layer.addTo(this._map);
    this._assetLayers.set(asset.id, layer);
  }

  private _renderZone(zone: Zone) {
    if (!this._map || zone.geometry.type !== "Polygon") return;

    const coords = (zone.geometry.coordinates as [number, number][][])[0];
    const color = zone.color || CATEGORY_COLORS[zone.category] || "#9E9E9E";

    const layer = L.polygon(coords, {
      fillColor: color,
      fillOpacity: 0.15,
      color: color,
      weight: 1,
      dashArray: "4, 4",
    });

    layer.bindTooltip(zone.name, { direction: "center" });
    layer.addTo(this._map);
    this._zoneLayers.set(zone.id, layer);
  }

  private _updateViewMode() {
    if (!this._map) return;

    if (this.viewMode === "satellite") {
      if (this._tileLayer && !this._map.hasLayer(this._tileLayer)) {
        this._tileLayer.addTo(this._map);
      }
    } else {
      // Schematic mode: remove satellite tiles for a clean canvas look
      if (this._tileLayer && this._map.hasLayer(this._tileLayer)) {
        this._map.removeLayer(this._tileLayer);
      }
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }

  // Use light DOM so Leaflet CSS works properly
  protected createRenderRoot() {
    return this;
  }

  render() {
    return html`
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css"
      />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>
      <style>
        #map {
          width: 100%;
          height: 100%;
        }
      </style>
      <div id="map"></div>
    `;
  }
}
