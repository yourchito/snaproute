import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  resolveNamespaceFilePath,
  loadNamespaces,
  saveNamespaces,
  addRouteToNamespace,
  removeRouteFromNamespace,
  listNamespaces,
  getRoutesInNamespace,
} from './namespaceRoute';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'snaproute-ns-'));
}

describe('resolveNamespaceFilePath', () => {
  it('returns correct path', () => {
    const result = resolveNamespaceFilePath('/base');
    expect(result).toBe('/base/.snaproute/namespaces.json');
  });
});

describe('loadNamespaces', () => {
  it('returns empty object when file does not exist', () => {
    const dir = makeTempDir();
    expect(loadNamespaces(dir)).toEqual({});
  });

  it('returns parsed namespaces from file', () => {
    const dir = makeTempDir();
    const data = { auth: ['login', 'logout'] };
    saveNamespaces(dir, data);
    expect(loadNamespaces(dir)).toEqual(data);
  });

  it('returns empty object on corrupt file', () => {
    const dir = makeTempDir();
    const filePath = resolveNamespaceFilePath(dir);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, 'not-json', 'utf-8');
    expect(loadNamespaces(dir)).toEqual({});
  });
});

describe('addRouteToNamespace', () => {
  it('adds a route to a new namespace', () => {
    const dir = makeTempDir();
    const result = addRouteToNamespace(dir, 'auth', 'users/login');
    expect(result.success).toBe(true);
    expect(getRoutesInNamespace(dir, 'auth')).toContain('users/login');
  });

  it('returns failure if route already exists', () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, 'auth', 'users/login');
    const result = addRouteToNamespace(dir, 'auth', 'users/login');
    expect(result.success).toBe(false);
    expect(result.message).toContain('already exists');
  });
});

describe('removeRouteFromNamespace', () => {
  it('removes an existing route', () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, 'auth', 'users/login');
    const result = removeRouteFromNamespace(dir, 'auth', 'users/login');
    expect(result.success).toBe(true);
    expect(getRoutesInNamespace(dir, 'auth')).not.toContain('users/login');
  });

  it('returns failure if namespace does not exist', () => {
    const dir = makeTempDir();
    const result = removeRouteFromNamespace(dir, 'ghost', 'any/route');
    expect(result.success).toBe(false);
    expect(result.message).toContain('does not exist');
  });

  it('returns failure if route not in namespace', () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, 'auth', 'users/login');
    const result = removeRouteFromNamespace(dir, 'auth', 'users/register');
    expect(result.success).toBe(false);
    expect(result.message).toContain('not found');
  });
});

describe('listNamespaces', () => {
  it('returns all namespaces', () => {
    const dir = makeTempDir();
    addRouteToNamespace(dir, 'auth', 'login');
    addRouteToNamespace(dir, 'public', 'home');
    const result = listNamespaces(dir);
    expect(Object.keys(result)).toContain('auth');
    expect(Object.keys(result)).toContain('public');
  });
});
