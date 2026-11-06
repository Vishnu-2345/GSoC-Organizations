import { expect, test } from '@playwright/test';

test('uses the official brand across the page and browser tab', async ({
  page,
}) => {
  await page.goto('/shortlist/');
  await expect(page).toHaveTitle('GSoC Organizations');

  const favicon = page.locator('link[rel="icon"]').first();
  await expect(favicon).toHaveAttribute(
    'href',
    '/brand/gsoc-organizations-favicon.ico',
  );

  const homeLink = page.getByRole('link', {
    name: 'GSoC Organizations home',
  });
  await expect(homeLink.locator('img')).toHaveAttribute(
    'src',
    '/brand/gsoc-organizations-logo.svg',
  );
  await homeLink.click();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle('GSoC Organizations');
  await expect(
    page.getByRole('heading', { level: 1, name: 'GSoC Organizations' }),
  ).toBeVisible();
  await expect(page.getByText('GSoC archive', { exact: true })).toHaveCount(0);
});

test('search, malformed URL recovery, and organization navigation', async ({
  page,
}) => {
  await page.goto('/?filters=%7Bnot-json%7D');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  const firstOrganizationLogo = page.locator('.org-logo').first();
  await expect(firstOrganizationLogo).toHaveCSS('border-top-width', '0px');
  await expect(firstOrganizationLogo).toHaveCSS('width', '132px');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Search organizations' });
  await search.fill('Metasplot');
  await expect(page.getByRole('button', { name: 'Clear search' })).toHaveCount(
    1,
  );
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

test('directory reveals organizations in batches of 25', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(page.getByRole('article')).toHaveCount(25);
  await expect(page.getByText('Showing 25 of 519')).toBeVisible();
  await page.getByRole('button', { name: 'Load more organizations' }).click();
  await expect(page.getByRole('article')).toHaveCount(50);
  await expect(page.getByText('Showing 50 of 519')).toBeVisible();
});

test('cards show the complete participation history', async ({ page }) => {
  await page.goto('/?q=NumFOCUS');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const card = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'NumFOCUS', exact: true }),
  });
  const participationYears = card.locator('.year-row');

  await expect(participationYears.locator('span')).toHaveCount(11);
  await expect(
    participationYears.getByText('2016', { exact: true }),
  ).toBeVisible();
  await expect(participationYears.locator('small')).toHaveCount(0);
});

test('organization profiles preserve contributor and archive details', async ({
  page,
}) => {
  await page.goto('/org/3dtk/');

  await expect(page.getByText('Contributor: Xia Sun')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'View 2018 organization archive' }),
  ).toHaveAttribute(
    'href',
    'https://summerofcode.withgoogle.com/archive/2018/organizations/5685665089978368/',
  );
});

test('filters offer option search and a first-time shortcut', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes('mobile'),
    'Desktop sidebar behavior is covered here; the drawer is covered separately.',
  );
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const filters = page.getByRole('complementary', {
    name: 'Organization filters',
  });
  await filters
    .getByRole('searchbox', { name: 'Search technologies' })
    .fill('python');
  await filters.getByRole('checkbox', { name: 'python', exact: true }).check();
  await expect(page).toHaveURL(/technology=python/i);
  await expect(page.getByText('1 active')).toHaveCount(0);
  await expect(
    filters.getByRole('button', { name: 'Clear all' }),
  ).toBeVisible();

  await filters.getByRole('button', { name: 'Clear all' }).click();
  await filters.getByRole('checkbox', { name: /New to GSoC in 2026/ }).check();
  await expect(page).toHaveURL(/firstTime=1/);
});

test('footer provides project, privacy, and creator links', async ({
  page,
}) => {
  await page.route(
    'https://api.github.com/repos/rohanmalhotracodes/GSoC-Organizations',
    (route) => route.fulfill({ json: { stargazers_count: 1234 } }),
  );
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  await expect(
    footer.getByText('Rohan Malhotra', { exact: true }),
  ).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Directory' })).toHaveCount(0);
  await expect(footer.getByRole('link', { name: 'Shortlist' })).toHaveCount(0);
  await expect(footer).not.toContainText('↗');
  await expect(
    footer.getByRole('link', { name: 'GitHub repository' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/rohanmalhotracodes/GSoC-Organizations',
  );
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
    'href',
    'https://www.linkedin.com/in/rohanmalhotracodes/',
  );
  await expect(footer.getByRole('link', { name: 'X' })).toHaveAttribute(
    'href',
    'https://x.com/rohangotnochill',
  );
  await expect(
    footer.getByRole('link', { name: 'Star GSoC Organizations on GitHub' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/rohanmalhotracodes/GSoC-Organizations',
  );
  await expect(footer.getByTestId('github-star-count')).toHaveText('1,234');
  await footer.getByRole('link', { name: 'Privacy policy' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Privacy policy' }),
  ).toBeVisible();
});

test('filters and drawer clear-all are usable on mobile', async ({
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
  await page.getByRole('checkbox', { name: 'Participation year 2026' }).check();
  await page.getByRole('button', { name: 'Close filters' }).click();
  await expect(page.getByRole('button', { name: 'Filters (1)' })).toBeVisible();
  await expect(page.getByText('1 active')).toHaveCount(0);
  await page.getByRole('button', { name: 'Filters (1)' }).click();
  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByRole('button', { name: 'Close filters' }).click();
  await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();
});
