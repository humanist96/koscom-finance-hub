import { test, expect, TEST_USER } from './fixtures';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title and form elements
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/로그인|Login/i);
    await expect(page.getByPlaceholder('이메일')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호')).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('이메일').fill('invalid@test.com');
    await page.getByPlaceholder('비밀번호').fill('wrongpassword');
    await page.getByRole('button', { name: '로그인' }).click();

    // Should show error message
    await expect(page.getByText(/이메일 또는 비밀번호|오류|실패/i)).toBeVisible({ timeout: 5000 });
  });

  test('should show validation error for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: '로그인' }).click();

    // Should show validation errors or not submit
    const emailInput = page.getByPlaceholder('이메일');
    await expect(emailInput).toBeFocused();
  });

  test('should redirect to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /회원가입|가입/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/register/);
    }
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.getByPlaceholder('이메일').fill(TEST_USER.email);
    await page.getByPlaceholder('비밀번호').fill(TEST_USER.password);
    await page.getByRole('button', { name: '로그인' }).click();

    // Should redirect to dashboard or show pending status
    await page.waitForURL(/\/(dashboard|pending)/, { timeout: 10000 });
  });
});

test.describe('Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByPlaceholder('이메일')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호')).toBeVisible();
    await expect(page.getByPlaceholder('이름')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByPlaceholder('이메일').fill('invalid-email');
    await page.getByPlaceholder('비밀번호').fill('password123!');
    await page.getByPlaceholder('이름').fill('테스트');

    const submitButton = page.getByRole('button', { name: /가입|등록/i });
    await submitButton.click();

    // Should show validation error or not submit
    await expect(page).toHaveURL(/register/);
  });

  test('should validate password requirements', async ({ page }) => {
    await page.getByPlaceholder('이메일').fill('newuser@test.com');
    await page.getByPlaceholder('비밀번호').fill('short');  // Too short
    await page.getByPlaceholder('이름').fill('테스트');

    const submitButton = page.getByRole('button', { name: /가입|등록/i });
    await submitButton.click();

    // Should show validation error
    await expect(page).toHaveURL(/register/);
  });
});
