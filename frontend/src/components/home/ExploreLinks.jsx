// ExploreLinks.jsx — quiet navigation entry points. Subtle text links,
// not feature cards — this section is a footer-nav, not marketing.

import { Link } from "react-router-dom";

export default function ExploreLinks({ links }) {
  return (
    <nav aria-label="Explore LeakLens" className="flex flex-col gap-4">
      <p className="overline text-[10px]">Explore LeakLens</p>
      <div className="flex flex-wrap gap-x-7 gap-y-3">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="text-small text-text-secondary transition-colors hover:text-text-primary"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
