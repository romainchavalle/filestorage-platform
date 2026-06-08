import { test, expect } from './fixtures';

test.describe('Flux Authentification', () => {
  test('Inscription réussie et redirection vers Dashboard', async ({ page }) => {
    // 1. Mock des requêtes réseau
    await page.route('**/auth/register', async (route) => {
      await route.fulfill({
        status: 201,
        json: { id: 'user-123', email: 'test@playwright.com' }
      });
    });

    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 201,
        json: { access_token: 'fake-jwt-token' }
      });
    });

    // 2. Action Utilisateur
    await page.goto('/register');

    // Remplir le formulaire
    await page.fill('input[placeholder="Saisissez votre email..."]', 'test@playwright.com');
    await page.fill('input[placeholder="Saisissez votre mot de passe..."]', 'password123');
    await page.fill('input[placeholder="Saisissez-le à nouveau..."]', 'password123');

    // Cliquer sur le bouton d'inscription
    await page.click('button:has-text("Créer mon compte")');

    // 3. Vérification : On doit atterrir sur le dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h2:has-text("Mes fichiers")')).toBeVisible();
  });

  test('Connexion réussie', async ({ page }) => {
    await page.route('**/auth/login', async (route) => {
      await route.fulfill({
        status: 201,
        json: { access_token: 'fake-jwt-token' }
      });
    });

    await page.goto('/login');

    await page.fill('input[placeholder="Saisissez votre email..."]', 'test@playwright.com');
    await page.fill('input[placeholder="Saisissez votre mot de passe..."]', 'password123');
    await page.click('button:has-text("Connexion")');

    await expect(page).toHaveURL('/dashboard');
  });
});
