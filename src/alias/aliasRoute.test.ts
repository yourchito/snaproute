import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  resolveAliasFilePath,
  loadAliases,
  saveAliases,
  addAlias,
  resolveAlias,
  removeAlias,
} from './aliasRoute';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snaproute-alias-test-'));
}

describe('resolveAliasFilePath', () => {
  it('returns a path ending in .snaproute-aliases.json', () => {
    const result = resolveAliasFilePath('/some/dir');
    expect(result).toMatch(/\.snaproute-aliases\.json$/);
  });

  it('resolves relative to the given base directory', () => {
    const result = resolveAliasFilePath('/projects/myapp');
    expect(result).toBe('/projects/myapp/.snaproute-aliases.json');
  });
});

describe('loadAliases', () => {
  it('returns an empty object if file does not exist', () => {
    const tmpDir = makeTempDir();
    const result = loadAliases(tmpDir);
    expect(result).toEqual({});
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns parsed aliases from existing file', () => {
    const tmpDir = makeTempDir();
    const filePath = resolveAliasFilePath(tmpDir);
    fs.writeFileSync(filePath, JSON.stringify({ api: 'src/pages/api', auth: 'src/pages/api/auth' }));
    const result = loadAliases(tmpDir);
    expect(result).toEqual({ api: 'src/pages/api', auth: 'src/pages/api/auth' });
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns empty object if file contains invalid JSON', () => {
    const tmpDir = makeTempDir();
    const filePath = resolveAliasFilePath(tmpDir);
    fs.writeFileSync(filePath, 'not-valid-json');
    const result = loadAliases(tmpDir);
    expect(result).toEqual({});
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('saveAliases', () => {
  it('writes aliases to the alias file', () => {
    const tmpDir = makeTempDir();
    saveAliases(tmpDir, { api: 'src/pages/api' });
    const filePath = resolveAliasFilePath(tmpDir);
    const raw = fs.readFileSync(filePath, 'utf-8');
    expect(JSON.parse(raw)).toEqual({ api: 'src/pages/api' });
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('addAlias', () => {
  it('adds a new alias and returns success', () => {
    const tmpDir = makeTempDir();
    const result = addAlias('api', 'src/pages/api', tmpDir);
    expect(result.success).toBe(true);
    expect(result.message).toContain('api');
    const aliases = loadAliases(tmpDir);
    expect(aliases['api']).toBe('src/pages/api');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns failure if alias name is empty', () => {
    const tmpDir = makeTempDir();
    const result = addAlias('', 'src/pages/api', tmpDir);
    expect(result.success).toBe(false);
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('overwrites an existing alias', () => {
    const tmpDir = makeTempDir();
    addAlias('api', 'src/pages/api', tmpDir);
    const result = addAlias('api', 'src/app/api', tmpDir);
    expect(result.success).toBe(true);
    const aliases = loadAliases(tmpDir);
    expect(aliases['api']).toBe('src/app/api');
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('resolveAlias', () => {
  it('returns the path for a known alias', () => {
    const tmpDir = makeTempDir();
    addAlias('auth', 'src/pages/api/auth', tmpDir);
    const result = resolveAlias('auth', tmpDir);
    expect(result).toBe('src/pages/api/auth');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns null for an unknown alias', () => {
    const tmpDir = makeTempDir();
    const result = resolveAlias('unknown', tmpDir);
    expect(result).toBeNull();
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('removeAlias', () => {
  it('removes an existing alias and returns success', () => {
    const tmpDir = makeTempDir();
    addAlias('api', 'src/pages/api', tmpDir);
    const result = removeAlias('api', tmpDir);
    expect(result.success).toBe(true);
    const aliases = loadAliases(tmpDir);
    expect(aliases['api']).toBeUndefined();
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns failure when alias does not exist', () => {
    const tmpDir = makeTempDir();
    const result = removeAlias('nonexistent', tmpDir);
    expect(result.success).toBe(false);
    expect(result.message).toContain('nonexistent');
    fs.rmSync(tmpDir, { recursive: true });
  });
});
