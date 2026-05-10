/**
 * Dashboard Card — Lovelace summary card for Property Manager.
 *
 * Shows asset count, attention items, and upcoming maintenance.
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import type { PropertyStore, Asset } from "./models";

interface CardConfig {
  type: string;
  title?: string;
}

@customElement("property-manager-card")
export class PropertyManagerCard extends LitElement {
  @property({ attribute: false }) hass: any;
  @state() private _config: CardConfig = { type: "custom:property-manager-card" };
  @state() private _data: PropertyStore | null = null;

  static styles = css`
    :host {
      display: block;
    }

    ha-card {
      padding: 16px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }

    .header h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 0;
      font-size: 14px;
    }

    .stat .icon {
      font-size: 18px;
    }

    .attention {
      color: #f57f17;
    }

    .footer {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      color: var(--secondary-text-color, #757575);
    }

    .open-link {
      color: var(--primary-color, #03a9f4);
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
    }
  `;

  setConfig(config: CardConfig) {
    this._config = config;
  }

  async connectedCallback() {
    super.connectedCallback();
    await this._loadData();
  }

  private async _loadData() {
    try {
      this._data = await this.hass.callApi("GET", "property_manager/data");
    } catch {
      // Integration not set up yet
    }
  }

  private _getAttentionAssets(): Asset[] {
    if (!this._data) return [];
    return this._data.assets.filter(
      (a) => a.status === "needs_attention" || a.status === "overdue"
    );
  }

  private _openMap() {
    window.location.href = "/property-manager";
  }

  render() {
    const title = this._config.title ?? "Property Manager";
    const assetCount = this._data?.assets.length ?? 0;
    const zoneCount = this._data?.zones.length ?? 0;
    const attention = this._getAttentionAssets();

    return html`
      <ha-card>
        <div class="header">
          <h2>${title}</h2>
        </div>

        ${attention.length > 0
          ? html`
              <div class="stat attention">
                <span class="icon">&#9888;</span>
                <span>${attention.length} item(s) need attention</span>
              </div>
            `
          : html`
              <div class="stat">
                <span class="icon">&#10003;</span>
                <span>All clear — no items need attention</span>
              </div>
            `}

        <div class="footer">
          <span>${assetCount} assets &middot; ${zoneCount} zones</span>
          <a class="open-link" @click=${this._openMap}>Open Map &rarr;</a>
        </div>
      </ha-card>
    `;
  }

  static getStubConfig() {
    return { type: "custom:property-manager-card" };
  }

  getCardSize() {
    return 3;
  }
}

// Register card with the HA custom card registry
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: "property-manager-card",
  name: "Property Manager",
  description: "Summary card for Property Manager — shows assets and attention items.",
});
