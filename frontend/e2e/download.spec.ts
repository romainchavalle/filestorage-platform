import { test, expect } from './fixtures';

test.describe('Flux Téléchargement', () => {
  test('Téléchargement d un fichier protégé', async ({ page }) => {
    await page.route('**/download/123/public', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          id: '123',
          original_name: 'secret.txt',
          size_bytes: 500,
          expires_at: new Date(Date.now() + 86400000).toISOString(),
          isProtected: true
        }
      });
    });

    await page.route('**/download/123/link', async (route) => {
      const postData = route.request().postDataJSON();
      if (postData?.password === 'bon-mdp') {
        await route.fulfill({
          status: 200,
          json: { downloadUrl: 'http://fake-s3.com/download-me' }
        });
      } else {
        await route.fulfill({ status: 403, json: { message: 'Forbidden' } });
      }
    });

    await page.goto('/d/123');

    await expect(page.locator('text="secret.txt"')).toBeVisible();

    // Tentative avec mauvais mot de passe
    await page.fill('input[type="password"]', 'mauvais');
    await page.click('button:has-text("Télécharger")');
    await expect(page.getByText('Le mot de passe est invalide')).toBeVisible();

    // Tentative avec bon mot de passe
    await page.fill('input[type="password"]', 'bon-mdp');
    
    // On mock la destination S3 pour éviter un crash 404
    await page.route('http://fake-s3.com/download-me', async (route) => {
      await route.fulfill({ body: 'fichier telecharge' });
    });

    await page.click('button:has-text("Télécharger")');
    await page.waitForURL('http://fake-s3.com/download-me');
    expect(page.url()).toBe('http://fake-s3.com/download-me');
  });
});
