import type { OrganizationSummary } from '../types';

type Props = {
  organization: OrganizationSummary;
  bookmarked: boolean;
  onBookmark: (slug: string) => void;
};

export default function OrganizationCard({
  organization,
  bookmarked,
  onBookmark,
}: Props) {
  const profileUrl = `/org/${organization.slug}/`;
  const repository = organization.repository.repositories[0];
  const repositoryUrl =
    repository?.url || organization.repository.organizationProfile;
  const initials = organization.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('');

  return (
    <article
      className="org-card"
      onClick={(event) => {
        if ((event.target as HTMLElement).closest('a, button')) return;
        window.location.assign(profileUrl);
      }}
    >
      <div className="org-card-topline">
        <div className="org-logo" aria-hidden="true">
          {organization.logo && (
            <img
              src={organization.logo}
              alt=""
              width="132"
              height="132"
              loading="lazy"
              decoding="async"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          )}
          <span>{initials}</span>
        </div>
        <button
          className={`bookmark-button ${bookmarked ? 'is-bookmarked' : ''}`}
          type="button"
          aria-label={
            bookmarked
              ? `Remove ${organization.name} from saved organizations`
              : `Save ${organization.name}`
          }
          title={bookmarked ? 'Remove saved organization' : 'Save organization'}
          aria-pressed={bookmarked}
          onClick={() => onBookmark(organization.slug)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.25 3.5h9.5c.97 0 1.75.78 1.75 1.75v15.1L12 16.4l-6.5 3.95V5.25c0-.97.78-1.75 1.75-1.75Z" />
          </svg>
        </button>
      </div>
      <div className="org-card-body">
        <span className="category-label">{organization.category}</span>
        <h2>
          <a href={profileUrl}>{organization.name}</a>
        </h2>
        <p>
          {organization.description ||
            'No description is available in the source archive.'}
        </p>
        <div className="year-row" aria-label="Participation years">
          {organization.years.map((year) => (
            <span key={year}>{year}</span>
          ))}
        </div>
        <div className="tag-row" aria-label="Technologies">
          {organization.technologies.slice(0, 4).map((technology) => (
            <span className="tag" key={technology}>
              {technology}
            </span>
          ))}
          {organization.technologies.length > 4 && (
            <span className="tag muted">
              +{organization.technologies.length - 4}
            </span>
          )}
        </div>
      </div>
      <dl className="card-metrics">
        <div>
          <dt>Projects</dt>
          <dd>{organization.totalProjects}</dd>
        </div>
        <div>
          <dt>Participations</dt>
          <dd>{organization.participationCount}</dd>
        </div>
      </dl>
      <div className="org-card-actions">
        <a className="button secondary-button" href={profileUrl}>
          View profile
        </a>
        {repositoryUrl && (
          <a
            className="button repository-button"
            href={repositoryUrl}
            target="_blank"
            rel="noreferrer"
          >
            {repository?.host || 'Web'}
            <span
              className={repository?.verified ? 'verified-dot' : 'inferred-dot'}
              aria-hidden="true"
            />
            <span className="sr-only">
              {repository?.verified
                ? 'verified'
                : organization.repository.source === 'search'
                  ? 'search fallback'
                  : 'inferred'}
            </span>
          </a>
        )}
      </div>
    </article>
  );
}
