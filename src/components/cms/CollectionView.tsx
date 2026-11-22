// Listing island for a CMS collection (editions, profiles, events). Structural version:
// the visual design comes with DESIGN.md. Every state renders totally; nothing here throws.
import { useCollection } from "../../hooks/cms/useCollection";
import { formatDate } from "../../wix/cms/items-core";
import { imgAttrs } from "../../wix/media";
import type { CmsItem, CmsSort } from "../../wix/cms/types";

export interface CardFields {
  title: string;        // the field holding the card title
  image?: string;       // IMAGE field
  date?: string;        // DATE field
  kicker?: string;      // a short TEXT field above the title
  summary?: string;     // a short TEXT field under the title
}

export default function CollectionView(props: {
  collectionId: string;
  basePath: string;     // cards link to `${basePath}/${item.slug}`
  fields: CardFields;
  emptyText: string;
  sort?: CmsSort[];
  limit?: number;
  initialItems?: CmsItem[];
  initialHasNext?: boolean;
}) {
  const { collectionId, basePath, fields, emptyText, ...options } = props;
  const list = useCollection(collectionId, options);

  if (list.error && !list.items) {
    return <p role="alert" className="text-destructive">This list could not be loaded. Please try again later.</p>;
  }
  if (list.items === null) {
    return (
      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <li key={i} className="aspect-[4/3] animate-pulse rounded-lg bg-secondary" />
        ))}
      </ul>
    );
  }
  if (list.items.length === 0) {
    return <p className="text-muted-foreground">{emptyText}</p>;
  }

  return (
    <div>
      <ul
        className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ${list.fetching ? "opacity-60" : ""}`}
        aria-busy={list.fetching || undefined}
      >
        {list.items.map((item) => {
          const title = String(item[fields.title] ?? "");
          const img = fields.image ? imgAttrs(item[fields.image] as string, "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", 0.75) : {};
          return (
            <li key={item._id}>
              <a href={`${basePath}/${String(item.slug ?? "")}`} className="group flex flex-col gap-3 text-foreground no-underline">
                {"src" in img ? (
                  <img {...img} alt={title} className="aspect-[4/3] w-full rounded-lg object-cover" />
                ) : (
                  <div className="aspect-[4/3] w-full rounded-lg bg-secondary" aria-hidden="true" />
                )}
                {fields.kicker && item[fields.kicker] ? <p className="eyebrow">{String(item[fields.kicker])}</p> : null}
                <h2 className="min-w-0 break-words font-serif text-xl font-semibold group-hover:underline">{title}</h2>
                {fields.date && item[fields.date] ? (
                  <p className="text-sm text-muted-foreground">{formatDate(item[fields.date])}</p>
                ) : null}
                {fields.summary && item[fields.summary] ? (
                  <p className="text-muted-foreground">{String(item[fields.summary])}</p>
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
      {list.hasNext ? (
        <button
          type="button"
          onClick={() => list.loadMore()}
          disabled={list.loadingMore}
          className="mt-10 rounded-control border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-50"
        >
          {list.loadingMore ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </div>
  );
}
