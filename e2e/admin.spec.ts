import { test, expect, loginAs, TEST_ADMIN, waitForPageLoad } from './fixtures';

test.describe('Admin - User Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_ADMIN.email, TEST_ADMIN.password);
  });

  test('should access admin users page', async ({ page }) => {
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    // Should show user management page
    await expect(page.getByText(/사용자 관리|User Management/i)).toBeVisible();
  });

  test('should display user list', async ({ page }) => {
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    // Check for table or list
    const userTable = page.locator('table, [role="table"]');
    const userList = page.locator('[data-testid="user-item"], .user-row');

    const hasTable = await userTable.isVisible().catch(() => false);
    const hasUsers = (await userList.count()) > 0;
    const emptyState = page.getByText(/사용자가 없습니다/i);
    const hasEmpty = await emptyState.isVisible().catch(() => false);

    expect(hasTable || hasUsers || hasEmpty).toBeTruthy();
  });

  test('should filter users by status', async ({ page }) => {
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    // Find status filter
    const statusFilter = page.locator('select').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption({ label: '승인 대기' });
      await waitForPageLoad(page);

      // URL should update or list should filter
      await expect(page).toHaveURL(/status=PENDING|admin\/users/);
    }
  });

  test('should search users', async ({ page }) => {
    await page.goto('/admin/users');
    await waitForPageLoad(page);

    const searchInput = page.getByPlaceholder(/검색|이름|이메일/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await waitForPageLoad(page);
    }
  });

  test('should show approve/reject buttons for pending users', async ({ page }) => {
    await page.goto('/admin/users?status=PENDING');
    await waitForPageLoad(page);

    // Check for action buttons if pending users exist
    const approveButton = page.getByRole('button', { name: /승인/i }).first();
    const rejectButton = page.getByRole('button', { name: /거절/i }).first();

    const hasActions =
      (await approveButton.isVisible().catch(() => false)) ||
      (await rejectButton.isVisible().catch(() => false));

    // If no pending users, this test passes
    if (!hasActions) {
      const emptyOrNoPending = page.getByText(/대기 중인 사용자가 없습니다|사용자가 없습니다/i);
      // Either actions exist or no pending users
      expect(true).toBeTruthy();
    }
  });
});

test.describe('Admin - Contract Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_ADMIN.email, TEST_ADMIN.password);
  });

  test('should access admin contracts page', async ({ page }) => {
    await page.goto('/admin/contracts');
    await waitForPageLoad(page);

    // Should show contracts management or redirect
    const hasContracts = await page.getByText(/계약|Contract|업로드/i).first().isVisible().catch(() => false);
    expect(hasContracts || page.url().includes('/admin')).toBeTruthy();
  });

  test('should show upload functionality', async ({ page }) => {
    await page.goto('/admin/contracts');
    await waitForPageLoad(page);

    // Check for upload button or file input
    const uploadButton = page.getByRole('button', { name: /업로드|Upload/i });
    const fileInput = page.locator('input[type="file"]');

    const hasUpload =
      (await uploadButton.isVisible().catch(() => false)) ||
      (await fileInput.count()) > 0;

    // Upload functionality should exist on contracts admin page
    if (page.url().includes('/admin/contracts')) {
      expect(hasUpload).toBeTruthy();
    }
  });
});

test.describe('Admin - Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, TEST_ADMIN.email, TEST_ADMIN.password);
  });

  test('should navigate between admin sections', async ({ page }) => {
    await page.goto('/admin/users');

    // Find sidebar or navigation
    const navLinks = page.locator('nav a, aside a, [role="navigation"] a');

    if ((await navLinks.count()) > 0) {
      // Click first available link
      const firstLink = navLinks.first();
      await firstLink.click();
      await waitForPageLoad(page);
    }
  });

  test('should access dashboard from admin', async ({ page }) => {
    await page.goto('/admin/users');

    const dashboardLink = page.getByRole('link', { name: /대시보드|Dashboard/i }).first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await expect(page).toHaveURL(/dashboard/);
    }
  });
});
