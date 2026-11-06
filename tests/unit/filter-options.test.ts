import { describe, expect, it } from 'vitest';
import { filterAndSortOptions } from '../../src/lib/filter-options';

const options = [
  { value: 'machine learning', count: 56 },
  { value: 'compilers', count: 25 },
  { value: 'programming languages', count: 22 },
  { value: 'computer vision', count: 18 },
  { value: 'mobile', count: 18 },
  { value: 'bioinformatics', count: 17 },
];

describe('filter option search', () => {
  it('ranks prefix matches before more frequent substring matches', () => {
    expect(
      filterAndSortOptions(options, 'm', 'frequency').map(
        (option) => option.value,
      ),
    ).toEqual([
      'machine learning',
      'mobile',
      'compilers',
      'programming languages',
      'computer vision',
      'bioinformatics',
    ]);
  });

  it('keeps its frequency order when there is no query', () => {
    expect(
      filterAndSortOptions(options, '', 'frequency').map(
        (option) => option.value,
      ),
    ).toEqual(options.map((option) => option.value));
  });

  it('ranks whole-word prefixes before general substrings', () => {
    expect(
      filterAndSortOptions(options, 'lang', 'frequency').map(
        (option) => option.value,
      ),
    ).toEqual(['programming languages']);
  });
});
