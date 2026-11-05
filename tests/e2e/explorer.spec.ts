import { expect, test } from '@playwright/test';

test('search, malformed URL recovery, and organization navigation', async ({
  page,
}) => {
  await page.goto('/?filters=%7Bnot-json%7D');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Search organizations' });
  await search.fill('Metasploit');
  const metasploitCard = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Metasploit', exact: true }),
  });
  await expect(metasploitCard).toBeVisible();
  await metasploitCard.hover();
  await expect(metasploitCard).toHaveCSS('cursor', 'pointer');
  expect(
    await metasploitCard.evaluate((card) => getComputedStyle(card).transform),
  ).not.toBe('none');
  await metasploitCard.getByText('Projects', { exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Metasploit' }),
  ).toBeVisible();
});

test('bookmark persists into shortlist', async ({ page }) => {
  await page.goto('/?q=Metasploit');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const saveButton = page.getByRole('button', { name: 'Save Metasploit' });
  await expect(saveButton.locator('svg')).toBeVisible();
  await saveButton.click();
  await expect(page).toHaveURL(/\?q=Metasploit/);
  await page.goto('/shortlist/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(
    page.getByRole('heading', { name: 'Metasploit', exact: true }),
  ).toBeVisible();
});

test('filters and clear-all are usable on mobile', async ({
  page,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.includes('mobile'),
    'Mobile-only drawer test',
  );
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page.getByRole('button', { name: /^Filters/ }).click();
  await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible();
  await page.getByRole('checkbox', { name: /2026/ }).check();
  await page.getByRole('button', { name: 'Close filters' }).click();
  await expect(page.getByText('1 active')).toBeVisible();
  await page.getByRole('button', { name: 'Clear all filters' }).click();
  await expect(page.getByText('1 active')).toHaveCount(0);
});
