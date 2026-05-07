import { expect, type Page } from '@playwright/test';

export async function gotoMobileApp(page: Page, path = '/app') {
  await page.goto(path);
  await expect(page.getByLabel(/application mobile champions/i)).toBeVisible();
  await expect(page.locator('.mockup-mobile-shell')).toHaveAttribute('data-design-source', 'maquette_v1');
}

export async function expectNoHorizontalOverflow(page: Page) {
  const metrics = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

export async function pickSearchResult(page: Page, label: RegExp, query: string, optionName: RegExp) {
  const input = page.getByRole('combobox', { name: label });
  await input.fill(query);

  const option = page.getByRole('option', { name: optionName }).first();
  await expect(option).toBeVisible();
  await option.click();
}

export async function openMobileTab(page: Page, name: string | RegExp) {
  const navigation = page.getByRole('navigation', { name: /navigation mobile tactile/i });
  await navigation.getByRole('button', { name, exact: typeof name === 'string' }).click();
}

export async function buildDragoniteCore(page: Page) {
  await openMobileTab(page, 'Build');
  await expect(page.getByRole('heading', { name: 'Build' })).toBeVisible();

  await pickSearchResult(page, /slot 1 pokémon/i, 'draco', /Dracolosse/i);
  await page.getByRole('button', { name: /Multiécaille/i }).click();
  await pickSearchResult(page, /slot 1 objet/i, 'grosses', /Grosses Bottes/i);
  await pickSearchResult(page, /slot 1 attaque 1/i, 'draco', /Draco-Griffe/i);
  await pickSearchResult(page, /slot 1 attaque 2/i, 'seisme', /Séisme/i);
}

export async function readTeamExport(page: Page): Promise<string> {
  await openMobileTab(page, 'Team');
  const href = await page.getByRole('link', { name: /exporter l'équipe/i }).getAttribute('href');

  expect(href).toBeTruthy();
  const [, encoded = ''] = href?.split(',') ?? [];
  return decodeURIComponent(encoded);
}
