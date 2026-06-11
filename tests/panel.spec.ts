import { test, expect } from '@grafana/plugin-e2e';

test('should display "No data" in case panel data is empty', async ({
  gotoPanelEditPage,
  readProvisionedDashboard,
}) => {
  const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
  const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' });
  await expect(panelEditPage.panel.locator).toContainText('No data');
});

test('should render the multi-header table when data is passed to the panel', async ({
  panelEditPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Multi Row Table Header');
  await expect(page.getByTestId('multi-header-table')).toBeVisible();
});

test('should prepend a "#" column when "Show row numbers" is enabled', async ({
  panelEditPage,
  readProvisionedDataSource,
  page,
}) => {
  const ds = await readProvisionedDataSource({ fileName: 'datasources.yml' });
  await panelEditPage.datasource.set(ds.name);
  await panelEditPage.setVisualization('Multi Row Table Header');
  const options = panelEditPage.getCustomOptions('Show row numbers');
  await options.getSwitch().check();
  await expect(page.getByTestId('multi-header-table').locator('th', { hasText: '#' })).toBeVisible();
});
