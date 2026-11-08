import { useEffect, useState } from 'react';
import { GITHUB_REPOSITORY_URL, GITHUB_STAR_FALLBACK } from '../lib/github';

export default function GitHubStarButton() {
  const [starCount, setStarCount] = useState(GITHUB_STAR_FALLBACK);

  useEffect(() => {
    const updateCount = (event: Event) => {
      const nextCount = (event as CustomEvent<number>).detail;
      if (Number.isInteger(nextCount)) setStarCount(nextCount);
    };

    try {
      const cached = JSON.parse(
        localStorage.getItem('gsoc-organizations-github-stars') || 'null',
      );
      if (cached && Number.isInteger(cached.count)) setStarCount(cached.count);
    } catch {}

    window.addEventListener('github-stars-updated', updateCount);
    return () =>
      window.removeEventListener('github-stars-updated', updateCount);
  }, []);

  return (
    <a
      className="github-star-link header-github-star-link"
      href={GITHUB_REPOSITORY_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Star us on GitHub"
      title="Star us on GitHub"
    >
      <span className="github-star-action">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .7a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.23c-3.22.7-3.9-1.36-3.9-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.72 1.27 3.38.97.1-.75.4-1.27.74-1.56-2.57-.29-5.27-1.28-5.27-5.68 0-1.25.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.16 1.18a10.96 10.96 0 0 1 5.76 0c2.2-1.49 3.16-1.18 3.16-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.41-2.71 5.39-5.29 5.68.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .7Z" />
        </svg>
        <span className="github-star-label">Star us on GitHub</span>
      </span>
      <span
        className="github-star-count"
        data-github-star-count
        data-testid="github-star-count"
        aria-live="polite"
      >
        {new Intl.NumberFormat().format(starCount)}
      </span>
    </a>
  );
}
