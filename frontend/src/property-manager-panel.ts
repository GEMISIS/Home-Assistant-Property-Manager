/**
 * Property Manager — Main panel entry point.
 *
 * This is the custom panel element registered with Home Assistant.
 * It hosts the Leaflet map, toolbar, and detail panel.
 */
import { LitElement, html, css, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, CATEGORY_COLORS } from "./styles";
import type { PropertyStore, Asset, Zone, CategoryMap } from "./models";
import "./map-engine";
import "./asset-detail";

// Extend the global Window to include HA types
declare global {
  interface HTMLElementTagNameMap {
    "property-manager-panel": PropertyManagerPanel;
  }
}

interface HomeAssistant {
  callApi<T>(method: string, path: string, data?: unknown): Promise<T>;
  states: Record<string, { state: string; attributes: Record<string, unknown> }>;
  connection: {
    subscribeEvents(
      callback: (event: unknown) => void,
      eventType: string
    ): Promise<() => void>;
  };
}

@customElement("property-manager-panel")
export class PropertyManagerPanel extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;
  @property({ type: Boolean }) public narrow = false;

  @state() private _data: PropertyStore | null = null;
  @state() private _categories: CategoryMap = {};
  @state() private _selectedAsset: Asset | null = null;
  @state() private _loading = true;
  @state() private _viewMode: "satellite" | "schematic" = "satellite";

  static styles = [
    sharedStyles,
    css`
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        font-size: 18px;
        color: var(--pm-text-secondary);
      }

      .view-toggle {
        display: flex;
        border: 1px solid var(--pm-divider);
        border-radius: 4px;
        overflow: hidden;
      }

      .view-toggle button {
        padding: 6px 12px;
        border: none;
        background: var(--pm-surface);
        color: var(--pm-text);
        cursor: pointer;
        font-size: 13px;
      }

      .view-toggle button.active {
        background: var(--pm-primary);
        color: white;
      }

      .asset-count {
        font-size: 13px;
        color: var(--pm-text-secondary);
        padding: 0 8px;
      }
    `,
  ];

  protected async firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    await this._loadData();
  }

  private async _loadData(): Promise<void> {
    try {
      this._loading = true;
      const [data, categories] = await Promise.all([
        this.hass.callApi<PropertyStore>("GET", "property_manager/data"),
        this.hass.callApi<CategoryMap>("GET", "property_manager/categories"),
      ]);
      this._data = data;
      this._categories = categories;
    } catch (err) {
      console.error("Failed to load property data:", err);
    } finally {
      this._loading = false;
    }
  }

  private _handleAssetSelect(e: CustomEvent<Asset>) {
    this._selectedAsset = e.detail;
  }

  private _handleCloseDetail() {
    this._selectedAsset = null;
  }

  private _handleViewToggle(mode: "satellite" | "schematic") {
    this._viewMode = mode;
  }

  private async _handleAssetCreated(e: CustomEvent) {
    await this._loadData();
  }

  private async _handleAssetUpdated(e: CustomEvent) {
    await this._loadData();
    // Refresh selected asset if it was the one updated
    if (this._selectedAsset && this._data) {
      this._selectedAsset =
        this._data.assets.find((a) => a.id === this._selectedAsset!.id) ?? null;
    }
  }

  private async _handleAssetDeleted(e: CustomEvent) {
    this._selectedAsset = null;
    await this._loadData();
  }

  render() {
    if (this._loading) {
      return html`<div class="panel-container">
        <div class="loading">Loading Property Manager...</div>
      </div>`;
    }

    const assetCount = this._data?.assets.length ?? 0;
    const zoneCount = this._data?.zones.length ?? 0;

    return html`
      <div class="panel-container">
        <div class="toolbar">
          <h1>Property Manager</h1>
          <span class="asset-count"
            >${assetCount} assets · ${zoneCount} zones</span
          >
          <div class="view-toggle">
            <button
              class=${this._viewMode === "satellite" ? "active" : ""}
              @click=${() => this._handleViewToggle("satellite")}
            >
              Satellite
            </button>
            <button
              class=${this._viewMode === "schematic" ? "active" : ""}
              @click=${() => this._handleViewToggle("schematic")}
            >
              Schematic
            </button>
          </div>
        </div>
        <div class="map-container">
          <pm-map-engine
            .hass=${this.hass}
            .data=${this._data}
            .categories=${this._categories}
            .viewMode=${this._viewMode}
            @asset-select=${this._handleAssetSelect}
            @asset-created=${this._handleAssetCreated}
          ></pm-map-engine>
          ${this._selectedAsset
            ? html`<pm-asset-detail
                .hass=${this.hass}
                .asset=${this._selectedAsset}
                .categories=${this._categories}
                @close=${this._handleCloseDetail}
                @asset-updated=${this._handleAssetUpdated}
                @asset-deleted=${this._handleAssetDeleted}
              ></pm-asset-detail>`
            : null}
        </div>
      </div>
    `;
  }
}
