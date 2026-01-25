import { test as base, expect, Page } from '@playwright/test';

/**
 * Test user credentials for E2E tests
 * These should match seeded test data in the database
 */
export const TEST_USER = {
  email: 'test@koscom.co.kr',
  password: 'test1234!',
  name: '테스트 사용자',
};

export const TEST_ADMIN = {
  email: 'admin@koscom.co.kr',
  password: 'admin1234!',
  name: '관리자',
};

/**
 * Custom test fixture with authentication helpers
 */
export const test = base.extend<{
  authenticatedPage: Page;
  adminPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    await loginAs(page, TEST_USER.email, TEST_USER.password);
    await use(page);
  },
  adminPage: async ({ page }, use) => {
    await loginAs(page, TEST_ADMIN.email, TEST_ADMIN.password);
    await use(page);
  },
});

/**
 * Helper function to login as a specific user
 */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByPlaceholder('이메일').fill(email);
  await page.getByPlaceholder('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();

  // Wait for navigation to dashboard
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 });
}

/**
 * Helper function to logout
 */
export async function logout(page: Page) {
  // Click user menu or logout button
  const logoutButton = page.getByRole('button', { name: /로그아웃/i });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }
  await page.waitForURL('/login');
}

/**
 * Helper to wait for page load with network idle
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle');
}

/**
 * Helper to check if element is visible with retry
 */
export async function expectVisible(page: Page, selector: string, timeout = 5000) {
  await expect(page.locator(selector)).toBeVisible({ timeout });
}

export { expect };
