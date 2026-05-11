/**
 * Headless browser test — loads the dev server page, captures errors,
 * checks if key elements render, and reports results.
 *
 * Usage: npx playwright test-page.js
 * (or: node test-page.js if playwright is installed)
 */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  const warnings = [];
  const networkErrors = [];

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') errors.push(text);
    else if (type === 'warning') warnings.push(text);
    else console.log(`  [${type}] ${text}`);
  });

  // Capture page errors
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });

  // Capture failed network requests
  page.on('requestfailed', req => {
    networkErrors.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
  });

  console.log('Loading http://localhost:8125 ...\n');

  try {
    await page.goto('http://localhost:8125', { waitUntil: 'networkidle', timeout: 30000 });
  } catch (e) {
    console.error('Failed to load page:', e.message);
    await browser.close();
    process.exit(1);
  }

  // Wait a bit for dynamic content
  await page.waitForTimeout(3000);

  // Check what rendered
  console.log('=== PAGE STRUCTURE ===');

  const panelExists = await page.$('property-manager-panel') !== null;
  console.log(`property-manager-panel: ${panelExists ? '✅' : '❌'}`);

  // Check shadow DOM contents
  const panelContent = await page.evaluate(() => {
    const panel = document.querySelector('property-manager-panel');
    if (!panel) return 'NO PANEL';
    const shadow = panel.shadowRoot;
    if (!shadow) return 'NO SHADOW ROOT';

    const container = shadow.querySelector('.panel-container');
    const toolbar = shadow.querySelector('.toolbar');
    const mapContainer = shadow.querySelector('.map-container');
    const loading = shadow.querySelector('.loading');
    const mapEngine = shadow.querySelector('pm-map-engine');

    return {
      hasContainer: !!container,
      hasToolbar: !!toolbar,
      hasMapContainer: !!mapContainer,
      isLoading: !!loading,
      loadingText: loading?.textContent || '',
      hasMapEngine: !!mapEngine,
      containerHeight: container?.offsetHeight || 0,
      mapContainerHeight: mapContainer?.offsetHeight || 0,
      innerHTML: shadow.innerHTML.substring(0, 500),
    };
  });
  console.log('Panel internals:', JSON.stringify(panelContent, null, 2));

  // Check map engine
  const mapContent = await page.evaluate(() => {
    const panel = document.querySelector('property-manager-panel');
    if (!panel?.shadowRoot) return 'NO PANEL SHADOW';
    const mapEngine = panel.shadowRoot.querySelector('pm-map-engine');
    if (!mapEngine) return 'NO MAP ENGINE';

    // Map engine uses light DOM or shadow DOM?
    const shadow = mapEngine.shadowRoot;
    const root = shadow || mapEngine;

    const mapDiv = root.querySelector('#map');
    const leafletContainer = root.querySelector('.leaflet-container');
    const tilePane = root.querySelector('.leaflet-tile-pane');
    const drawToolbar = root.querySelector('.leaflet-draw-toolbar');

    return {
      hasShadow: !!shadow,
      hasMapDiv: !!mapDiv,
      mapDivHeight: mapDiv?.offsetHeight || 0,
      mapDivWidth: mapDiv?.offsetWidth || 0,
      hasLeafletContainer: !!leafletContainer,
      leafletHeight: leafletContainer?.offsetHeight || 0,
      hasTilePane: !!tilePane,
      tileCount: root.querySelectorAll('.leaflet-tile').length,
      hasDrawToolbar: !!drawToolbar,
      childCount: root.children?.length || 0,
      rootHTML: (shadow ? shadow.innerHTML : mapEngine.innerHTML).substring(0, 500),
    };
  });
  console.log('\nMap engine internals:', JSON.stringify(mapContent, null, 2));

  // Summary
  console.log('\n=== ERRORS ===');
  if (errors.length === 0) {
    console.log('✅ No errors');
  } else {
    errors.forEach(e => console.log(`❌ ${e}`));
  }

  console.log('\n=== NETWORK ERRORS ===');
  if (networkErrors.length === 0) {
    console.log('✅ No network errors');
  } else {
    networkErrors.forEach(e => console.log(`❌ ${e}`));
  }

  console.log('\n=== WARNINGS ===');
  warnings.forEach(w => console.log(`⚠️  ${w}`));

  // Take screenshot
  await page.screenshot({ path: 'dev-server/screenshot.png', fullPage: true });
  console.log('\nScreenshot saved to dev-server/screenshot.png');

  await browser.close();

  // Exit with error if there were issues
  if (errors.length > 0 || networkErrors.length > 0) {
    process.exit(1);
  }
})();
