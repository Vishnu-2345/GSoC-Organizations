export type Project = {
  title: string;
  description: string;
  shortDescription: string;
  contributor?: string;
  codeUrl?: string;
  projectUrl?: string;
  inferredTechnologies: string[];
};

export type Participation = {
  year: number;
  projectCount: number;
  projects: Project[];
};

export type Repository = {
  label: string;
  url: string;
  host: string;
  verified: boolean;
  lastChecked?: string;
};

export type RepositoryEntry = {
  repositories: Repository[];
  organizationProfile?: string;
  source: 'manual' | 'derived' | 'search';
};

export type Organization = {
  slug: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  category: string;
  ideasUrl: string;
  contributionGuide: string;
  communityLinks: { label: string; url: string }[];
  technologies: string[];
  topics: string[];
  years: number[];
  latestYear: number;
  totalProjects: number;
  participationCount: number;
  participations: Participation[];
  repository: RepositoryEntry;
};

export type OrganizationSummary = Omit<
  Organization,
  'participations' | 'communityLinks'
>;

export type SortKey = 'recent' | 'projects' | 'years' | 'name';

export type FilterState = {
  query: string;
  firstTime: boolean;
  years: number[];
  categories: string[];
  technologies: string[];
  topics: string[];
  excludeTechnologies: string[];
  excludeTopics: string[];
  sort: SortKey;
};
