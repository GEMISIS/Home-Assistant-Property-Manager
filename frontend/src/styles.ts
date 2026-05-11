/**
 * Shared styles and category color definitions for Property Manager.
 */
import { css } from "lit";

export const CATEGORY_COLORS: Record<string, string> = {
  structures: "#78909C",
  landscaping: "#66BB6A",
  water: "#42A5F5",
  utilities: "#FFA726",
  pest_control: "#FDD835",
  paths_access: "#A1887F",
  lighting: "#FFB300",
  recreation: "#AB47BC",
  vehicles: "#78909C",
  septic: "#8D6E63",
  well_water: "#0288D1",
  hvac_mini_split: "#26A69A",
  hvac_ac: "#5C6BC0",
  custom: "#9E9E9E",
};

export const SCHEMATIC_FILLS: Record<string, { fill: string; stroke: string }> =
  {
    lawn: { fill: "#81C784", stroke: "#66BB6A" },
    garden: { fill: "#A5D6A7", stroke: "#4CAF50" },
    deck: { fill: "#B0BEC5", stroke: "#78909C" },
    water: { fill: "#64B5F6", stroke: "#42A5F5" },
    path: { fill: "#D7CCC8", stroke: "#A1887F" },
    driveway: { fill: "#BDBDBD", stroke: "#9E9E9E" },
    fence: { fill: "#8D6E63", stroke: "#6D4C41" },
    pest: { fill: "#FFF176", stroke: "#FDD835" },
    recreation: { fill: "#CE93D8", stroke: "#AB47BC" },
  };

export const sharedStyles = css`
  :host {
    display: block;
    height: 100%;
    font-family: var(--primary-font-family, Roboto, sans-serif);
    --pm-primary: #4caf50;
    --pm-secondary: #2196f3;
    --pm-bg: var(--primary-background-color, #fafafa);
    --pm-surface: var(--card-background-color, #ffffff);
    --pm-text: var(--primary-text-color, #212121);
    --pm-text-secondary: var(--secondary-text-color, #757575);
    --pm-divider: var(--divider-color, #e0e0e0);
  }

  .panel-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: var(--pm-bg);
    /* Do NOT set z-index here — it creates a stacking context that
       can trap Leaflet's high z-indexes and cover HA's sidebar.
       Let the panel flow naturally in the DOM stacking order. */
    position: relative;
  }

  .toolbar {
    display: flex;
    align-items: center;
    padding: 0 8px;
    height: 56px;
    min-height: 56px;
    background: var(--pm-surface);
    border-bottom: 1px solid var(--pm-divider);
    gap: 4px;
    overflow: hidden;
    z-index: 1;
  }

  .toolbar h1 {
    font-size: 18px;
    font-weight: 400;
    margin: 0;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--pm-text);
  }

  /* Hide asset count on narrow screens */
  @media (max-width: 480px) {
    .toolbar .asset-count {
      display: none;
    }
    .toolbar h1 {
      font-size: 16px;
    }
  }

  .map-container {
    flex: 1;
    position: relative;
    /* Contain Leaflet's z-indexes within this element so they don't
       bleed out and cover HA's sidebar overlay */
    isolation: isolate;
    overflow: hidden;
  }

  .toolbar-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    border: 1px solid var(--pm-divider);
    border-radius: 4px;
    background: var(--pm-surface);
    color: var(--pm-text);
    cursor: pointer;
    font-size: 14px;
    transition: background 0.2s;
  }

  .toolbar-button:hover {
    background: var(--pm-divider);
  }

  .toolbar-button.active {
    background: var(--pm-primary);
    color: white;
    border-color: var(--pm-primary);
  }

  .detail-panel {
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
    padding: 16px;
  }

  .detail-panel h2 {
    margin: 0 0 8px;
    font-size: 18px;
    color: var(--pm-text);
  }

  .detail-panel .category-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: white;
    margin-bottom: 12px;
  }

  .detail-panel .field {
    margin-bottom: 8px;
  }

  .detail-panel .field label {
    display: block;
    font-size: 12px;
    color: var(--pm-text-secondary);
    margin-bottom: 2px;
  }
`;
