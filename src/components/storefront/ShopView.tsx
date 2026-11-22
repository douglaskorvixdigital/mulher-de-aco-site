// Shop listing island — mounted by /shop and /category/[slug]. Structural version: tiles and
// layout follow the kit contract; the visual design comes with DESIGN.md.
import { useShop } from "../../hooks/storefront/useShop";
import FilterPanel from "./FilterPanel";
import QuickAdd from "./QuickAdd";
import { imgAttrs } from "../../wix/media";
import type { Category, ProductSummary } from "../../wix/storefront/types";

export default function ShopView(props: {
  initialProducts?: ProductSummary[];
  initialCategories?: Category[];
  initialCategoryId?: string | null;
}) {
  const shop = useShop(props);
  const { products, categories, activeCategoryId, loading, error } = shop;

  const active = categories.find((c) => c.id === activeCategoryId) ?? null;
  const byOrder = (a: Category, b: Category) => a.index - b.index || a.name.localeCompare(b.name);
  const children = active ? categories.filter((c) => c.parentId === active.id) : [];
  const row = (active
    ? children.length ? children : categories.filter((c) => c.parentId === active.parentId)
    : categories.filter((c) => c.parentId === null)
  ).sort(byOrder);

  return (
    <div className="flex flex-col gap-8">
      {categories.length > 1 ? (
        <nav aria-label="Shop categories" className="flex flex-wrap gap-2 text-sm">
          <a href="/shop" aria-current={!activeCategoryId ? "page" : undefined} className="rounded-control border border-border px-3 py-1.5 text-foreground no-underline aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground">All</a>
          {row.map((c) => (
            <a
              key={c.id}
              href={`/category/${c.slug}`}
              aria-current={c.id === activeCategoryId ? "page" : undefined}
              className="rounded-control border border-border px-3 py-1.5 text-foreground no-underline aria-[current=page]:bg-primary aria-[current=page]:text-primary-foreground"
            >{c.name}</a>
          ))}
        </nav>
      ) : null}

      <FilterPanel shop={shop}>
        {error ? (
          <p role="alert" className="text-destructive">
            The products could not be loaded. <button type="button" onClick={shop.retry} className="underline">Try again</button>
          </p>
        ) : products === null ? (
          <ul className="grid grid-cols-2 gap-6 lg:grid-cols-3" aria-busy="true">
            {[0, 1, 2].map((i) => <li key={i} className="aspect-[3/4] animate-pulse rounded-lg bg-secondary" />)}
          </ul>
        ) : products.length === 0 ? (
          shop.hasActiveFilters ? (
            <p>No products match these filters. <button type="button" onClick={shop.clearFilters} className="underline">Clear filters</button></p>
          ) : (
            <p className="text-muted-foreground">No products are available yet.</p>
          )
        ) : (
          <>
            <ul className={`grid grid-cols-2 gap-6 lg:grid-cols-3 ${loading ? "opacity-60" : ""}`} aria-busy={loading || undefined}>
              {products.map((p) => <Tile key={p.id} p={p} />)}
            </ul>
            {shop.hasMore ? (
              <button type="button" onClick={shop.loadMore} disabled={shop.loadingMore} className="mt-8 rounded-control border border-border px-5 py-2.5 text-sm font-medium disabled:opacity-50">
                {shop.loadingMore ? "Loading…" : "Load more"}
              </button>
            ) : null}
          </>
        )}
      </FilterPanel>
    </div>
  );
}

function Tile({ p }: { p: ProductSummary }) {
  const img = imgAttrs(p.imageUrl, "(min-width: 1024px) 25vw, 50vw", 0.75);
  const price = p.fromPrice ? `From ${p.price}` : p.price !== p.maxPrice ? `${p.price} – ${p.maxPrice}` : p.price;
  return (
    <li className="relative flex flex-col gap-3">
      <a href={`/products/${p.slug}`} className="flex flex-col gap-3 text-foreground no-underline">
        {"src" in img ? (
          <img {...img} alt={p.name} className="aspect-[3/4] w-full rounded-lg object-cover" />
        ) : (
          <div className="aspect-[3/4] w-full rounded-lg bg-secondary" aria-hidden="true" />
        )}
        {p.ribbons.length ? (
          <div className="flex flex-wrap gap-1">
            {p.ribbons.map((r) => <span key={r} className="rounded-control bg-secondary px-2 py-0.5 text-xs font-medium">{r}</span>)}
          </div>
        ) : null}
        <span className="min-w-0 break-words font-medium">{p.name}</span>
        <span>
          {price}
          {!p.fromPrice && p.price === p.maxPrice && p.compareAtPrice ? (
            <span className="ml-2 text-sm text-muted-foreground line-through"><span className="sr-only">Was </span>{p.compareAtPrice}</span>
          ) : null}
          {p.pricePerUnit ? <span className="ml-2 text-sm text-muted-foreground">{p.pricePerUnit}</span> : null}
        </span>
        {p.discountNames.length ? <span className="text-sm text-muted-foreground">{p.discountNames.join(" · ")}</span> : null}
        {p.swatches.length ? (
          <span className="flex gap-1" aria-label={p.optionsSummary}>
            {p.swatches.map((c) => <span key={c} className="size-3 rounded-full border border-border" style={{ backgroundColor: c }} />)}
          </span>
        ) : p.optionsSummary ? <span className="text-sm text-muted-foreground">{p.optionsSummary}</span> : null}
      </a>
      <QuickAdd product={p} />
    </li>
  );
}
