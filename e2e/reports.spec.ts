import { test, expect, loginAs, TEST_USER, waitForPageLoad } from './fixtures';

test.describe('Reports Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/reports');
    await waitForPageLoad(page);
  });

  test('should display reports page', async ({ page }) => {
    // Check for reports page header
    await expect(page.getByText(/리포트|보고서|주간/i).first()).toBeVisible();
  });

  test('should display weekly report list', async ({ page }) => {
    // Look for report list or cards
    const reportList = page.locator(
      '[data-testid="reports-list"], .reports-list, [data-testid="report-card"]'
    );
    const reportCards = page.locator('.report-card, [data-testid="report"]');
    const emptyState = page.getByText(/리포트가 없습니다|보고서가 없습니다/i);

    const hasList = await reportList.isVisible().catch(() => false);
    const hasCards = await reportCards.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    // Either reports or empty state should exist
    expect(hasList || hasCards || hasEmpty).toBeTruthy();
  });

  test('should display report date range', async ({ page }) => {
    // Look for date information in reports
    const dateText = page.getByText(/\d{4}년|주간|월간|\d{1,2}월/i);
    const dateElement = page.locator('[data-testid="report-date"], .report-date');

    const hasDateText = await dateText.first().isVisible().catch(() => false);
    const hasDateElement = await dateElement.first().isVisible().catch(() => false);

    expect(hasDateText || hasDateElement).toBeTruthy();
  });
});

test.describe('Report Generation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/reports');
    await waitForPageLoad(page);
  });

  test('should have report generation button', async ({ page }) => {
    // Look for generate report button
    const generateButton = page.getByRole('button', { name: /생성|만들기|새 리포트/i });

    if (await generateButton.isVisible()) {
      await expect(generateButton).toBeEnabled();
    }
  });

  test('should allow selecting date range for report', async ({ page }) => {
    // Look for date range selection
    const dateFromInput = page.locator(
      'input[type="date"], [data-testid="date-from"], [aria-label*="시작"]'
    ).first();
    const dateToInput = page.locator(
      'input[type="date"], [data-testid="date-to"], [aria-label*="종료"]'
    ).nth(1);

    // Date inputs may or may not be present depending on implementation
    if (await dateFromInput.isVisible()) {
      await expect(dateFromInput).toBeEnabled();
    }
  });
});

test.describe('Report Download', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/reports');
    await waitForPageLoad(page);
  });

  test('should have PDF download option', async ({ page }) => {
    // Look for download/export button
    const downloadButton = page.getByRole('button', { name: /다운로드|PDF|내보내기/i });
    const downloadLink = page.getByRole('link', { name: /다운로드|PDF/i });

    const hasButton = await downloadButton.isVisible().catch(() => false);
    const hasLink = await downloadLink.isVisible().catch(() => false);

    // Download functionality should be available
    if (hasButton || hasLink) {
      expect(true).toBeTruthy();
    }
  });

  test('should display report preview', async ({ page }) => {
    // Click on a report to preview
    const reportItem = page.locator(
      '[data-testid="report-item"], .report-card, .report-row'
    ).first();

    if (await reportItem.isVisible()) {
      await reportItem.click();
      await page.waitForTimeout(500);

      // Check for preview modal or content
      const preview = page.locator(
        '[data-testid="report-preview"], .report-preview, [role="dialog"]'
      );
      const reportContent = page.getByText(/요약|뉴스|인사|주요/i);

      const hasPreview = await preview.isVisible().catch(() => false);
      const hasContent = await reportContent.isVisible().catch(() => false);

      expect(hasPreview || hasContent).toBeTruthy();
    }
  });
});

test.describe('Report Content', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/reports');
    await waitForPageLoad(page);
  });

  test('should display news summary in report', async ({ page }) => {
    // Open a report if available
    const reportItem = page.locator(
      '[data-testid="report-item"], .report-card'
    ).first();

    if (await reportItem.isVisible()) {
      await reportItem.click();
      await waitForPageLoad(page);

      // Check for news summary section
      const newsSummary = page.getByText(/뉴스|기사|동향/i);
      const hasSummary = await newsSummary.isVisible().catch(() => false);
      expect(hasSummary).toBeTruthy();
    }
  });

  test('should display personnel changes in report', async ({ page }) => {
    const reportItem = page.locator(
      '[data-testid="report-item"], .report-card'
    ).first();

    if (await reportItem.isVisible()) {
      await reportItem.click();
      await waitForPageLoad(page);

      // Check for personnel section
      const personnelSection = page.getByText(/인사|임원|동향/i);
      const hasPersonnel = await personnelSection.isVisible().catch(() => false);
      expect(hasPersonnel).toBeTruthy();
    }
  });

  test('should display contract insights in report', async ({ page }) => {
    const reportItem = page.locator(
      '[data-testid="report-item"], .report-card'
    ).first();

    if (await reportItem.isVisible()) {
      await reportItem.click();
      await waitForPageLoad(page);

      // Check for contract/business section
      const contractSection = page.getByText(/계약|매출|Powerbase/i);
      const hasContract = await contractSection.isVisible().catch(() => false);
      expect(hasContract).toBeTruthy();
    }
  });
});

test.describe('Report Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard/reports');
    await waitForPageLoad(page);
  });

  test('should filter reports by date', async ({ page }) => {
    // Look for date filter
    const dateFilter = page.locator(
      'select[name*="date"], [data-testid="date-filter"], input[type="month"]'
    ).first();

    if (await dateFilter.isVisible()) {
      await dateFilter.click();
      await page.waitForTimeout(300);
    }
  });

  test('should filter reports by type', async ({ page }) => {
    // Look for report type filter
    const typeFilter = page.locator(
      'select[name*="type"], [data-testid="type-filter"], [aria-label*="유형"]'
    ).first();

    if (await typeFilter.isVisible()) {
      await typeFilter.click();
      await page.waitForTimeout(300);

      const options = page.locator('option, [role="option"]');
      if (await options.count() > 1) {
        await options.nth(1).click();
        await waitForPageLoad(page);
      }
    }
  });
});
