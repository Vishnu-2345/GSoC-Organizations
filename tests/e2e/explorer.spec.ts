import { expect, test } from '@playwright/test';

test('publishes canonical SEO and AI discovery metadata', async ({
  page,
  request,
}) => {
  await page.goto('/?q=python');

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://gsocorganizations.xyz/',
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    'content',
    'GSoC Organizations',
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary',
  );

  const structuredData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      '{}',
  );
  expect(structuredData['@graph']).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        '@type': 'WebSite',
        name: 'GSoC Organizations',
      }),
      expect.objectContaining({ '@type': 'CollectionPage' }),
    ]),
  );

  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain('User-agent: OAI-SearchBot');
  expect(await robots.text()).toContain(
    'Sitemap: https://gsocorganizations.xyz/sitemap.xml',
  );

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain(
    '<loc>https://gsocorganizations.xyz/org/python-software-foundation/</loc>',
  );
  expect(sitemapText).toContain(
    '<loc>https://gsocorganizations.xyz/year/2026/</loc>',
  );
  expect(sitemapText).toContain(
    '<loc>https://gsocorganizations.xyz/technology/cpp/</loc>',
  );
  expect(sitemapText).toContain(
    '<loc>https://gsocorganizations.xyz/topics/</loc>',
  );
  expect((sitemapText.match(/<loc>/g) ?? []).length).toBeGreaterThan(800);

  const aiSummary = await request.get('/llms.txt');
  expect(aiSummary.ok()).toBe(true);
  expect(await aiSummary.text()).toContain('# GSoC Organizations');
});

test('publishes answer-first static hub pages with internal navigation', async ({
  page,
  request,
}) => {
  await page.goto('/year/2026/');

  await expect(page).toHaveTitle(
    'GSoC 2026 Organizations | GSoC Organizations',
  );
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'GSoC organizations in 2026',
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /In 2026, 183 organizations took part in Google Summer of Code/,
    ),
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Breadcrumb' }),
  ).toContainText('Years');
  await expect(
    page.getByRole('heading', {
      level: 3,
      name: 'How many organizations participated in GSoC 2026?',
    }),
  ).toBeVisible();
  await expect(page.locator('.hub-org-grid a')).toHaveCount(183);

  const structuredData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      '{}',
  );
  expect(structuredData['@graph']).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ '@type': 'BreadcrumbList' }),
      expect.objectContaining({ '@type': 'ItemList', numberOfItems: 183 }),
      expect.objectContaining({ '@type': 'FAQPage' }),
    ]),
  );

  await page.goto('/technology/cpp/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'GSoC organizations using C++',
    }),
  ).toBeVisible();

  await page.goto('/technologies/');
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Technologies used by GSoC organizations',
    }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('contentinfo')
      .getByRole('link', { name: 'Program years', exact: true }),
  ).toBeVisible();

  expect((await request.get('/technology/c-sharp/')).ok()).toBe(true);
  expect((await request.get('/new-in-2026/')).ok()).toBe(true);
});

test('organization profiles publish entity metadata and private pages do not index', async ({
  page,
}) => {
  await page.goto('/org/python-software-foundation/');
  await expect(page).toHaveTitle('Python Software Foundation');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://gsocorganizations.xyz/org/python-software-foundation/',
  );
  const profileData = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent()) ??
      '{}',
  );
  expect(profileData['@graph']).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ '@type': 'BreadcrumbList' }),
      expect.objectContaining({
        '@type': 'Organization',
        name: 'Python Software Foundation',
      }),
    ]),
  );

  await page.goto('/shortlist/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex,follow',
  );
});

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
  await expect(
    homeLink.getByText('GSoC Organizations', { exact: true }),
  ).toBeVisible();
  await homeLink.getByText('GSoC Organizations', { exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle('GSoC Organizations');
  await expect(
    page.getByRole('heading', { level: 1, name: 'GSoC Organizations' }),
  ).toBeVisible();
  await expect(page.getByText('GSoC archive', { exact: true })).toHaveCount(0);
});

test('promotes the pinned contribution initiative across directory pages', async ({
  page,
}) => {
  const expectAnnouncement = async () => {
    const announcement = page.locator('.contribution-announcement');
    await expect(announcement).toBeVisible();
    await expect(announcement).toContainText('GSoC 2027 is approaching.');
    await expect(announcement).toContainText(
      'contributing directly to this website’s codebase',
    );
    await expect(
      announcement.getByRole('link', { name: /View contribution issue/ }),
    ).toHaveAttribute(
      'href',
      'https://github.com/rohanmalhotracodes/GSoC-Organizations/issues/382',
    );
  };

  await page.goto('/');
  await expectAnnouncement();

  await page.goto('/org/python-software-foundation/');
  await expectAnnouncement();

  await page.goto('/year/2026/');
  await expectAnnouncement();
});

test('provides delayed loading feedback for slow page transitions', async ({
  page,
}) => {
  await page.goto('/');

  const loadingScreen = page.locator('.site-loading');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(loadingScreen).toBeHidden();

  await page.evaluate(() => {
    const link = document.querySelector<HTMLAnchorElement>('a[href="/about/"]');
    link?.addEventListener('click', (event) => event.preventDefault(), {
      once: true,
    });
  });

  await page.getByRole('link', { name: 'About the data' }).click();
  await expect(page.locator('html')).toHaveClass(/page-navigating/);
  await expect(loadingScreen).toBeVisible();
  await expect(loadingScreen).toContainText('Opening About the data…');
  await expect(loadingScreen).toContainText(
    'This may take a moment on a slow connection',
  );
  await expect(loadingScreen.locator('.site-loading-spinner')).toBeVisible();

  await page.evaluate(() => {
    document.documentElement.classList.remove('page-navigating');
  });
  await expect(loadingScreen).toBeHidden();
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
  await expect(firstOrganizationLogo).toHaveCSS('width', '104px');
  const firstOrganizationImage = firstOrganizationLogo.locator('img');
  await expect(firstOrganizationImage).toHaveAttribute(
    'src',
    /^\/organization-logos\//,
  );
  await expect(firstOrganizationImage).toHaveAttribute('loading', 'eager');
  await expect(firstOrganizationImage).toHaveAttribute('fetchpriority', 'high');
  await expect(firstOrganizationLogo).toHaveClass(/is-loaded/);
  await expect(page.locator('.org-logo img').nth(8)).toHaveAttribute(
    'loading',
    'lazy',
  );
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
  await expect(
    page.locator('link[data-organization-profile-prefetch="metasploit"]'),
  ).toHaveAttribute('href', '/org/metasploit/');
  await expect(
    page.locator('link[data-organization-profile-prefetch="metasploit"]'),
  ).toHaveAttribute('rel', 'prefetch');
  await expect(
    metasploitCard.getByRole('link', { name: 'Metasploit' }),
  ).toHaveCSS('color', 'rgb(249, 171, 0)');
  await expect(metasploitCard).toHaveCSS('cursor', 'pointer');
  expect(
    await metasploitCard.evaluate((card) => getComputedStyle(card).transform),
  ).not.toBe('none');
  const popupPromise = page.waitForEvent('popup');
  await metasploitCard.getByText('Projects', { exact: true }).click();
  const profilePage = await popupPromise;
  await profilePage.waitForLoadState();
  await expect(page).toHaveURL(/\?q=Metasplot/);
  await expect(profilePage).toHaveTitle('Metasploit');
  await expect(
    profilePage.getByRole('heading', { level: 1, name: 'Metasploit' }),
  ).toBeVisible();
  await profilePage.close();
});

test('short search terms rank organization names and keep clear aligned', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const searchField = page.locator('.global-search');
  const search = page.getByRole('searchbox', { name: 'Search organizations' });
  await search.fill('br');
  await expect(
    page.getByRole('article').first().getByRole('heading'),
  ).toHaveText('BRL-CAD');

  const fieldBox = await searchField.boundingBox();
  const clearBox = await page
    .getByRole('button', { name: 'Clear search' })
    .boundingBox();
  expect(fieldBox).not.toBeNull();
  expect(clearBox).not.toBeNull();
  expect(
    Math.abs(
      clearBox!.y + clearBox!.height / 2 - (fieldBox!.y + fieldBox!.height / 2),
    ),
  ).toBeLessThan(1);
});

test('directory and profile mastheads keep the same position', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1700, height: 900 });
  await page.goto('/?q=Metasploit');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const directoryHeader = page.locator('.directory-header');
  const directoryBox = await directoryHeader.boundingBox();
  expect(directoryBox).not.toBeNull();

  const popupPromise = page.waitForEvent('popup');
  await page
    .getByRole('article')
    .filter({
      has: page.getByRole('heading', { name: 'Metasploit', exact: true }),
    })
    .click();
  const profilePage = await popupPromise;
  await profilePage.waitForLoadState();
  await profilePage.setViewportSize({ width: 1700, height: 900 });
  const profileBox = await profilePage
    .locator('.profile-directory-header')
    .boundingBox();
  expect(profileBox).not.toBeNull();
  expect(Math.abs(profileBox!.x - directoryBox!.x)).toBeLessThan(1);
  expect(Math.abs(profileBox!.y - directoryBox!.y)).toBeLessThan(1);
  expect(Math.abs(profileBox!.width - directoryBox!.width)).toBeLessThan(1);
  await expect(
    profilePage
      .locator('.profile-directory-header')
      .getByRole('link', { name: 'Star us on GitHub' }),
  ).toBeVisible();
  await profilePage.close();
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
  await expect(page.getByText('Saved in this browser')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Your shortlist' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Metasploit', exact: true }),
  ).toBeVisible();
  const allOrganizations = page.getByRole('link', {
    name: 'All organizations',
  });
  await expect(allOrganizations).toHaveAttribute('href', '/');
  await expect(
    allOrganizations.locator('.all-organizations-icon rect'),
  ).toHaveCount(4);
  await expect(allOrganizations.locator('path')).toHaveCount(0);
});

test('directory reveals organizations in complete four-card rows', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(page.getByRole('article')).toHaveCount(48);
  await expect(page.getByText('Showing 48 of 519')).toBeVisible();
  await page.getByRole('button', { name: 'Load more organizations' }).click();
  await expect(page.getByRole('article')).toHaveCount(96);
  await expect(page.getByText('Showing 96 of 519')).toBeVisible();
});

test('wide directory uses four columns and exposes saved organizations', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1700, height: 900 });
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const grid = page.locator('.organization-grid');
  const masthead = page.locator('.directory-masthead .directory-header');
  const filters = page.locator('.desktop-filters');
  const mastheadBox = await masthead.boundingBox();
  const filtersBox = await filters.boundingBox();
  expect(mastheadBox).not.toBeNull();
  expect(filtersBox).not.toBeNull();
  expect(Math.abs(mastheadBox!.x - filtersBox!.x)).toBeLessThan(2);
  const columnCount = await grid.evaluate(
    (element) =>
      getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean)
        .length,
  );
  expect(columnCount).toBe(4);
  const firstCardBox = await grid.locator('.org-card').first().boundingBox();
  expect(firstCardBox).not.toBeNull();
  expect(firstCardBox!.height).toBeLessThan(430);
  await expect(grid.locator('.org-card-actions')).toHaveCount(0);
  await expect(grid.getByRole('link', { name: 'View profile' })).toHaveCount(0);
  await expect(
    page.getByRole('link', { name: 'Saved organizations' }),
  ).toHaveAttribute('href', '/shortlist/');
});

test('organization cards display every technology label', async ({ page }) => {
  await page.goto('/?q=Fedora%20Project');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const card = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Fedora Project', exact: true }),
  });
  const technologies = card.locator('[aria-label="Technologies"] .tag');
  await expect(technologies).toHaveCount(14);
  await expect(technologies.getByText('Web', { exact: true })).toBeVisible();
  await expect(technologies.filter({ hasText: /^\+\d+$/ })).toHaveCount(0);
});

test('sort menu stays anchored below its trigger', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const trigger = page.getByRole('button', {
    name: /Sort organizations: Most recently participating/,
  });
  await trigger.click();
  const menu = page.getByRole('menu', { name: 'Sort organizations' });
  await expect(menu).toBeVisible();

  const triggerBox = await trigger.boundingBox();
  const menuBox = await menu.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(menuBox).not.toBeNull();
  expect(menuBox!.y).toBeGreaterThanOrEqual(triggerBox!.y + triggerBox!.height);

  await menu
    .getByRole('menuitemradio', { name: 'Most completed projects' })
    .click();
  await expect(page).toHaveURL(/sort=projects/);
  await expect(menu).toBeHidden();
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

  const yearBoxes = await participationYears
    .locator('span')
    .evaluateAll((years) =>
      years.map((year) => {
        const box = year.getBoundingClientRect();
        return { x: box.x, y: box.y };
      }),
    );
  expect(
    new Set(yearBoxes.slice(0, 6).map(({ y }) => Math.round(y))).size,
  ).toBe(1);
  expect(new Set(yearBoxes.slice(6).map(({ y }) => Math.round(y))).size).toBe(
    1,
  );
  yearBoxes.slice(0, 5).forEach(({ x }, index) => {
    expect(Math.abs(x - yearBoxes[index + 6].x)).toBeLessThan(1);
  });
});

test('organization profiles preserve contributor and archive details', async ({
  page,
}) => {
  await page.goto('/org/3dtk/');

  await expect(
    page.getByRole('link', { name: 'GSoC Organizations home' }),
  ).toBeVisible();
  const profileSearch = page.getByRole('searchbox', {
    name: 'Search organizations',
  });
  await expect(profileSearch).toBeVisible();

  const hero = page.locator('.organization-hero');
  await expect(hero.getByText('Technologies', { exact: true })).toBeVisible();
  await expect(hero.getByText('Topics', { exact: true })).toBeVisible();
  await expect(
    hero.getByRole('link', { name: 'Official website' }),
  ).toBeVisible();
  await expect(
    hero.getByRole('link', { name: 'Find repository' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Source repositories' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Start contributing' }),
  ).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Private research notes' }),
  ).toHaveCount(0);
  await expect(page.getByText('Public archive', { exact: true })).toHaveCount(
    0,
  );
  const chartLabelsFit = await page
    .locator('.participation-chart')
    .evaluate((chart) => {
      const height = chart.viewBox.baseVal.height;
      return [...chart.querySelectorAll('.chart-value')].every((label) => {
        const bounds = (label as SVGGraphicsElement).getBBox();
        return bounds.y >= 0 && bounds.y + bounds.height <= height;
      });
    });
  expect(chartLabelsFit).toBe(true);
  await expect(page.getByText('Contributor: Xia Sun')).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Official GSoC page' }),
  ).toHaveAttribute(
    'href',
    'https://summerofcode.withgoogle.com/archive/2018/organizations/5685665089978368/',
  );

  await profileSearch.fill('NumFOCUS');
  await profileSearch.press('Enter');
  await expect(page).toHaveURL('/?q=NumFOCUS');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await expect(
    page.getByRole('heading', { name: 'NumFOCUS', exact: true }),
  ).toBeVisible();
});

test('project years switch a grid of project cards', async ({ page }) => {
  await page.goto('/org/python-software-foundation/');

  const repositoryButton = page
    .locator('.organization-hero')
    .getByRole('link', { name: 'Repository', exact: true });
  await expect(repositoryButton).toBeVisible();
  await expect(repositoryButton.getByText('Inferred')).toHaveCount(0);
  await expect(repositoryButton.getByText('Verified')).toHaveCount(0);

  await expect(
    page.getByRole('heading', {
      level: 2,
      name: 'Completed projects across years',
    }),
  ).toBeVisible();

  const yearTabs = page.getByRole('tablist', { name: 'Participation years' });
  await expect(yearTabs.getByRole('tab')).toHaveCount(11);
  await expect(yearTabs.getByRole('tab', { name: '2026' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  const projects2026 = page.locator('[data-project-year-panel="2026"]');
  await expect(projects2026).toBeVisible();
  await expect(
    projects2026
      .locator('.project-card')
      .first()
      .getByRole('link', { name: 'Code submission' }),
  ).toHaveAttribute('href', /^https:\/\//);

  await yearTabs.getByRole('tab', { name: '2025' }).click();
  await expect(yearTabs.getByRole('tab', { name: '2025' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.locator('[data-project-year-panel="2026"]')).toBeHidden();
  const projects2025 = page.locator('[data-project-year-panel="2025"]');
  await expect(projects2025).toBeVisible();
  await expect(projects2025.locator('.project-card').first()).toBeVisible();
  await expect(
    projects2025.getByText('Inferred:', { exact: true }),
  ).toHaveCount(0);
  await expect(
    projects2025.locator('[aria-label="Project technologies"]'),
  ).toHaveCount(0);
  const firstProject = projects2025.locator('.project-card').first();
  await expect(
    firstProject.getByRole('link', { name: 'GSoC project page' }),
  ).toHaveAttribute('href', /^https:\/\/summerofcode\.withgoogle\.com\//);
  await expect(
    firstProject.getByRole('link', { name: 'Code submission' }),
  ).toHaveAttribute('href', /^https:\/\//);
  await expect(
    firstProject.getByRole('link', { name: 'GSoC project page' }),
  ).toHaveCSS('text-decoration-line', 'none');
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
  await expect(filters.getByText('Advanced exclusions')).toHaveCount(0);
  await filters
    .getByRole('searchbox', { name: 'Search technologies' })
    .fill('python');
  await filters.getByRole('checkbox', { name: 'Python', exact: true }).check();
  await expect(page).toHaveURL(/technology=python/i);
  await expect(page.getByText('1 active')).toHaveCount(0);
  await expect(
    filters.getByRole('button', { name: 'Clear all' }),
  ).toBeVisible();

  await filters.getByRole('button', { name: 'Clear all' }).click();
  await filters.getByRole('checkbox', { name: /New to GSoC in 2026/ }).check();
  await expect(page).toHaveURL(/firstTime=1/);
});

test('selecting a filter does not move the option list', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes('mobile'),
    'Desktop sidebar behavior is covered here.',
  );
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const topics = page
    .locator('.filter-group')
    .filter({ has: page.getByRole('heading', { name: /^Topics/ }) });
  await topics.getByRole('button', { name: /^View all/ }).click();
  const optionList = topics.locator('.filter-options');
  const wayland = topics.getByRole('checkbox', {
    name: 'Wayland',
    exact: true,
  });
  await wayland.scrollIntoViewIfNeeded();
  const scrollTopBefore = await optionList.evaluate(
    (element) => element.scrollTop,
  );

  await wayland.check();

  const scrollTopAfter = await optionList.evaluate(
    (element) => element.scrollTop,
  );
  expect(Math.abs(scrollTopAfter - scrollTopBefore)).toBeLessThan(4);
});

test('filtering a full desktop grid keeps the page height stable', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes('mobile'),
    'The four-column desktop grid is covered here.',
  );
  await page.setViewportSize({ width: 2048, height: 1140 });
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const filters = page.getByRole('complementary', {
    name: 'Organization filters',
  });
  const webTopic = filters.getByRole('checkbox', {
    name: 'web',
    exact: true,
  });
  await webTopic.scrollIntoViewIfNeeded();
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  const heightBefore = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const scrollBefore = await page.evaluate(() => window.scrollY);

  await webTopic.check();

  const heightAfter = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  const scrollAfter = await page.evaluate(() => window.scrollY);
  expect(Math.abs(heightAfter - heightBefore)).toBeLessThan(4);
  expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(4);
});

test('a small filtered result set keeps the filter panel anchored', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes('mobile'),
    'The desktop sidebar interaction is covered here.',
  );
  await page.setViewportSize({ width: 2048, height: 1140 });
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page.evaluate(() => window.scrollTo(0, 500));

  const filters = page.getByRole('complementary', {
    name: 'Organization filters',
  });
  const developmentTools = filters.getByRole('checkbox', {
    name: 'Development tools',
    exact: true,
  });
  await developmentTools.scrollIntoViewIfNeeded();
  const sidebarTopBefore = await page
    .locator('.desktop-filters .filters-panel')
    .evaluate((element) => element.getBoundingClientRect().top);
  await developmentTools.check();

  await expect(
    page.getByText('6 organizations', { exact: true }),
  ).toBeVisible();
  const resultsBox = await page.locator('.results-column').boundingBox();
  expect(resultsBox).not.toBeNull();
  expect(resultsBox!.y).toBeGreaterThanOrEqual(0);
  expect(resultsBox!.y).toBeLessThan(40);
  const sidebarTopAfter = await page
    .locator('.desktop-filters .filters-panel')
    .evaluate((element) => element.getBoundingClientRect().top);
  expect(Math.abs(sidebarTopAfter - sidebarTopBefore)).toBeLessThan(1);
});

test('filter scrollbars do not overlap option counts', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name.includes('mobile'),
    'The mobile drawer uses the full viewport width.',
  );
  await page.setViewportSize({ width: 1440, height: 640 });
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const yearOptions = page
    .getByRole('complementary', { name: 'Organization filters' })
    .locator('.compact-options');
  const yearCount = yearOptions
    .getByRole('checkbox', { name: 'Participation year 2023' })
    .locator('xpath=..')
    .locator('small');
  const rightClearance = await yearOptions.evaluate(
    (container, count) => {
      const containerBox = container.getBoundingClientRect();
      const countBox = (count as HTMLElement).getBoundingClientRect();
      return containerBox.right - countBox.right;
    },
    await yearCount.elementHandle(),
  );

  expect(rightClearance).toBeGreaterThanOrEqual(12);
});

test('directory footer follows the load-more row without a blank gap', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );
  await page.getByRole('button', { name: 'Load more organizations' }).click();
  await expect(page.getByText('Showing 96 of 519')).toBeVisible();

  const verticalGap = await page.evaluate(() => {
    const loadMore = document.querySelector('.load-more-row');
    const footer = document.querySelector('.site-footer');
    if (!loadMore || !footer)
      throw new Error('Required layout elements missing');
    return (
      footer.getBoundingClientRect().top -
      loadMore.getBoundingClientRect().bottom
    );
  });

  expect(verticalGap).toBeLessThanOrEqual(1);
});

test('footer provides project, privacy, and creator links', async ({
  page,
}, testInfo) => {
  let releaseGitHubApi!: () => void;
  const githubApiGate = new Promise<void>((resolve) => {
    releaseGitHubApi = resolve;
  });
  await page.route(
    'https://api.github.com/repos/rohanmalhotracodes/GSoC-Organizations',
    async (route) => {
      await githubApiGate;
      await route.fulfill({ json: { stargazers_count: 1234 } });
    },
  );
  await page.addInitScript(() => {
    localStorage.setItem(
      'gsoc-organizations-github-stars',
      JSON.stringify({ count: 6, updatedAt: Date.now() }),
    );
  });
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  const header = page.locator('.directory-header');
  const headerStarLink = header.getByRole('link', {
    name: 'Star us on GitHub',
  });
  const headerStarCount = header.getByTestId('github-star-count');
  await expect(headerStarCount).toHaveText('6');
  await expect(headerStarLink).toHaveAttribute(
    'href',
    'https://github.com/rohanmalhotracodes/GSoC-Organizations',
  );
  await expect(headerStarLink).toBeVisible();
  await expect(headerStarLink).toContainText('Star us on GitHub');
  await expect(headerStarLink).toHaveCSS('background-color', 'rgb(24, 24, 27)');
  const headerStarBox = await headerStarLink.boundingBox();
  const headerSearchBox = await header.locator('.global-search').boundingBox();
  expect(headerStarBox).not.toBeNull();
  expect(headerSearchBox).not.toBeNull();
  expect(headerStarBox!.height).toBeLessThanOrEqual(36);
  if (testInfo.project.name.includes('mobile')) {
    expect(headerStarBox!.width).toBeLessThan(headerSearchBox!.width);
  } else {
    expect(headerStarBox!.x).toBeGreaterThan(
      headerSearchBox!.x + headerSearchBox!.width,
    );
    expect(
      Math.abs(
        headerStarBox!.y +
          headerStarBox!.height / 2 -
          (headerSearchBox!.y + headerSearchBox!.height / 2),
      ),
    ).toBeLessThan(2);
  }
  releaseGitHubApi();
  const footerBrand = footer.getByRole('link', {
    name: 'GSoC Organizations footer home',
  });
  if (!testInfo.project.name.includes('mobile')) {
    const brandColor = await footerBrand.evaluate(
      (element) => getComputedStyle(element).color,
    );
    await footerBrand.hover();
    await expect(footerBrand).toHaveCSS('color', brandColor);
    await expect(footerBrand).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(footerBrand).toHaveCSS('filter', 'none');
    await expect(footerBrand).toHaveCSS('text-shadow', 'none');
  }
  await expect(
    footer.getByText('Rohan Malhotra', { exact: true }),
  ).toBeVisible();
  await expect(footer).toContainText(
    'A comprehensive directory of Google Summer of Code organizations across every archived program year',
  );
  await expect(footer).not.toContainText('past and present');
  await expect(footer).not.toContainText('Built for the open-source community');
  await expect(footer.getByRole('link', { name: 'Directory' })).toHaveCount(0);
  await expect(footer.getByRole('link', { name: 'Shortlist' })).toHaveCount(0);
  await expect(footer).not.toContainText('↗');
  await expect(
    footer.getByRole('link', { name: 'GitHub repository' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/rohanmalhotracodes/GSoC-Organizations',
  );
  await expect(
    footer.getByRole('link', { name: 'LinkedIn profile' }),
  ).toHaveAttribute('href', 'https://www.linkedin.com/in/rohanmalhotracodes/');
  await expect(footer.getByRole('link', { name: 'X profile' })).toHaveAttribute(
    'href',
    'https://x.com/rohangotnochill',
  );
  await expect(
    footer.getByRole('link', { name: 'GitHub profile' }),
  ).toHaveAttribute('href', 'https://github.com/rohanmalhotracodes');
  await expect(footer.locator('.footer-social-links')).toHaveCSS(
    'flex-direction',
    'row',
  );
  await expect(footer.locator('.social-icon-link')).toHaveCount(3);
  await expect(
    footer.getByRole('link', { name: 'Star us on GitHub' }),
  ).toHaveCount(0);
  await expect(headerStarCount).toHaveText('1,234');
  await expect(headerStarCount).toHaveCSS('border-left-width', '1px');
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
  const closeFilters = page.getByRole('button', { name: 'Close filters' });
  await expect(closeFilters.locator('svg')).toBeVisible();
  await expect(closeFilters.locator('path')).toHaveAttribute(
    'd',
    'M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5',
  );
  await expect(closeFilters).not.toContainText('×');
  const categoryGroup = page
    .locator('.filter-drawer .filter-group')
    .filter({ has: page.getByRole('heading', { name: /^Categories/ }) });
  const viewAllCategories = categoryGroup.locator('.show-options-button');
  await expect(viewAllCategories).toHaveText(/^View all/);
  await viewAllCategories.click();
  await expect(viewAllCategories).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await page.getByRole('checkbox', { name: 'Participation year 2026' }).check();
  await page.getByRole('button', { name: 'Close filters' }).click();
  await expect(page.getByRole('button', { name: 'Filters (1)' })).toBeVisible();
  await expect(page.getByText('1 active')).toHaveCount(0);
  await page.getByRole('button', { name: 'Filters (1)' }).click();
  await page.getByRole('button', { name: 'Clear all' }).click();
  await page.getByRole('button', { name: 'Close filters' }).click();
  await expect(page.getByRole('button', { name: 'Filters' })).toBeVisible();
});

test('card metrics are centered in equal columns on mobile', async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== 'mobile',
    'Mobile-only card alignment test',
  );

  await page.goto('/');
  await expect(page.getByTestId('explorer')).toHaveAttribute(
    'data-ready',
    'true',
  );

  const metrics = page.locator('.org-card .card-metrics').first();
  await expect(metrics).toHaveCSS('display', 'grid');
  const columns = await metrics.evaluate(
    (element) => getComputedStyle(element).gridTemplateColumns,
  );
  const [firstColumn, secondColumn] = columns
    .split(' ')
    .map((column) => Number.parseFloat(column));
  expect(Math.abs(firstColumn - secondColumn)).toBeLessThan(1);
  await expect(metrics.locator('div').first()).toHaveCSS(
    'justify-content',
    'center',
  );
  await expect(metrics.locator('div').nth(1)).toHaveCSS(
    'justify-content',
    'center',
  );
});
