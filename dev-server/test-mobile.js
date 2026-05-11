/**
 * Mobile viewport test — simulates phone screen and captures issues.
 */
const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const iPhone = devices['iPhone 13'];
  const context = await browser.newContext({ ...iPhone });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    else console.log(`  [${msg.type()}] ${msg.text()}`);
  });
  page.on('pageerror', err => errors.push(`PAGE: ${err.message}`));

  console.log(`Viewport: ${iPhone.viewport.width}x${iPhone.viewport.height}\n`);
  await page.goto('http://localhost:8125', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Check toolbar button text overflow
  const buttons = await page.evaluate(() => {
    const panel = document.querySelector('property-manager-panel');
    if (!panel?.shadowRoot) return [];
    const btns = panel.shadowRoot.querySelectorAll('.view-toggle button');
    return Array.from(btns).map(b => ({
      text: b.textContent?.trim(),
      width: b.offsetWidth,
      overflow: getComputedStyle(b).overflow,
      visible: b.offsetWidth > 0 && b.offsetHeight > 0,
      isClipped: b.scrollWidth > b.offsetWidth,
    }));
  });
  console.log('View toggle buttons:', JSON.stringify(buttons, null, 2));

  // Check toolbar layout
  const toolbar = await page.evaluate(() => {
    const panel = document.querySelector('property-manager-panel');
    if (!panel?.shadowRoot) return null;
    const tb = panel.shadowRoot.querySelector('.toolbar');
    if (!tb) return null;
    return {
      width: tb.offsetWidth,
      height: tb.offsetHeight,
      overflow: getComputedStyle(tb).overflow,
      children: Array.from(tb.children).map(c => ({
        tag: c.tagName,
        width: c.offsetWidth,
        text: c.textContent?.trim().substring(0, 30),
      })),
    };
  });
  console.log('\nToolbar:', JSON.stringify(toolbar, null, 2));

  // Check map z-index
  const zIndexes = await page.evaluate(() => {
    const panel = document.querySelector('property-manager-panel');
    if (!panel?.shadowRoot) return {};
    const mapContainer = panel.shadowRoot.querySelector('.map-container');
    const mapEngine = panel.shadowRoot.querySelector('pm-map-engine');
    const mapShadow = mapEngine?.shadowRoot;
    const leaflet = mapShadow?.querySelector('.leaflet-container');
    return {
      panelContainer: getComputedStyle(panel.shadowRoot.querySelector('.panel-container')).zIndex,
      mapContainer: mapContainer ? getComputedStyle(mapContainer).zIndex : 'N/A',
      mapContainerPosition: mapContainer ? getComputedStyle(mapContainer).position : 'N/A',
      leafletZIndex: leaflet ? getComputedStyle(leaflet).zIndex : 'N/A',
    };
  });
  console.log('\nZ-indexes:', JSON.stringify(zIndexes, null, 2));

  // Portrait screenshot
  await page.screenshot({ path: 'dev-server/screenshot-mobile-portrait.png', fullPage: false });
  console.log('\nPortrait screenshot saved');

  // Rotate to landscape
  await page.setViewportSize({ width: iPhone.viewport.height, height: iPhone.viewport.width });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'dev-server/screenshot-mobile-landscape.png', fullPage: false });
  console.log('Landscape screenshot saved');

  // Rotate back
  await page.setViewportSize({ width: iPhone.viewport.width, height: iPhone.viewport.height });
  await page.waitForTimeout(1000);
  
  // Check if map resized properly
  const afterRotate = await page.evaluate(() => {
    const panel = document.querySelector('property-manager-panel');
    const mapEngine = panel?.shadowRoot?.querySelector('pm-map-engine');
    const leaflet = mapEngine?.shadowRoot?.querySelector('.leaflet-container');
    return {
      panelWidth: panel?.offsetWidth,
      mapWidth: leaflet?.offsetWidth,
      mapHeight: leaflet?.offsetHeight,
      tilesLoaded: mapEngine?.shadowRoot?.querySelectorAll('.leaflet-tile').length,
    };
  });
  console.log('\nAfter rotation back:', JSON.stringify(afterRotate, null, 2));

  await page.screenshot({ path: 'dev-server/screenshot-mobile-after-rotate.png', fullPage: false });
  console.log('After-rotate screenshot saved');

  console.log('\n=== ERRORS ===');
  errors.forEach(e => console.log(`❌ ${e}`));
  if (errors.length === 0) console.log('✅ No errors');

  await browser.close();
})();
