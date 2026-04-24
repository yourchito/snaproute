import { describe, it, expect } from 'vitest';
import {
  generateDocs,
  extractParams,
  formatDocsAsMarkdown,
  RouteDoc,
} from './generateDocs';
import { RouteConfig } from '../config/snaproute.config';

const mockRoutes: RouteConfig[] = [
  {
    path: '/api/users',
    methods: ['GET', 'POST'],
    description: 'List and create users',
  },
  {
    path: '/api/users/[id]',
    methods: ['GET', 'PUT', 'DELETE'],
    description: 'Manage a single user by ID',
  },
  {
    path: '/api/posts/[postId]/comments/[commentId]',
  },
];

describe('extractParams', () => {
  it('returns empty object for paths with no params', () => {
    expect(extractParams('/api/users')).toEqual({});
  });

  it('extracts a single param', () => {
    expect(extractParams('/api/users/[id]')).toEqual({ id: 'string' });
  });

  it('extracts multiple params', () => {
    expect(
      extractParams('/api/posts/[postId]/comments/[commentId]')
    ).toEqual({ postId: 'string', commentId: 'string' });
  });
});

describe('generateDocs', () => {
  it('returns one doc per route', () => {
    const docs = generateDocs(mockRoutes);
    expect(docs).toHaveLength(3);
  });

  it('uses default method GET when none provided', () => {
    const docs = generateDocs([{ path: '/api/health' }]);
    expect(docs[0].methods).toEqual(['GET']);
  });

  it('includes generatedAt timestamp', () => {
    const docs = generateDocs(mockRoutes);
    expect(docs[0].generatedAt).toBeTruthy();
  });

  it('populates params from dynamic segments', () => {
    const docs = generateDocs(mockRoutes);
    expect(docs[1].params).toEqual({ id: 'string' });
  });
});

describe('formatDocsAsMarkdown', () => {
  it('includes the main heading', () => {
    const docs = generateDocs(mockRoutes);
    const md = formatDocsAsMarkdown(docs);
    expect(md).toContain('# API Routes Documentation');
  });

  it('includes each route path as a heading', () => {
    const docs = generateDocs(mockRoutes);
    const md = formatDocsAsMarkdown(docs);
    expect(md).toContain('## `/api/users`');
    expect(md).toContain('## `/api/users/[id]`');
  });

  it('lists path parameters when present', () => {
    const docs = generateDocs(mockRoutes);
    const md = formatDocsAsMarkdown(docs);
    expect(md).toContain('`id`');
  });
});
