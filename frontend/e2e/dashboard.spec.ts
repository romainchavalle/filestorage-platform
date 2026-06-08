import { test, expect } from './fixtures';

test.describe('Flux Dashboard', () => {
  test('Affichage, Filtrage et Suppression', async ({ page }) => {
    // 1. Injection du token dans le localStorage pour être connecté
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'fake-jwt');
    });

    // 2. Mocks
    await page.route('**/files', async (route) => {
      await route.fulfill({
        status: 200,
        json: [
          {
            id: 'file-1',
            original_name: 'actif.pdf',
            mime_type: 'application/pdf',
            size_bytes: 1000,
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            isProtected: false,
          },
          {
            id: 'file-2',
            original_name: 'expire.png',
            mime_type: 'image/png',
            size_bytes: 2000,
            expires_at: new Date(Date.now() - 86400000).toISOString(),
            isProtected: true,
          }
        ]
      });
    });

    await page.route('**/files/file-1', async (route) => {
      await route.fulfill({ status: 200 });
    });

    // 3. Actions
    await page.goto('/dashboard');

    // Vérifier que les 2 fichiers s'affichent
    await expect(page.locator('text="actif.pdf"')).toBeVisible();
    await expect(page.locator('text="expire.png"')).toBeVisible();

    // Filtrer Actifs
    await page.click('button:has-text("Actifs")');
    await expect(page.locator('text="actif.pdf"')).toBeVisible();
    await expect(page.locator('text="expire.png"')).not.toBeVisible();

    // Revenir à Tous et supprimer l'actif
    await page.click('button:has-text("Tous")');
    const fileCard = page.locator('.border', { hasText: 'actif.pdf' });
    await fileCard.locator('button:has-text("Supprimer")').click();

    // Modale de confirmation
    await page.click('button:has-text("Supprimer définitivement")');

    // Vérifier la suppression visuelle
    await expect(page.locator('text="actif.pdf"')).not.toBeVisible();
    await expect(page.locator('text="expire.png"')).toBeVisible();
  });
});
