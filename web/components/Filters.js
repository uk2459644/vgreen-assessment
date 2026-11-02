'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Filters live in the URL (?category=&occasion=&budget=&search=) so a filtered
// catalogue can be shared, bookmarked and works with the back button.
// The page itself is a server component that reads the same params.
export default function Filters({ meta }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');

  function setParam(key, value) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Wait 400 ms after typing stops before updating the URL.
  useEffect(() => {
    const current = params.get('search') || '';
    if (search.trim() === current) return undefined;
    const t = setTimeout(() => setParam('search', search.trim()), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, params]);

  const hasFilters = ['category', 'occasion', 'budget', 'search'].some((k) => params.get(k));

  return (
    <section aria-label="Filters">
      <div className="filters">
        <div>
          <label htmlFor="f-search">Search</label>
          <input
            id="f-search"
            type="search"
            placeholder="e.g. bottle, hamper"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="f-category">Category</label>
          <select id="f-category" value={params.get('category') || ''} onChange={(e) => setParam('category', e.target.value)}>
            <option value="">All categories</option>
            {meta.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-occasion">Occasion</label>
          <select id="f-occasion" value={params.get('occasion') || ''} onChange={(e) => setParam('occasion', e.target.value)}>
            <option value="">All occasions</option>
            {meta.occasions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-budget">Budget per unit</label>
          <select id="f-budget" value={params.get('budget') || ''} onChange={(e) => setParam('budget', e.target.value)}>
            <option value="">Any budget</option>
            {meta.budgetBands.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {hasFilters && (
        <button
          type="button"
          className="btn btn-outline btn-small"
          onClick={() => {
            setSearch('');
            router.replace(pathname, { scroll: false });
          }}
        >
          Clear filters
        </button>
      )}
    </section>
  );
}
