import path from 'node:path';
import { test, expect } from '@playwright/test';

const email = process.env.E2E_OWNER_EMAIL ?? process.env.OWNER_EMAIL ?? 'owner@example.com';
const password = process.env.E2E_OWNER_PASSWORD ?? process.env.OWNER_PASSWORD ?? 'change-me-local-only';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: /open desk/i }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test('public portfolio renders database-backed work', async ({ page }) => {
  // Skip the one-shot stickman cutscene so content assertions stay stable.
  await page.addInitScript(() => {
    sessionStorage.setItem('portfolio-intro-seen', '1');
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('I DESIGN');
  await expect(page.getByText('SELECTED WORK')).toBeVisible();
});

test('owner can authenticate and open CMS', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});

test('golden path: upload -> draft -> case study -> publish -> public', async ({ page }) => {
  await login(page);

  await page.goto('/admin/media');
  await page.locator('input[type=file]').setInputFiles(path.resolve('tests/fixtures/e2e-cover.png'));
  await page.getByRole('button', { name: 'Upload', exact: true }).click();
  await expect(page.getByText('e2e-cover.png').first()).toBeVisible();

  const slug = `e2e-project-${Date.now()}`;
  await page.goto('/admin/projects/new');
  await page.getByLabel('Title').fill('E2E Portfolio Project');
  await page.getByLabel('Slug').fill(slug);
  await page.getByLabel('Short summary').fill('Created by the local Playwright golden-path test.');
  await page.getByRole('button', { name: 'Create draft' }).click();
  await expect(page).toHaveURL(/\/admin\/projects\/[0-9a-f-]+$/i);

  await page.getByLabel('Cover image').selectOption({ label: /e2e-cover\.png/ });
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByText('Saved.')).toBeVisible();

  await page.getByRole('button', { name: '+ heading' }).click();
  await page.getByRole('button', { name: '+ paragraph' }).click();
  await page.getByRole('button', { name: 'Publish', exact: true }).click();
  await expect(page.getByText('publish complete.')).toBeVisible();

  await page.goto(`/work/${slug}`);
  await expect(page.getByRole('heading', { name: 'E2E Portfolio Project' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'New section' })).toBeVisible();
});

test('reduced motion keeps core content visible', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/journey');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.milestone').first()).toBeVisible();
});
