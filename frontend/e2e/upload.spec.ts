import { test, expect } from './fixtures';

test.describe('Flux Upload', () => {
  test('Partage d un fichier depuis la Home', async ({ page }) => {
    // 1. Mocks API
    await page.route('**/upload/init', async (route) => {
      await route.fulfill({
        status: 201,
        json: { fileId: 'file-123', presignedUrl: 'http://fake-s3.com/upload' }
      });
    });

    await page.route('http://fake-s3.com/upload', async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      } else {
        await route.fulfill({
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    });

    await page.route('**/upload/complete/file-123', async (route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': '*',
            'Access-Control-Allow-Headers': '*'
          }
        });
      } else {
        await route.fulfill({ 
          status: 200, 
          headers: { 'Access-Control-Allow-Origin': '*' },
          json: { success: true } 
        });
      }
    });

    // 2. Action Utilisateur
    await page.goto('/');

    // Attacher un fichier (Playwright gère l'input file de Dropzone)
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('text="Tu veux partager un fichier ?"');
    const fileChooser = await fileChooserPromise;
    
    await fileChooser.setFiles({
      name: 'test-file.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('ceci est un test E2E')
    });

    // Écran 2: le formulaire
    await expect(page.locator('text="test-file.txt"')).toBeVisible();

    // Remplir mot de passe optionnel
    await page.fill('input[placeholder="Optionnel"]', 'mon-mot-de-passe');
    
    // Changer expiration à 3 jours
    await page.selectOption('select', { value: '3' });

    // Téléverser
    await page.click('button:has-text("Téléverser")');

    // 3. Vérification Écran 3
    await expect(page.getByText('Félicitations')).toBeVisible();
    await expect(page.getByText('/d/file-123')).toBeVisible();

    // Tester le bouton Copier
    await page.click('button:has-text("Copier le lien")');
    await expect(page.getByText('Copié !')).toBeVisible();

    // Tester le bouton Recommencer
    await page.click('button:has-text("Partager un autre fichier")');
    await expect(page.getByText('Tu veux partager un fichier ?')).toBeVisible();
  });
});
