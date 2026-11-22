// Product page island. Structural version; selection, stock and the buy button come from the
// shipped hook and OptionPicker — never resolved here.
import { useState } from "react";
import { useProductDetail } from "../../hooks/storefront/useProductDetail";
import OptionPicker from "./OptionPicker";
import { imgAttrs } from "../../wix/media";
import type { ProductDetail } from "../../wix/storefront/types";

export default function ProductDetailView(props: { initial?: ProductDetail | null; slug?: string }) {
  const d = useProductDetail(props);
  const [picked, setPicked] = useState<string | null>(null);

  if (d.notFound) return <p>This product does not exist anymore. <a href="/shop">Back to the shop</a></p>;
  if (!d.product) return <div className="h-96 animate-pulse rounded-lg bg-secondary" aria-busy="true" />;

  const p = d.product;
  const main = d.imageUrl || picked || p.gallery[0] || "";
  const mainImg = imgAttrs(main, "(min-width: 768px) 50vw, 100vw", 0.75);

  return (
    <article className="flex flex-col gap-10">
      <div className="md:grid md:grid-cols-2 md:gap-12">
        <div className="flex flex-col gap-3">
          {"src" in mainImg ? (
            <img {...mainImg} loading="eager" alt={p.name} className="max-h-[45vh] w-full rounded-lg object-contain md:max-h-none" />
          ) : (
            <div className="aspect-[3/4] max-h-[45vh] w-full rounded-lg bg-secondary md:max-h-none" aria-hidden="true" />
          )}
          {p.gallery.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto">
              {p.gallery.map((url, i) => {
                const t = imgAttrs(url, "80px", 1);
                return (
                  <button key={url} type="button" onClick={() => setPicked(url)} aria-label={`Show image ${i + 1}`} aria-pressed={url === main} className="shrink-0 rounded-md border border-border aria-pressed:border-foreground">
                    {"src" in t ? <img {...t} alt="" className="size-16 rounded-md object-cover" /> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-4 md:mt-0">
          {p.breadcrumbs.length ? (
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <a href="/shop" className="text-muted-foreground">Shop</a>
              {p.breadcrumbs.map((b) => (
                <span key={b.id}> › <a href={`/category/${b.slug}`} className="text-muted-foreground">{b.name}</a></span>
              ))}
              <span> › {p.name}</span>
            </nav>
          ) : null}
          {p.ribbons.length ? (
            <div className="flex flex-wrap gap-1">
              {p.ribbons.map((r) => <span key={r} className="rounded-control bg-secondary px-2 py-0.5 text-xs font-medium">{r}</span>)}
            </div>
          ) : null}
          <h1 className="font-serif text-3xl font-semibold">{p.name}</h1>
          <p className="text-xl">
            {d.price}
            {d.compareAtPrice ? <span className="ml-2 text-base text-muted-foreground line-through"><span className="sr-only">Was </span>{d.compareAtPrice}</span> : null}
            {d.pricePerUnit ? <span className="ml-2 text-sm text-muted-foreground">{d.pricePerUnit}</span> : null}
          </p>
          {p.discountNames.length ? <p className="text-sm text-muted-foreground">{p.discountNames.join(" · ")}</p> : null}
          <OptionPicker detail={d} showQuantity />
        </div>
      </div>

      {p.descriptionHtml ? <div className="prose max-w-2xl" dangerouslySetInnerHTML={{ __html: p.descriptionHtml }} /> : null}
      {p.infoSections.map((s) => (
        <details key={s.title} className="max-w-2xl border-t border-border pt-4">
          <summary className="cursor-pointer font-medium">{s.title}</summary>
          <div className="mt-3" dangerouslySetInnerHTML={{ __html: s.html }} />
        </details>
      ))}
    </article>
  );
}
