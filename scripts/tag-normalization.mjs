// The public archive contains spelling variants, version labels, plurals, and
// combined values. These reviewable rules follow the normalization approach
// used by nishantwrp/gsoc-organizations without depending on that checkout.

const technologyAliases = new Map([
  ['ai', 'AI'],
  ['artificial intelligence', 'AI'],
  ['artificial-intelligence', 'AI'],
  ['genai', 'AI'],
  ['generative ai', 'AI'],
  ['assembly', 'Assembly'],
  ['asm', 'Assembly'],
  ['bash', 'Shell'],
  ['shell script', 'Shell'],
  ['c', 'C'],
  ['c language', 'C'],
  ['c programming', 'C'],
  ['c+', 'C++'],
  ['c++', 'C++'],
  ['cpp', 'C++'],
  ['c#', 'C#'],
  ['c sharp', 'C#'],
  ['css', 'CSS'],
  ['css3', 'CSS'],
  ['dart', 'Dart'],
  ['databases', 'Database'],
  ['deeplearning', 'Deep learning'],
  ['deep learning', 'Deep learning'],
  ['golang', 'Go'],
  ['golan', 'Go'],
  ['go', 'Go'],
  ['html', 'HTML'],
  ['html5', 'HTML'],
  ['java', 'Java'],
  ['java script', 'JavaScript'],
  ['javascript', 'JavaScript'],
  ['javasc', 'JavaScript'],
  ['javascipt', 'JavaScript'],
  ['javascr', 'JavaScript'],
  ['js', 'JavaScript'],
  ['#js', 'JavaScript'],
  ['llms', 'LLM'],
  ['llm', 'LLM'],
  ['machinelearning', 'Machine learning'],
  ['machine learning (ml)', 'Machine learning'],
  ['mongodb', 'MongoDB'],
  ['mongo', 'MongoDB'],
  ['node', 'Node.js'],
  ['nodejs', 'Node.js'],
  ['node.js', 'Node.js'],
  ['postgres', 'PostgreSQL'],
  ['postgresql', 'PostgreSQL'],
  ['python', 'Python'],
  ['python 3', 'Python'],
  ['python3', 'Python'],
  ['phyton', 'Python'],
  ['pthon', 'Python'],
  ['pyth', 'Python'],
  ['r-project', 'R'],
  ['r', 'R'],
  ['react', 'React'],
  ['react.js', 'React'],
  ['reactjs', 'React'],
  ['reactnative', 'React Native'],
  ['react-native', 'React Native'],
  ['react native', 'React Native'],
  ['rest api', 'REST'],
  ['restful api', 'REST'],
  ['rest', 'REST'],
  ['riscv', 'RISC-V'],
  ['risc-v', 'RISC-V'],
  ['ruby', 'Ruby'],
  ['rust', 'Rust'],
  ['sql/nosql', 'Database'],
  ['typescript', 'TypeScript'],
  ['ts', 'TypeScript'],
  ['vue', 'Vue.js'],
  ['vuejs', 'Vue.js'],
  ['vue.js', 'Vue.js'],
  ['wasm', 'WebAssembly'],
  ['webassembly', 'WebAssembly'],
  ['web apps', 'Web'],
  ['web development', 'Web'],
  ['web services', 'Web'],
  ['webs', 'Web'],
  ['compilers', 'Compiler'],
  ['compiler', 'Compiler'],
  ['container', 'Containers'],
  ['embedded systems', 'Embedded'],
  ['high performance computing', 'High-performance computing'],
  ['internet of things', 'IoT'],
  ['natural language processing', 'NLP'],
  ['nlp', 'NLP'],
  ['osx', 'macOS'],
]);

const technologyExpansions = new Map([
  ['django+postgresql', ['Django', 'PostgreSQL']],
  ['mern', ['MongoDB', 'Express.js', 'React', 'Node.js']],
  ['python deep learning frameworks', ['Python', 'Deep learning']],
]);

const topicAliases = new Map([
  ['ai', 'artificial intelligence'],
  ['artificial-intelligence', 'artificial intelligence'],
  ['artificial inteligence', 'artificial intelligence'],
  ['agent', 'artificial intelligence'],
  ['agents', 'artificial intelligence'],
  ['agent based models', 'artificial intelligence'],
  ['agentic ai', 'artificial intelligence'],
  ['ai agent', 'artificial intelligence'],
  ['embodied ai', 'artificial intelligence'],
  ['genai', 'artificial intelligence'],
  ['generative ai', 'artificial intelligence'],
  ['ml', 'machine learning'],
  ['machine-learning', 'machine learning'],
  ['mlearning', 'machine learning'],
  ['neural network', 'machine learning'],
  ['neural networks', 'machine learning'],
  ['nlp', 'natural language processing'],
  ['web application', 'web'],
  ['web applications', 'web'],
  ['web apps', 'web'],
  ['web development', 'web'],
  ['web platform and services', 'web'],
  ['web programming', 'web'],
  ['web services', 'web'],
  ['web technologies', 'web'],
  ['webapps', 'web'],
  ['webdev', 'web'],
  ['front-end', 'web'],
  ['frontend', 'web'],
  ['backend', 'web'],
  ['full stack', 'web'],
  ['data analysis', 'data'],
  ['data analytics', 'data'],
  ['data integration', 'data'],
  ['data management', 'data'],
  ['data mining', 'data'],
  ['data modeling', 'data'],
  ['data processing', 'data'],
  ['data science', 'data'],
  ['data visualisation', 'data'],
  ['data visualization', 'data'],
  ['data-science', 'data'],
  ['data-wrangling', 'data'],
  ['database systems', 'database'],
  ['databases', 'database'],
  ['compilers', 'compiler'],
  ['android', 'mobile'],
  ['mobile app', 'mobile'],
  ['mobile applications', 'mobile'],
  ['mobile apps', 'mobile'],
  ['mobile development', 'mobile'],
  ['mobile programming', 'mobile'],
  ['mobile-apps', 'mobile'],
  ['cybersecurity', 'security'],
  ['vulnerabilities', 'security'],
  ['cloud computing', 'cloud'],
  ['cloud infrastructure', 'cloud'],
  ['cloud native', 'cloud'],
  ['cloud native infrastructure', 'cloud'],
  ['google cloud', 'cloud'],
  ['embedded hardware', 'embedded'],
  ['embedded system', 'embedded'],
  ['embedded systems', 'embedded'],
  ['embeddded', 'embedded'],
  ['game', 'games'],
  ['game design', 'games'],
  ['game development', 'games'],
  ['game engines', 'games'],
  ['gaming', 'games'],
  ['apis', 'api'],
  ['rest apis', 'api'],
  ['ui', 'user interface'],
  ['ui design', 'user interface'],
  ['ui/ux', 'user interface'],
  ['ux/ui', 'user interface'],
  ['gui', 'user interface'],
  ['end user application', 'applications'],
  ['end-user application', 'applications'],
  ['enterprise application', 'applications'],
  ['enterprise applications', 'applications'],
  ['application', 'applications'],
  ['apps', 'applications'],
  ['application development', 'applications'],
  ['app development', 'applications'],
  ['software analysis', 'software engineering'],
  ['software development', 'software engineering'],
  ['free software', 'software engineering'],
  ['health care', 'health'],
  ['healthcare', 'health'],
  ['heathcare', 'health'],
  ['ehealth', 'health'],
  ['real time', 'real-time'],
  ['realtime', 'real-time'],
  ['continuous integration', 'devops'],
  ['continuous delivery', 'devops'],
  ['dev-ops', 'devops'],
  ['testing/ci', 'devops'],
  ['container', 'containers'],
  ['computer-vision', 'computer vision'],
  ['vision', 'computer vision'],
  ['network', 'networking'],
  ['networks', 'networking'],
  ['operating system', 'operating systems'],
  ['operating-system', 'operating systems'],
  ['os', 'operating systems'],
  ['development tools', 'developer tools'],
  ['programming tools', 'developer tools'],
  ['build tools', 'developer tools'],
  ['dev tool', 'developer tools'],
  ['devtools', 'developer tools'],
  ['tools', 'developer tools'],
  ['programming language', 'programming languages'],
  ['programming', 'programming languages'],
  ['high performance computing', 'high-performance computing'],
  ['hpc', 'high-performance computing'],
  ['math', 'mathematics'],
  ['communications', 'communication'],
  ['distributed', 'distributed systems'],
  ['distributed computing', 'distributed systems'],
  ['distributed system', 'distributed systems'],
  ['micro services', 'microservices'],
  ['bioinformtics', 'bioinformatics'],
  ['image prcessing', 'image processing'],
  ['virtual-reality', 'virtual reality'],
  ['vr', 'virtual reality'],
]);

const topicExpansions = new Map([
  ['ai/ml', ['artificial intelligence', 'machine learning']],
  ['aiml', ['artificial intelligence', 'machine learning']],
  ['ml/al', ['artificial intelligence', 'machine learning']],
  [
    'programming languages and development tools',
    ['programming languages', 'developer tools'],
  ],
  ['full stack web and mobile', ['web', 'mobile']],
]);

function cleanTag(value) {
  return String(value)
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s*[,;.]\s*$/, '');
}

function resolveTag(
  value,
  aliases,
  expansions,
  splitCombined,
  visited = new Set(),
) {
  const cleaned = cleanTag(value);
  if (!cleaned) return [];
  const key = cleaned.toLocaleLowerCase();
  if (visited.has(key)) return [cleaned];

  if (/^c\+\+(?:11|14|17|20|23)$/i.test(cleaned)) return ['C++'];
  if (/^c\+\+ (?:libraries|template)/i.test(cleaned)) return ['C++'];

  const expansion = expansions.get(key);
  if (expansion) {
    const nextVisited = new Set(visited).add(key);
    return expansion.flatMap((item) =>
      resolveTag(item, aliases, expansions, splitCombined, nextVisited),
    );
  }

  const alias = aliases.get(key);
  if (alias) {
    if (alias.toLocaleLowerCase() === key) return [alias];
    return resolveTag(
      alias,
      aliases,
      expansions,
      splitCombined,
      new Set(visited).add(key),
    );
  }

  if (splitCombined && /[\\/]/.test(cleaned)) {
    return cleaned
      .split(/[\\/]/)
      .flatMap((item) =>
        resolveTag(
          item,
          aliases,
          expansions,
          splitCombined,
          new Set(visited).add(key),
        ),
      );
  }

  return [cleaned];
}

function normalizedList(values, aliases, expansions, splitCombined) {
  const byKey = new Map();
  for (const value of values) {
    for (const normalized of resolveTag(
      value,
      aliases,
      expansions,
      splitCombined,
    )) {
      if (normalized) byKey.set(normalized.toLocaleLowerCase(), normalized);
    }
  }
  return [...byKey.values()].sort((a, b) => a.localeCompare(b));
}

export function normalizeTechnologies(values = []) {
  return normalizedList(values, technologyAliases, technologyExpansions, true);
}

export function normalizeTopics(values = []) {
  return normalizedList(values, topicAliases, topicExpansions, false);
}
