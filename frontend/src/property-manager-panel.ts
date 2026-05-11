/**
 * Property Manager — Main panel entry point.
 *
 * This is the custom panel element registered with Home Assistant.
 * It hosts the Leaflet map, toolbar, and detail panel.
 */
import { LitElement, html, css, PropertyValues, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, CATEGORY_COLORS } from "./styles";
import type { PropertyStore, Asset, Zone, CategoryMap, EntryInfo } from "./models";
import "./map-engine";
import "./asset-detail";
import "./dashboard-card";

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
  @state() private _entries: EntryInfo[] = [];
  @state() private _selectedEntryId = "";

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
        flex-shrink: 0;
      }

      .view-toggle button {
        padding: 6px 10px;
        border: none;
        background: var(--pm-surface);
        color: var(--pm-text);
        cursor: pointer;
        font-size: 13px;
        white-space: nowrap;
      }

      .view-toggle button.active {
        background: var(--pm-primary);
        color: white;
      }

      /* Abbreviate on small screens */
      @media (max-width: 480px) {
        .view-toggle button {
          padding: 6px 8px;
          font-size: 12px;
        }
      }

      .asset-count {
        font-size: 13px;
        color: var(--pm-text-secondary);
        padding: 0 8px;
      }

      ha-menu-button {
        flex-shrink: 0;
      }

      .property-select {
        padding: 4px 8px;
        border: 1px solid var(--pm-divider);
        border-radius: 4px;
        background: var(--pm-surface);
        color: var(--pm-text);
        font-size: 14px;
        cursor: pointer;
      }
    `,
  ];

  private _initialized = false;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    // Load data once hass becomes available (it's set after element creation)
    if (!this._initialized && this.hass) {
      this._initialized = true;
      this._loadData();
    }
  }

  private _entryParam(): string {
    return this._selectedEntryId
      ? `entry_id=${encodeURIComponent(this._selectedEntryId)}`
      : "";
  }

  private async _loadData(): Promise<void> {
    try {
      this._loading = true;

      // Load entries list
      const entries = await this.hass.callApi<EntryInfo[]>(
        "GET",
        "property_manager/entries"
      );
      this._entries = entries;

      // Auto-select first entry if none selected or current is gone
      if (
        !this._selectedEntryId ||
        !entries.find((e) => e.entry_id === this._selectedEntryId)
      ) {
        this._selectedEntryId = entries.length > 0 ? entries[0].entry_id : "";
      }

      if (!this._selectedEntryId) {
        this._data = null;
        this._categories = {};
        return;
      }

      const ep = this._entryParam();
      const [data, categories] = await Promise.all([
        this.hass.callApi<PropertyStore>(
          "GET",
          `property_manager/data${ep ? `?${ep}` : ""}`
        ),
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

  private _toggleMenu() {
    // Use HA's fireEvent pattern — must bubble and compose through shadow DOM
    this.dispatchEvent(
      new CustomEvent("hass-toggle-menu", {
        bubbles: true,
        composed: true,
      })
    );
  }

  private _handleEntryChange(e: Event) {
    this._selectedEntryId = (e.target as HTMLSelectElement).value;
    this._selectedAsset = null;
    this._loadData();
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
    const { geometry } = e.detail;
    try {
      const ep = this._entryParam();
      await this.hass.callApi(
        "POST",
        `property_manager/assets${ep ? `?${ep}` : ""}`,
        {
          name: "New Asset",
          category: "custom",
          geometry,
          status: "active",
        }
      );
      await this._loadData();
    } catch (err) {
      console.error("Failed to create asset:", err);
    }
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
          ${this.narrow
            ? html`<ha-menu-button
                .hass=${this.hass}
                .narrow=${this.narrow}
              ></ha-menu-button>`
            : nothing}
          <h1>Property Manager</h1>
          ${this._entries.length > 1
            ? html`<select
                class="property-select"
                @change=${this._handleEntryChange}
              >
                ${this._entries.map(
                  (entry) => html`
                    <option
                      value=${entry.entry_id}
                      ?selected=${entry.entry_id === this._selectedEntryId}
                    >
                      ${entry.property_name}
                    </option>
                  `
                )}
              </select>`
            : nothing}
          <span class="asset-count"
            >${assetCount} assets · ${zoneCount} zones</span
          >
          <div class="view-toggle">
            <button
              class=${this._viewMode === "satellite" ? "active" : ""}
              @click=${() => this._handleViewToggle("satellite")}
            >
              🛰 Map
            </button>
            <button
              class=${this._viewMode === "schematic" ? "active" : ""}
              @click=${() => this._handleViewToggle("schematic")}
            >
              📐 Plan
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
                .entryId=${this._selectedEntryId}
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
