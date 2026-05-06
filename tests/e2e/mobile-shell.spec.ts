import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow, gotoMobileApp, openMobileTab } from './helpers';

test.describe('shell mobile unique', () => {
  test('présente la PWA sur la racine GitHub Pages avec un lien vers app', async ({ page }) => {
    for (const path of ['/', '/landing', '/docs', '/?path=/docs']) {
      await page.goto(path);
      await expect(page.getByLabel(/présentation pwa champions/i)).toBeVisible();
      await expect(page.getByRole('heading', { name: /Champions Companion/i })).toBeVisible();
      const appLinks = page.getByRole('link', { name: /ouvrir l'app/i });
      await expect(appLinks.first()).toHaveAttribute('href', /\/app$/);
      await expect(page.getByRole('heading', { name: /Installer sur iPhone/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: /Installer sur Android/i })).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test('garde les routes app sur la vue mobile', async ({ page }) => {
    for (const path of ['/app', '/mobile']) {
      await gotoMobileApp(page, path);
      await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
      await expect(page.getByText('Mon équipe')).toBeVisible();
      await expect(page.getByLabel(/présentation pwa champions/i)).toHaveCount(0);
    }
  });

  test('reste sans débordement horizontal sur mobile et desktop', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoMobileApp(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.locator('.mobile-team-slot')).toHaveCount(6);

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.reload();
    await expect(page.locator('.mockup-mobile-shell')).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const shellBox = await page.locator('.mockup-mobile-shell').boundingBox();
    const navBox = await page.locator('.mobile-tabbar').boundingBox();

    expect(Math.round(shellBox?.width ?? 0)).toBe(480);
    expect(Math.round(navBox?.width ?? 0)).toBe(64);
  });

  test('navigue entre les écrans principaux sans changer de shell', async ({ page }) => {
    await gotoMobileApp(page);

    await openMobileTab(page, 'Build');
    await expect(page.getByRole('heading', { name: 'Build' })).toBeVisible();
    await expect(page.getByLabel(/build mobile/i)).toBeVisible();

    await openMobileTab(page, 'Actifs');
    await expect(page.getByLabel(/actifs mobile/i).getByRole('heading', { name: 'Actifs' })).toBeVisible();
    await expect(page.getByText(/Cherche tes Pokémon/i)).toBeVisible();

    await openMobileTab(page, 'Match');
    await expect(page.getByRole('heading', { name: 'Match', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Plan de match' })).toBeVisible();

    await openMobileTab(page, 'Team');
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
  });

  test('expose le manifest et enregistre le service worker du shell PWA', async ({ page, request }) => {
    const manifestResponse = await request.get('/manifest.webmanifest');
    expect(manifestResponse.ok()).toBe(true);
    const manifest = await manifestResponse.json();

    expect(manifest.start_url).toBe('./app');
    expect(manifest.shortcuts.map((shortcut: { url: string }) => shortcut.url)).toEqual(['./app']);

    const serviceWorkerResponse = await request.get('/sw.js');
    expect(serviceWorkerResponse.ok()).toBe(true);
    expect(await serviceWorkerResponse.text()).toContain("'./app'");

    await gotoMobileApp(page);
    await page.evaluate(() => navigator.serviceWorker.ready);
    const hasRegistration = await page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()));
    expect(hasRegistration).toBe(true);
  });
});
