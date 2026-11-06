import { describe, expect, it } from 'vitest';
import {
  normalizeTechnologies,
  normalizeTopics,
} from '../../scripts/tag-normalization.mjs';

describe('archive tag normalization', () => {
  it('merges C++ versions and splits combined technology labels', () => {
    expect(
      normalizeTechnologies([
        'C++14',
        'C++17',
        'asm/c/c++',
        'C\\C++',
        'c++ libraries c++11 c++14 c++17 c++20',
        'C++ template metaprogramming',
      ]),
    ).toEqual(['Assembly', 'C', 'C++']);
  });

  it('merges topic spelling, punctuation, and plural variants', () => {
    expect(
      normalizeTopics([
        'AI,',
        'artificial-intelligence',
        'machine-learning',
        'compilers',
        'bioinformtics',
      ]),
    ).toEqual([
      'artificial intelligence',
      'bioinformatics',
      'compiler',
      'machine learning',
    ]);
  });
});
