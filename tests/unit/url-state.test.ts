import { describe, expect, it } from 'vitest';
import {
  parseFilterState,
  serializeFilterState,
} from '../../src/lib/url-state';

describe('URL state', () => {
  it('round-trips shareable filters', () => {
    const state = parseFilterState(
      '?q=rust&firstTime=1&year=2026&technology=Rust&excludeTopic=AI&sort=projects',
    );
    expect(state.query).toBe('rust');
    expect(state.firstTime).toBe(true);
    expect(state.years).toEqual([2026]);
    expect(state.excludeTopics).toEqual(['AI']);
    expect(parseFilterState(serializeFilterState(state))).toEqual(state);
  });

  it('recovers from malformed and outdated values', () => {
    const state = parseFilterState(
      '?filters=%7Bnot-json%7D&year=hello&year=1890&sort=unknown',
    );
    expect(state.years).toEqual([]);
    expect(state.sort).toBe('recent');
  });
});
