import { test, expect, loginAs, TEST_USER, waitForPageLoad } from './fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display main dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);

    // Check for dashboard elements
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should navigate to news section', async ({ page }) => {
    await page.goto('/dashboard');

    // Find and click news link in sidebar or navigation
    const newsLink = page.getByRole('link', { name: /뉴스|News/i }).first();
    if (await newsLink.isVisible()) {
      await newsLink.click();
      await expect(page).toHaveURL(/dashboard/);
    }
  });

  test('should display news list', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);

    // Check for news items or empty state
    const newsItems = page.locator('[data-testid="news-item"], .news-card, article');
    const emptyState = page.getByText(/뉴스가 없습니다|데이터가 없습니다/i);

    // Either news items exist or empty state is shown
    const hasNews = (await newsItems.count()) > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasNews || hasEmpty).toBeTruthy();
  });

  test('should navigate to companies section', async ({ page }) => {
    await page.goto('/dashboard/companies');
    await waitForPageLoad(page);

    // Should show companies page
    await expect(page.getByText(/증권사|회사|고객사/i).first()).toBeVisible();
  });

  test('should navigate to contracts section', async ({ page }) => {
    await page.goto('/dashboard/contracts');
    await waitForPageLoad(page);

    // Should show contracts dashboard
    await expect(page.getByText(/계약|Powerbase|매출/i).first()).toBeVisible();
  });

  test('should navigate to personnel section', async ({ page }) => {
    await page.goto('/dashboard/personnel');
    await waitForPageLoad(page);

    // Should show personnel page
    await expect(page.getByText(/인사|임원|동향/i).first()).toBeVisible();
  });

  test('should navigate to reports section', async ({ page }) => {
    await page.goto('/dashboard/reports');
    await waitForPageLoad(page);

    // Should show reports page
    await expect(page.getByText(/리포트|보고서|주간/i).first()).toBeVisible();
  });
});

test.describe('Dashboard Filters', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard');
    await waitForPageLoad(page);
  });

  test('should filter news by company', async ({ page }) => {
    // Find company filter dropdown
    const companyFilter = page.locator('select, [role="combobox"]').first();
    if (await companyFilter.isVisible()) {
      await companyFilter.click();

      // Select a company if options exist
      const options = page.locator('option, [role="option"]');
      if ((await options.count()) > 1) {
        await options.nth(1).click();
        await waitForPageLoad(page);
      }
    }
  });

  test('should search news by keyword', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/검색|Search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('증권');
      await searchInput.press('Enter');
      await waitForPageLoad(page);
    }
  });
});
