import { test as base } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Cette fixture extrait window.__coverage__ à la fin de chaque test
export const test = base.extend({
  page: async ({ page }, use) => {
    await use(page);

    const coverage = await page.evaluate(() => (window as any).__coverage__);
    if (coverage) {
      const nycPath = path.join(process.cwd(), '.nyc_output');
      if (!fs.existsSync(nycPath)) {
        fs.mkdirSync(nycPath, { recursive: true });
      }
      
      const fileName = `coverage-${crypto.randomBytes(16).toString('hex')}.json`;
      fs.writeFileSync(
        path.join(nycPath, fileName),
        JSON.stringify(coverage)
      );
    }
  },
});

export { expect } from '@playwright/test';
