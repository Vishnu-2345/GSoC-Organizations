const CONTRIBUTION_ISSUE_URL =
  'https://github.com/rohanmalhotracodes/GSoC-Organizations/issues/382';

export default function ContributionAnnouncement({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  return (
    <aside
      className={`contribution-announcement${embedded ? ' is-embedded' : ''}`}
      aria-label="GSoC 2027 contribution announcement"
    >
      <span className="contribution-announcement-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <path d="M12 3.5v2M12 18.5v2M4.6 7.25l1.75 1M17.65 15.75l1.75 1M4.6 16.75l1.75-1M17.65 8.25l1.75-1" />
          <circle cx="12" cy="12" r="4.25" />
        </svg>
      </span>
      <p>
        <strong>GSoC 2027 is approaching.</strong>{' '}
        <span>
          Get familiar with open-source contributions through a
          beginner-friendly issue.
        </span>
      </p>
      <a href={CONTRIBUTION_ISSUE_URL} target="_blank" rel="noreferrer">
        Start contributing
        <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
