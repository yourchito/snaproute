import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  printNamespaceResult,
  printRoutesInNamespace,
  printAllNamespaces,
  printNamespaceSummary,
} from './printNamespace';
import type { NamespaceMap } from './namespaceRoute';

describe('printNamespaceResult', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('prints action with route and namespace', () => {
    printNamespaceResult('added to', 'auth', 'users/login');
    expect(console.log).toHaveBeenCalledOnce();
    const output = (console.log as any).mock.calls[0][0];
    expect(output).toContain('auth');
    expect(output).toContain('users/login');
  });

  it('prints action without route', () => {
    printNamespaceResult('created', 'payments');
    const output = (console.log as any).mock.calls[0][0];
    expect(output).toContain('payments');
  });
});

describe('printRoutesInNamespace', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('prints routes in namespace', () => {
    printRoutesInNamespace('auth', ['users/login', 'users/logout']);
    const calls = (console.log as any).mock.calls.map((c: any) => c[0]);
    const joined = calls.join('\n');
    expect(joined).toContain('auth');
    expect(joined).toContain('users/login');
    expect(joined).toContain('users/logout');
  });

  it('prints empty message when no routes', () => {
    printRoutesInNamespace('empty-ns', []);
    const calls = (console.log as any).mock.calls.map((c: any) => c[0]).join('\n');
    expect(calls).toContain('no routes');
  });
});

describe('printAllNamespaces', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('prints all namespaces with routes', () => {
    const map: NamespaceMap = { auth: ['login', 'logout'], public: ['home'] };
    printAllNamespaces(map);
    const output = (console.log as any).mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('auth');
    expect(output).toContain('public');
    expect(output).toContain('login');
  });

  it('prints none when map is empty', () => {
    printAllNamespaces({});
    const output = (console.log as any).mock.calls.map((c: any) => c[0]).join('\n');
    expect(output).toContain('none defined');
  });
});

describe('printNamespaceSummary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('prints singular form for 1', () => {
    printNamespaceSummary(1, 'found');
    const output = (console.log as any).mock.calls[0][0];
    expect(output).toContain('1 namespace found');
  });

  it('prints plural form for many', () => {
    printNamespaceSummary(3, 'found');
    const output = (console.log as any).mock.calls[0][0];
    expect(output).toContain('3 namespaces found');
  });
});
