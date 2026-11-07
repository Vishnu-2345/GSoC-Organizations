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
  expect((sitemapText.match(/<loc>/g) ?? []).length).toBe(521);

  const aiSummary = await request.get('/llms.txt');
  expect(aiSummary.ok()).toBe(true);
  expect(await aiSummary.text()).toContain('# GSoC Organizations');
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

test('provides loading feedback for slow page transitions', async ({
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
    const message = document.querySelector('[data-loading-message]');
    if (message) message.textContent = 'Opening Saved organizations…';
    document.documentElement.classList.add('page-navigating');
  });

  await expect(loadingScreen).toBeVisible();
  await expect(loadingScreen).toContainText('Opening Saved organizations…');
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
  const cardBoxBeforeHover = await metasploitCard.boundingBox();
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
  const cardBoxAfterHover = await metasploitCard.boundingBox();
  expect(cardBoxAfterHover?.x).toBeCloseTo(cardBoxBeforeHover?.x ?? 0, 1);
  expect(cardBoxAfterHover?.y).toBeCloseTo(cardBoxBeforeHover?.y ?? 0, 1);
  expect(
    await metasploitCard.evaluate((card) => getComputedStyle(card).boxShadow),
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
  const allOrganizationsLink = page.getByRole('link', {
    name: 'All organizations',
  });
  await expect(
    allOrganizationsLink.locator('svg.all-organizations-icon path'),
  ).toHaveCount(1);
  await expect(
    allOrganizationsLink.locator('svg.all-organizations-icon path'),
  ).toHaveCSS('fill', 'rgb(168, 70, 0)');
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
  await expect(hero.getByText('Find repository', { exact: true })).toHaveCount(
    0,
  );
  await expect(hero.getByRole('link', { name: /repositor/i })).toHaveCount(0);
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

test('repository actions use direct source destinations only', async ({
  page,
}) => {
  await page.goto('/org/python-software-foundation/');

  const repository = page
    .locator('.organization-hero')
    .getByRole('link', { name: /Repository/ });
  await expect(repository).toHaveAttribute(
    'href',
    'https://github.com/python/cpython',
  );

  await page.goto('/org/3dtk/');
  const unresolvedHero = page.locator('.organization-hero');
  await expect(
    unresolvedHero.getByRole('link', { name: /repositor/i }),
  ).toHaveCount(0);
});

test('project years switch a grid of project cards', async ({ page }) => {
  await page.goto('/org/python-software-foundation/');

  const yearTabs = page.getByRole('tablist', { name: 'Participation years' });
  await expect(yearTabs.getByRole('tab')).toHaveCount(11);
  await expect(yearTabs.getByRole('tab', { name: '2026' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.locator('[data-project-year-panel="2026"]')).toBeVisible();

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
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  const starCount = footer.getByTestId('github-star-count');
  await expect(starCount).toHaveText('1');
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
    footer.getByRole('link', { name: 'Star GSoC Organizations on GitHub' }),
  ).toHaveAttribute(
    'href',
    'https://github.com/rohanmalhotracodes/GSoC-Organizations',
  );
  const starLink = footer.getByRole('link', {
    name: 'Star GSoC Organizations on GitHub',
  });
  await expect(starLink).toHaveCSS('border-radius', '7px');
  await expect(starLink).toHaveCSS('background-color', 'rgb(36, 36, 40)');
  await expect(starLink).toHaveCSS('box-shadow', 'none');
  await expect(starCount).toHaveText('1,234');
  await expect(starCount).toHaveCSS('border-left-width', '1px');
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
  await expect(page.locator('html')).toHaveClass(/page-ready/);
  await expect(page.locator('.site-loading')).toBeHidden();
  await expect(page.locator('.card-metrics').first()).toHaveCSS(
    'display',
    'grid',
  );
  await expect(page.locator('.card-metrics > div').first()).toHaveCSS(
    'justify-content',
    'center',
  );
  await expect(page.locator('.card-metrics > div').first()).toHaveCSS(
    'align-items',
    'center',
  );
  await expect(page.locator('.card-metrics > div').first()).toHaveCSS(
    'flex-direction',
    'column',
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
