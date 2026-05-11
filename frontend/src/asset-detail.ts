/**
 * Asset Detail Panel — shows asset info, linked entity controls,
 * maintenance schedule, and photos when an asset is selected.
 */
import { LitElement, html, css, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { sharedStyles, CATEGORY_COLORS } from "./styles";
import type { Asset, CategoryMap } from "./models";

@customElement("pm-asset-detail")
export class AssetDetail extends LitElement {
  @property({ attribute: false }) hass: any;
  @property({ attribute: false }) asset!: Asset;
  @property({ attribute: false }) categories: CategoryMap = {};
  @property({ type: String }) entryId = "";

  @state() private _editing = false;
  @state() private _editName = "";
  @state() private _editType = "";
  @state() private _editCategory = "";
  @state() private _editStatus = "";

  static styles = [
    sharedStyles,
    css`
      :host {
        position: absolute;
        right: 0;
        top: 0;
        bottom: 0;
        width: 360px;
        max-width: 100vw;
        background: var(--pm-surface);
        box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        border-bottom: 1px solid var(--pm-divider);
      }

      .header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 500;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--pm-text-secondary);
        padding: 4px 8px;
      }

      .body {
        padding: 16px;
        flex: 1;
      }

      .category-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        color: white;
        margin-bottom: 12px;
      }

      .status-badge {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        margin-left: 8px;
      }

      .status-active {
        background: #c8e6c9;
        color: #2e7d32;
      }

      .status-inactive {
        background: #e0e0e0;
        color: #616161;
      }

      .status-needs_attention {
        background: #fff9c4;
        color: #f57f17;
      }

      .status-overdue {
        background: #ffcdd2;
        color: #c62828;
      }

      .section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--pm-divider);
      }

      .section h3 {
        font-size: 14px;
        font-weight: 500;
        color: var(--pm-text-secondary);
        margin: 0 0 8px;
      }

      .entity-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: var(--pm-bg);
        border-radius: 4px;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .entity-state {
        margin-left: auto;
        font-weight: 500;
      }

      .schedule-item {
        display: flex;
        justify-content: space-between;
        padding: 6px 0;
        font-size: 14px;
      }

      .schedule-due {
        color: var(--pm-text-secondary);
        font-size: 12px;
      }

      .metadata-table {
        width: 100%;
        font-size: 13px;
      }

      .metadata-table td {
        padding: 4px 0;
      }

      .metadata-table td:first-child {
        color: var(--pm-text-secondary);
        width: 40%;
      }

      .actions {
        display: flex;
        gap: 8px;
        padding: 16px;
        border-top: 1px solid var(--pm-divider);
      }

      .actions button {
        flex: 1;
        padding: 8px;
        border: 1px solid var(--pm-divider);
        border-radius: 4px;
        background: var(--pm-surface);
        cursor: pointer;
        font-size: 13px;
      }

      .actions button.danger {
        color: #c62828;
        border-color: #ef9a9a;
      }

      .actions button.primary {
        background: var(--pm-primary);
        color: white;
        border-color: var(--pm-primary);
      }

      .edit-form label {
        display: block;
        font-size: 12px;
        color: var(--pm-text-secondary);
        margin: 8px 0 4px;
      }

      .edit-form input,
      .edit-form select {
        width: 100%;
        padding: 6px 8px;
        border: 1px solid var(--pm-divider);
        border-radius: 4px;
        font-size: 14px;
        box-sizing: border-box;
      }
    `,
  ];

  private _close() {
    this.dispatchEvent(
      new CustomEvent("close", { bubbles: true, composed: true })
    );
  }

  private _ep(): string {
    return this.entryId ? `?entry_id=${encodeURIComponent(this.entryId)}` : "";
  }

  private async _markChecked() {
    const now = new Date().toISOString().split("T")[0];
    try {
      await this.hass.callApi(
        "POST",
        `property_manager/assets/${this.asset.id}/maintenance${this._ep()}`,
        { date: now, action: "Checked", notes: "" }
      );
      this.dispatchEvent(
        new CustomEvent("asset-updated", {
          detail: { id: this.asset.id },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error("Failed to log maintenance:", err);
    }
  }

  private _startEdit() {
    this._editing = true;
    this._editName = this.asset.name;
    this._editType = this.asset.type;
    this._editCategory = this.asset.category;
    this._editStatus = this.asset.status;
  }

  private _cancelEdit() {
    this._editing = false;
  }

  private async _saveEdit() {
    try {
      await this.hass.callApi(
        "PUT",
        `property_manager/assets/${this.asset.id}${this._ep()}`,
        {
          name: this._editName,
          type: this._editType,
          category: this._editCategory,
          status: this._editStatus,
        }
      );
      this._editing = false;
      this.dispatchEvent(
        new CustomEvent("asset-updated", {
          detail: { id: this.asset.id },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error("Failed to update asset:", err);
    }
  }

  private async _deleteAsset() {
    if (!confirm(`Delete "${this.asset.name}"?`)) return;
    try {
      await this.hass.callApi(
        "DELETE",
        `property_manager/assets/${this.asset.id}${this._ep()}`
      );
      this.dispatchEvent(
        new CustomEvent("asset-deleted", {
          detail: { id: this.asset.id },
          bubbles: true,
          composed: true,
        })
      );
    } catch (err) {
      console.error("Failed to delete asset:", err);
    }
  }

  private _getCategoryColor(): string {
    return CATEGORY_COLORS[this.asset.category] ?? "#9E9E9E";
  }

  private _getCategoryName(): string {
    return this.categories[this.asset.category]?.name ?? this.asset.category;
  }

  private _getEntityState(entityId: string): string {
    const stateObj = this.hass?.states?.[entityId];
    return stateObj?.state ?? "unavailable";
  }

  private _renderEditForm() {
    const categoryKeys = Object.keys(this.categories);
    const statuses = ["active", "inactive", "needs_attention", "overdue"];

    return html`
      <div class="body edit-form">
        <label>Name</label>
        <input
          .value=${this._editName}
          @input=${(e: Event) =>
            (this._editName = (e.target as HTMLInputElement).value)}
        />

        <label>Type</label>
        <input
          .value=${this._editType}
          @input=${(e: Event) =>
            (this._editType = (e.target as HTMLInputElement).value)}
        />

        <label>Category</label>
        <select
          .value=${this._editCategory}
          @change=${(e: Event) =>
            (this._editCategory = (e.target as HTMLSelectElement).value)}
        >
          ${categoryKeys.map(
            (k) =>
              html`<option value=${k} ?selected=${k === this._editCategory}>
                ${this.categories[k]?.name ?? k}
              </option>`
          )}
        </select>

        <label>Status</label>
        <select
          .value=${this._editStatus}
          @change=${(e: Event) =>
            (this._editStatus = (e.target as HTMLSelectElement).value)}
        >
          ${statuses.map(
            (s) =>
              html`<option value=${s} ?selected=${s === this._editStatus}>
                ${s.replace(/_/g, " ")}
              </option>`
          )}
        </select>
      </div>

      <div class="actions">
        <button class="primary" @click=${this._saveEdit}>Save</button>
        <button @click=${this._cancelEdit}>Cancel</button>
      </div>
    `;
  }

  render() {
    const asset = this.asset;

    return html`
      <div class="header">
        <h2>${asset.name}</h2>
        <button class="close-btn" @click=${this._close}>&times;</button>
      </div>

      ${this._editing
        ? this._renderEditForm()
        : html`
            <div class="body">
              <span
                class="category-badge"
                style="background: ${this._getCategoryColor()}"
              >
                ${this._getCategoryName()}
              </span>
              <span class="status-badge status-${asset.status}">
                ${asset.status.replace(/_/g, " ")}
              </span>

              ${asset.type
                ? html`<div
                    style="margin-top: 8px; font-size: 14px; color: var(--pm-text-secondary)"
                  >
                    Type: ${asset.type}
                  </div>`
                : nothing}

              <!-- Linked Entities -->
              ${asset.linked_entities.length > 0
                ? html`
                    <div class="section">
                      <h3>Linked Entities</h3>
                      ${asset.linked_entities.map(
                        (eid) => html`
                          <div class="entity-link">
                            <span>${eid}</span>
                            <span class="entity-state"
                              >${this._getEntityState(eid)}</span
                            >
                          </div>
                        `
                      )}
                    </div>
                  `
                : nothing}

              <!-- Metadata -->
              ${Object.keys(asset.metadata).length > 0
                ? html`
                    <div class="section">
                      <h3>Details</h3>
                      <table class="metadata-table">
                        ${Object.entries(asset.metadata).map(
                          ([key, val]) => html`
                            <tr>
                              <td>${key.replace(/_/g, " ")}</td>
                              <td>${String(val)}</td>
                            </tr>
                          `
                        )}
                      </table>
                    </div>
                  `
                : nothing}

              <!-- Schedules -->
              ${asset.schedules.length > 0
                ? html`
                    <div class="section">
                      <h3>Maintenance Schedule</h3>
                      ${asset.schedules.map(
                        (s) => html`
                          <div class="schedule-item">
                            <span>${s.action}</span>
                            <span class="schedule-due"
                              >${s.next_due
                                ? `Due: ${s.next_due}`
                                : s.frequency}</span
                            >
                          </div>
                        `
                      )}
                    </div>
                  `
                : nothing}

              <!-- Photos -->
              <div class="section">
                <h3>Photos (${asset.photos.length})</h3>
                ${asset.photos.length === 0
                  ? html`<p
                      style="font-size: 14px; color: var(--pm-text-secondary)"
                    >
                      No photos yet.
                    </p>`
                  : nothing}
              </div>

              <!-- Maintenance Log -->
              ${asset.maintenance_log.length > 0
                ? html`
                    <div class="section">
                      <h3>Maintenance Log</h3>
                      ${asset.maintenance_log.map(
                        (m) => html`
                          <div style="font-size: 13px; padding: 4px 0">
                            <strong>${m.date}</strong> — ${m.action}
                            ${m.notes
                              ? html`<br /><em>${m.notes}</em>`
                              : nothing}
                          </div>
                        `
                      )}
                    </div>
                  `
                : nothing}
            </div>

            <div class="actions">
              <button class="primary" @click=${this._markChecked}>
                Mark Checked
              </button>
              <button @click=${this._startEdit}>Edit</button>
              <button class="danger" @click=${this._deleteAsset}>Delete</button>
            </div>
          `}
    `;
  }
}
