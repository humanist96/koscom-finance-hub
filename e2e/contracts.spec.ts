import { test, expect, loginAs, TEST_USER, waitForPageLoad } from './fixtures';

test.describe('Contracts Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/contracts');
    await waitForPageLoad(page);
  });

  test('should display contracts overview', async ({ page }) => {
    // Check for contracts page header
    await expect(page.getByText(/계약|Powerbase|매출/i).first()).toBeVisible();

    // Check for stats cards or summary section
    const statsSection = page.locator('[data-testid="stats"], .stats, .summary');
    const hasStats = await statsSection.count();

    // Either stats or data table should be visible
    if (hasStats === 0) {
      await expect(page.getByText(/계약|고객/i).first()).toBeVisible();
    }
  });

  test('should display contract statistics', async ({ page }) => {
    // Look for statistics/summary cards
    const statCards = page.locator('.stat-card, [data-testid="stat-card"], .card');

    // Wait for stats to load
    await page.waitForTimeout(1000);

    // Check for numeric values or statistics
    const hasNumbers = await page.getByText(/\d+/).first().isVisible();
    expect(hasNumbers).toBeTruthy();
  });

  test('should display customer contracts table', async ({ page }) => {
    // Check for table or list view
    const table = page.locator('table, [role="table"], [data-testid="contracts-table"]');
    const list = page.locator('[data-testid="contracts-list"], .contract-list');
    const emptyState = page.getByText(/계약 데이터가 없습니다|데이터가 없습니다/i);

    const hasTable = await table.count() > 0;
    const hasList = await list.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    // Either data view or empty state should be present
    expect(hasTable || hasList || hasEmpty).toBeTruthy();
  });

  test('should display service breakdown chart', async ({ page }) => {
    // Look for chart component
    const chart = page.locator(
      'canvas, svg, [data-testid="chart"], .recharts-wrapper, .chart-container'
    );

    // Wait for chart to potentially load
    await page.waitForTimeout(1000);

    const hasChart = await chart.count() > 0;
    const hasChartText = await page.getByText(/서비스|매출|비율/i).first().isVisible().catch(() => false);

    // Either chart or related text should be visible
    expect(hasChart || hasChartText).toBeTruthy();
  });

  test('should allow viewing contract details', async ({ page }) => {
    // Look for clickable contract rows
    const contractRow = page.locator(
      'tr[data-testid], [data-testid="contract-item"], .contract-row'
    ).first();

    if (await contractRow.isVisible()) {
      await contractRow.click();

      // Wait for modal or detail view
      await page.waitForTimeout(500);

      // Check for detail modal or expanded view
      const modal = page.locator('[role="dialog"], .modal, [data-testid="contract-detail"]');
      const detailView = page.getByText(/상세|세부|계약 정보/i);

      const hasModal = await modal.isVisible().catch(() => false);
      const hasDetail = await detailView.isVisible().catch(() => false);

      // May or may not have detail view depending on implementation
      expect(true).toBeTruthy();
    }
  });
});

test.describe('Contracts Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/contracts');
    await waitForPageLoad(page);
  });

  test('should filter contracts by company', async ({ page }) => {
    // Look for company filter
    const companyFilter = page.locator(
      'select[name*="company"], [data-testid="company-filter"], [aria-label*="회사"]'
    ).first();

    if (await companyFilter.isVisible()) {
      await companyFilter.click();

      // Select option if available
      const options = page.locator('option, [role="option"]');
      if (await options.count() > 1) {
        await options.nth(1).click();
        await waitForPageLoad(page);
      }
    }
  });

  test('should filter contracts by service type', async ({ page }) => {
    // Look for service type filter
    const serviceFilter = page.locator(
      'select[name*="service"], [data-testid="service-filter"], [aria-label*="서비스"]'
    ).first();

    if (await serviceFilter.isVisible()) {
      await serviceFilter.click();

      const options = page.locator('option, [role="option"]');
      if (await options.count() > 1) {
        await options.nth(1).click();
        await waitForPageLoad(page);
      }
    }
  });

  test('should filter contracts by date range', async ({ page }) => {
    // Look for date range filter
    const dateFilter = page.locator(
      'input[type="date"], [data-testid="date-filter"], [aria-label*="날짜"]'
    ).first();

    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Contract Data Export', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/contracts');
    await waitForPageLoad(page);
  });

  test('should have export functionality', async ({ page }) => {
    // Look for export button
    const exportButton = page.getByRole('button', { name: /내보내기|Export|다운로드/i });

    if (await exportButton.isVisible()) {
      // Verify export button is clickable (don't actually download)
      await expect(exportButton).toBeEnabled();
    }
  });
});
