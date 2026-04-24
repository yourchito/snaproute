import fs from 'fs';
import path from 'path';
import os from 'os';
import { loadConfig } from './loadConfig';
import { DEFAULT_CONFIG } from './snaproute.config';

describe('loadConfig', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'snaproute-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns DEFAULT_CONFIG when no config file is found', async () => {
    const config = await loadConfig(tmpDir);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('merges a JSON config file with defaults', async () => {
    const userConfig = { apiDir: 'app/api', generateDocs: false };
    fs.writeFileSync(
      path.join(tmpDir, 'snaproute.config.json'),
      JSON.stringify(userConfig)
    );

    const config = await loadConfig(tmpDir);

    expect(config.apiDir).toBe('app/api');
    expect(config.generateDocs).toBe(false);
    // Defaults preserved for unspecified keys
    expect(config.routerType).toBe(DEFAULT_CONFIG.routerType);
    expect(config.defaultMethods).toEqual(DEFAULT_CONFIG.defaultMethods);
  });

  it('returns DEFAULT_CONFIG for malformed JSON', async () => {
    fs.writeFileSync(path.join(tmpDir, 'snaproute.config.json'), '{ invalid json }');
    const config = await loadConfig(tmpDir);
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it('discovers config file in a parent directory', async () => {
    const userConfig = { docsDir: 'output/docs' };
    fs.writeFileSync(
      path.join(tmpDir, 'snaproute.config.json'),
      JSON.stringify(userConfig)
    );

    const nested = path.join(tmpDir, 'src', 'routes');
    fs.mkdirSync(nested, { recursive: true });

    const config = await loadConfig(nested);
    expect(config.docsDir).toBe('output/docs');
  });
});
