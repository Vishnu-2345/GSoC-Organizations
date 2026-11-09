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
      <p>
        <strong>GSoC 2027 is approaching.</strong>{' '}
        <span>
          Get hands-on with open source by contributing directly to this
          website&rsquo;s codebase.
        </span>
      </p>
      <a href={CONTRIBUTION_ISSUE_URL} target="_blank" rel="noreferrer">
        View contribution issue
        <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
