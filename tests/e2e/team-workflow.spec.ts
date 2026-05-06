import { expect, test } from '@playwright/test';
import { buildDragoniteCore, gotoMobileApp, openMobileTab, pickSearchResult, readTeamExport } from './helpers';

test.describe('workflow équipe mobile', () => {
  test('crée une team vide puis construit un set exportable', async ({ page }) => {
    await gotoMobileApp(page);

    await page.getByRole('button', { name: /créer une team vide/i }).click();
    await expect(page.getByRole('heading', { name: 'Build' })).toBeVisible();

    await buildDragoniteCore(page);

    await page.getByRole('button', { name: /détails avancés slot 1/i }).click();
    await pickSearchResult(page, /slot 1 nature/i, 'rigide', /Rigide/i);
    await expect(page.locator('.ev-nature-note')).toContainText('+Attaque / -Attaque Spéciale');
    await page.getByRole('button', { name: /Attaquant physique rapide/i }).click();
    await expect(page.locator('.ev-total-pill')).toHaveText('510/510 EV');

    const exportText = await readTeamExport(page);
    expect(exportText).toContain('Dragonite @ Heavy-Duty Boots');
    expect(exportText).toContain('Ability: Multiscale');
    expect(exportText).toContain('EVs: 6 HP / 252 Atk / 252 Spe');
    expect(exportText).toContain('Adamant Nature');
    expect(exportText).toContain('- Dragon Claw');
    expect(exportText).toContain('- Earthquake');
  });

  test('affiche les détails enrichis des attaques, dont le STAB', async ({ page }) => {
    await gotoMobileApp(page);
    await buildDragoniteCore(page);

    const dragonClawRow = page.locator('.selected-move-row').filter({ hasText: 'Draco-Griffe' }).first();
    await expect(dragonClawRow).toContainText('Dragon');
    await expect(dragonClawRow).toContainText('Physique');
    await expect(dragonClawRow).toContainText('STAB');
    await expect(dragonClawRow).toContainText('80');
    await expect(dragonClawRow).toContainText('100%');
    await expect(dragonClawRow).toContainText('PP 15');
  });

  test('garde les résultats des attaques empilés sans chevauchement', async ({ page }) => {
    await gotoMobileApp(page);
    await openMobileTab(page, 'Build');
    await pickSearchResult(page, /slot 1 pokémon/i, 'draco', /Dracolosse/i);

    await page.getByRole('combobox', { name: /slot 1 attaque 1/i }).fill('draco');
    const listbox = page.getByRole('listbox', { name: /résultats de recherche/i });
    await expect(listbox).toBeVisible();
    await expect.poll(async () => listbox.getByRole('option').count()).toBeGreaterThan(1);

    const geometry = await listbox.getByRole('option').evaluateAll((nodes) => {
      const boxes = nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, height: rect.height, scrollHeight: node.scrollHeight };
      });

      return boxes.map((box, index) => ({
        overlapsPrevious: index > 0 && box.top < boxes[index - 1].bottom - 1,
        clipsContent: box.scrollHeight > box.height + 1,
      }));
    });

    expect(geometry.some((row) => row.overlapsPrevious || row.clipsContent)).toBe(false);
  });

  test('garde les recherches et libellés cohérents au switch FR vers EN', async ({ page }) => {
    await gotoMobileApp(page);

    await openMobileTab(page, 'Build');
    await expect(page.getByRole('heading', { name: 'Build' })).toBeVisible();

    await pickSearchResult(page, /slot 1 pokémon/i, 'dragonite', /Dracolosse/i);
    await pickSearchResult(page, /slot 1 objet/i, 'heavy', /Grosses Bottes/i);
    await pickSearchResult(page, /slot 1 attaque 1/i, 'dragon claw', /Draco-Griffe/i);
    await expect(page.getByRole('combobox', { name: /slot 1 pokémon/i })).toHaveValue('Dracolosse');

    const languageSwitch = page.getByLabel('Langue');
    await languageSwitch.getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.getByRole('combobox', { name: /slot 1 pokémon/i })).toHaveValue('Dragonite');
    await expect(page.getByRole('combobox', { name: /slot 1 objet/i })).toHaveValue('Heavy-Duty Boots');
    await expect(page.getByRole('combobox', { name: /slot 1 attaque 1/i })).toHaveValue('Dragon Claw');

    await languageSwitch.getByRole('button', { name: 'FR', exact: true }).click();
    await expect(page.getByRole('combobox', { name: /slot 1 pokémon/i })).toHaveValue('Dracolosse');
    await expect(page.getByRole('combobox', { name: /slot 1 objet/i })).toHaveValue('Grosses Bottes');
    await expect(page.getByRole('combobox', { name: /slot 1 attaque 1/i })).toHaveValue('Draco-Griffe');

    const exportText = await readTeamExport(page);
    expect(exportText).toContain('Dragonite @ Heavy-Duty Boots');
    expect(exportText).toContain('- Dragon Claw');
  });

  test('sauvegarde localement puis recharge une team', async ({ page }) => {
    await gotoMobileApp(page);
    await buildDragoniteCore(page);
    await openMobileTab(page, 'Team');

    await page.getByLabel(/nom de sauvegarde/i).fill('Ladder BO1');
    await page.getByRole('button', { name: /sauvegarder l'équipe/i }).click();
    await expect(page.getByRole('status')).toContainText('Ladder BO1');

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
    await expect(page.locator('.saved-team-card').filter({ hasText: 'Ladder BO1' })).toBeVisible();

    await page.getByRole('button', { name: /Charger Ladder BO1/i }).click();
    await expect(page.getByRole('heading', { name: 'Build' })).toBeVisible();

    const exportText = await readTeamExport(page);
    expect(exportText).toContain('Dragonite @ Heavy-Duty Boots');
  });

  test('prépare les actifs 1v1 et 2v2 même avec une team partielle', async ({ page }) => {
    await gotoMobileApp(page);
    await buildDragoniteCore(page);

    await openMobileTab(page, 'Actifs');
    await expect(page.getByText(/1\/3 actifs prêts/i)).toBeVisible();
    await expect(page.getByRole('combobox', { name: /actif 1/i })).toBeVisible();

    await openMobileTab(page, 'Team');
    await page.getByRole('button', { name: /2v2 actif/i }).click();
    await expect(page.getByLabel(/préparer la team/i).getByText(/1\/4 actifs prêts/i)).toBeVisible();

    await openMobileTab(page, 'Match');
    await expect(page.getByRole('heading', { name: 'Match', exact: true })).toBeVisible();
    await expect(page.getByText('Couverture offensive')).toBeVisible();
    await expect(page.getByText('Couverture défensive')).toBeVisible();
    await expect(page.getByText(/Adversaires fréquents dangereux/i)).toBeVisible();
  });
});
