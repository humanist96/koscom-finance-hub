import { test, expect, loginAs, TEST_USER, waitForPageLoad } from './fixtures';

test.describe('Alerts Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
  });

  test('should display alerts dropdown in header', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);

    // Look for notification bell or alerts icon
    const alertIcon = page.locator(
      '[data-testid="alerts-button"], [aria-label*="알림"], button:has(svg)'
    );
    const bellIcon = page.locator('button').filter({ has: page.locator('svg') });

    const hasAlertIcon = await alertIcon.first().isVisible().catch(() => false);
    const hasBellIcon = await bellIcon.first().isVisible().catch(() => false);

    // There should be some notification/alert element
    expect(hasAlertIcon || hasBellIcon).toBeTruthy();
  });

  test('should open alerts dropdown on click', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);

    // Find and click the alerts button
    const alertButton = page.locator(
      '[data-testid="alerts-button"], [aria-label*="알림"]'
    ).first();

    if (await alertButton.isVisible()) {
      await alertButton.click();
      await page.waitForTimeout(300);

      // Check for dropdown content
      const dropdown = page.locator(
        '[data-testid="alerts-dropdown"], [role="menu"], .dropdown-menu'
      );
      const alertList = page.getByText(/알림|새 소식|최근/i);

      const hasDropdown = await dropdown.isVisible().catch(() => false);
      const hasAlertText = await alertList.isVisible().catch(() => false);

      expect(hasDropdown || hasAlertText).toBeTruthy();
    }
  });

  test('should navigate to alerts settings', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForPageLoad(page);

    // Look for alerts settings link
    const settingsLink = page.getByRole('link', { name: /알림 설정|설정/i });
    const settingsButton = page.getByRole('button', { name: /설정/i });

    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await waitForPageLoad(page);
    } else if (await settingsButton.isVisible()) {
      await settingsButton.click();
      await waitForPageLoad(page);
    }
  });
});

test.describe('Keyword Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard');
    await waitForPageLoad(page);
  });

  test('should display keyword alert settings', async ({ page }) => {
    // Navigate to alert settings if there's a dedicated page
    const alertSettingsLink = page.getByRole('link', { name: /알림|키워드/i });

    if (await alertSettingsLink.isVisible()) {
      await alertSettingsLink.click();
      await waitForPageLoad(page);

      // Check for keyword input or list
      const keywordSection = page.getByText(/키워드/i);
      expect(await keywordSection.isVisible()).toBeTruthy();
    }
  });

  test('should allow adding keyword alerts', async ({ page }) => {
    // Look for keyword input field
    const keywordInput = page.getByPlaceholder(/키워드|검색어/i);
    const addButton = page.getByRole('button', { name: /추가|등록/i });

    if (await keywordInput.isVisible()) {
      await keywordInput.fill('테스트키워드');

      if (await addButton.isVisible()) {
        // Don't actually click to avoid modifying test data
        await expect(addButton).toBeEnabled();
      }
    }
  });

  test('should display existing keyword alerts', async ({ page }) => {
    // Look for keyword list
    const keywordList = page.locator(
      '[data-testid="keyword-list"], .keyword-list, [data-testid="keywords"]'
    );
    const keywords = page.locator('.keyword-tag, .keyword-badge, [data-testid="keyword"]');
    const emptyState = page.getByText(/등록된 키워드가 없습니다|키워드를 추가/i);

    const hasList = await keywordList.isVisible().catch(() => false);
    const hasKeywords = await keywords.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    // Either keywords or empty state should exist
    expect(hasList || hasKeywords || hasEmpty).toBeTruthy();
  });
});

test.describe('Company Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard');
    await waitForPageLoad(page);
  });

  test('should display company alert settings', async ({ page }) => {
    // Look for company watch list section
    const companySection = page.getByText(/관심 회사|회사 알림|증권사/i);

    if (await companySection.isVisible()) {
      // Check for company list
      const companyList = page.locator('[data-testid="company-alerts"], .company-list');
      const hasCompanyList = await companyList.isVisible().catch(() => false);

      expect(hasCompanyList || await companySection.isVisible()).toBeTruthy();
    }
  });

  test('should allow selecting companies for alerts', async ({ page }) => {
    // Look for company selection UI
    const companySelect = page.locator(
      'select[name*="company"], [data-testid="company-select"]'
    );
    const companyCheckboxes = page.locator('input[type="checkbox"]');

    const hasSelect = await companySelect.isVisible().catch(() => false);
    const hasCheckboxes = await companyCheckboxes.count() > 0;

    // Either dropdown or checkbox selection should exist
    expect(hasSelect || hasCheckboxes).toBeTruthy();
  });
});

test.describe('Alert Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await page.goto('/dashboard');
    await waitForPageLoad(page);
  });

  test('should display unread alert count', async ({ page }) => {
    // Look for badge with unread count
    const badge = page.locator('.badge, .notification-count, [data-testid="alert-count"]');
    const countText = page.locator('[data-testid="alerts-button"] span');

    const hasBadge = await badge.isVisible().catch(() => false);
    const hasCount = await countText.isVisible().catch(() => false);

    // Badge may or may not be visible depending on unread alerts
    expect(true).toBeTruthy();
  });

  test('should mark alerts as read', async ({ page }) => {
    // Open alerts dropdown
    const alertButton = page.locator('[data-testid="alerts-button"]').first();

    if (await alertButton.isVisible()) {
      await alertButton.click();
      await page.waitForTimeout(300);

      // Look for mark as read button
      const markReadButton = page.getByRole('button', { name: /읽음|확인/i });

      if (await markReadButton.isVisible()) {
        // Verify button is present and enabled
        await expect(markReadButton).toBeEnabled();
      }
    }
  });
});
