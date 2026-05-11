/**
 * Map Engine — Leaflet wrapper with layer management and drawing tools.
 *
 * Renders assets/zones on a Leaflet map with satellite (OSM) or
 * schematic (Canvas 2D overlay) view modes.
 *
 * Leaflet and Leaflet-draw are bundled via npm (not CDN) to avoid CSP issues.
 * CSS is loaded via <link> tags pointing to locally-served copies.
 */
import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import * as _L from "leaflet";
import type { PropertyStore, Asset, Zone, CategoryMap } from "./models";
import { CATEGORY_COLORS } from "./styles";
import { renderSchematic } from "./schematic-renderer";

// leaflet-draw needs a mutable global L object (module namespace is frozen).
// Spread into a plain object so leaflet-draw can add properties like drawVersion.
const L: any = { ..._L };
(window as any).L = L;

// Fix default marker icon paths for bundled Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/property_manager/frontend/images/marker-icon-2x.png",
  iconUrl: "/property_manager/frontend/images/marker-icon.png",
  shadowUrl: "/property_manager/frontend/images/marker-shadow.png",
});

@customElement("pm-map-engine")
export class MapEngine extends LitElement {
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) data: PropertyStore | null = null;
  @property({ attribute: false }) categories: CategoryMap = {};
  @property({ type: String }) viewMode: "satellite" | "schematic" = "satellite";

  @query("#map") private _mapEl!: HTMLDivElement;
  @query("#schematic-canvas") private _canvasEl!: HTMLCanvasElement;

  private _map: L.Map | null = null;
  private _tileLayer: L.TileLayer | null = null;
  private _assetLayers: Map<string, L.Layer> = new Map();
  private _zoneLayers: Map<string, L.Layer> = new Map();
  private _boundaryLayer: L.Polygon | null = null;
  private _drawControl: any = null;
  private _drawnItems: L.FeatureGroup | null = null;
  @state() private _leafletReady = false;

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: relative;
    }
    #map {
      width: 100%;
      height: 100%;
    }
    #schematic-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 400;
      display: none;
    }
    .map-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #757575;
      font-size: 16px;
    }
  `;

  private _resizeObserver: ResizeObserver | null = null;

  protected async firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    await this._loadLeaflet();

    // Handle rotation / resize — tell Leaflet to recalculate
    this._resizeObserver = new ResizeObserver(() => {
      if (this._map) {
        this._map.invalidateSize({ animate: false });
      }
    });
    const mapEl = this.shadowRoot?.querySelector('#map');
    if (mapEl) this._resizeObserver.observe(mapEl);
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);

    if (changedProps.has("data") && this._map) {
      this._renderData();
      // Re-center map when data first arrives with location
      const prev = changedProps.get("data") as PropertyStore | null | undefined;
      if (!prev?.property?.latitude && this.data?.property?.latitude) {
        this._map.setView(
          [this.data.property.latitude!, this.data.property.longitude!],
          18
        );
      }
    }
    if (changedProps.has("viewMode") && this._map) {
      this._updateViewMode();
    }
  }

  private async _loadLeaflet(): Promise<void> {
    try {
      // Dynamically import leaflet-draw after L is on window
      await import("leaflet-draw");
    } catch (err) {
      console.warn("Leaflet-draw failed to load, drawing disabled:", err);
    }

    this._leafletReady = true;
    await this.updateComplete;
    this._initMap();
  }

  private _initMap() {
    const mapEl = this._mapEl;
    if (!mapEl) {
      console.error("Map container #map not found in shadow DOM");
      return;
    }

    // Center on property location from config
    const propLat = this.data?.property?.latitude;
    const propLng = this.data?.property?.longitude;
    const defaultCenter: [number, number] = [
      propLat ?? 47.6062,
      propLng ?? -122.3321,
    ];
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
      const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      this._drawControl = new (L as any).Control.Draw({
        edit: { featureGroup: this._drawnItems },
        draw: {
          polygon: { showArea: true, allowIntersection: false, shapeOptions: { weight: 3 }, touchIcon: isMobile },
          polyline: { shapeOptions: { weight: 3 } },
          marker: true,
          circle: false,
          rectangle: false,
          circlemarker: false,
        },
      });
      // Disable draw guide tooltips on mobile (they cover controls)
      if (isMobile && (L as any).drawLocal?.draw?.handlers) {
        const handlers = (L as any).drawLocal.draw.handlers;
        for (const key of Object.keys(handlers)) {
          if (handlers[key]?.tooltip) {
            handlers[key].tooltip.start = '';
            handlers[key].tooltip.cont = '';
            handlers[key].tooltip.end = '';
          }
        }
      }
      this._map.addControl(this._drawControl);

      this._map.on("draw:created" as any, (e: any) => {
        const layer = e.layer;
        this._drawnItems!.addLayer(layer);
        this._handleDrawCreated(e.layerType, layer);
      });
    }

    // Listen for map moves to update the schematic overlay
    this._map.on("moveend", () => this._renderSchematicOverlay());
    this._map.on("zoomend", () => this._renderSchematicOverlay());

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

    private _hasFittedBounds = false;

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
      this._boundaryLayer = L.polygon(boundary as [number, number][], {
        color: "#333",
        weight: 3,
        fillColor: "#333",
        fillOpacity: 0.05,
        dashArray: "10, 5",
      }).addTo(this._map);

      // Only fit bounds on first load — don't jump map on data refresh
      if (!this._hasFittedBounds) {
        this._hasFittedBounds = true;
        this._map.fitBounds(this._boundaryLayer.getBounds(), {
          padding: [20, 20],
        });
      }
    }

    // Render zones
    for (const zone of this.data.zones) {
      this._renderZone(zone);
    }

    // Render assets
    for (const asset of this.data.assets) {
      this._renderAsset(asset);
    }

    // Update schematic overlay if in schematic mode
    this._renderSchematicOverlay();
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
        const coords = (
          asset.geometry.coordinates as [number, number][][]
        )[0];
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

    layer.bindTooltip(asset.name, { direction: "top", offset: [0, -10], permanent: false });

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
      // Show tile layer, hide canvas overlay
      if (this._tileLayer && !this._map.hasLayer(this._tileLayer)) {
        this._tileLayer.addTo(this._map);
      }
      // Show Leaflet vector layers
      this._assetLayers.forEach((layer) => {
        if (!this._map!.hasLayer(layer)) layer.addTo(this._map!);
      });
      this._zoneLayers.forEach((layer) => {
        if (!this._map!.hasLayer(layer)) layer.addTo(this._map!);
      });
      if (this._boundaryLayer && !this._map.hasLayer(this._boundaryLayer)) {
        this._boundaryLayer.addTo(this._map);
      }
      // Hide canvas
      if (this._canvasEl) this._canvasEl.style.display = "none";
    } else {
      // Schematic mode: remove satellite tiles, hide vector layers, show canvas
      if (this._tileLayer && this._map.hasLayer(this._tileLayer)) {
        this._map.removeLayer(this._tileLayer);
      }
      // Hide Leaflet vector layers (schematic draws its own)
      this._assetLayers.forEach((layer) => {
        if (this._map!.hasLayer(layer)) this._map!.removeLayer(layer);
      });
      this._zoneLayers.forEach((layer) => {
        if (this._map!.hasLayer(layer)) this._map!.removeLayer(layer);
      });
      if (this._boundaryLayer && this._map.hasLayer(this._boundaryLayer)) {
        this._map.removeLayer(this._boundaryLayer);
      }
      // Show and render canvas
      if (this._canvasEl) this._canvasEl.style.display = "block";
      this._renderSchematicOverlay();
    }
  }

  private _renderSchematicOverlay(): void {
    if (this.viewMode !== "schematic" || !this._map || !this.data) return;

    const canvas = this._canvasEl;
    if (!canvas) return;

    const size = this._map.getSize();
    canvas.style.display = "block";

    const map = this._map;
    const latLngToPixel = (lat: number, lng: number): [number, number] => {
      const pt = map.latLngToContainerPoint([lat, lng]);
      return [pt.x, pt.y];
    };

    renderSchematic(this.data, {
      canvas,
      width: size.x,
      height: size.y,
      latLngToPixel,
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    if (this._map) {
      this._map.remove();
      this._map = null;
    }
  }

  render() {
    if (!this._leafletReady) {
      return html`<div class="map-loading">Loading map...</div>`;
    }

    return html`
      <link rel="stylesheet" href="/property_manager/frontend/leaflet.css" />
      <link
        rel="stylesheet"
        href="/property_manager/frontend/leaflet.draw.css"
      />
      <style>
        /* Mobile-friendly draw controls */
        @media (max-width: 768px), (pointer: coarse) {
          .leaflet-draw-toolbar a {
            width: 36px !important;
            height: 36px !important;
            line-height: 36px !important;
          }
          .leaflet-draw-tooltip {
            display: none !important;
          }
        }
      </style>
      <div id="map">
        <canvas id="schematic-canvas"></canvas>
      </div>
    `;
  }
}
