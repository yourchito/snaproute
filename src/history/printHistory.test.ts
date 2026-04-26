import { printHistory, printHistorySummary } from './printHistory';
import type { HistoryEntry } from './routeHistory';

const mockEntries: HistoryEntry[] = [
  {
    routeName: 'users',
    methods: ['GET', 'POST'],
    outputDir: 'src/app/api',
    timestamp: '2024-01-15T10:30:00.000Z',
    filePath: 'src/app/api/users/route.ts',
  },
  {
    routeName: 'posts/[id]',
    methods: ['GET', 'PUT', 'DELETE'],
    outputDir: 'src/app/api',
    timestamp: '2024-01-15T11:00:00.000Z',
    filePath: 'src/app/api/posts/[id]/route.ts',
  },
];

describe('printHistory', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prints a message when history is empty', () => {
    printHistory([]);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('No route history found')
    );
  });

  it('prints each history entry', () => {
    printHistory(mockEntries);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('users');
    expect(output).toContain('posts/[id]');
  });

  it('prints methods for each entry', () => {
    printHistory(mockEntries);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('GET');
    expect(output).toContain('POST');
  });
});

describe('printHistorySummary', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('prints summary with count', () => {
    printHistorySummary(mockEntries);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('2');
  });

  it('handles empty history in summary', () => {
    printHistorySummary([]);
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('0');
  });
});
