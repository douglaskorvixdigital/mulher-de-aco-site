// Page transitions — "the screen transforms when you click".
//
// Two gestures, both on the Web Animations API (compositor-friendly, no library, works on every
// host because each page is still a normal server-rendered page):
//   wipe   (default for every internal link): a metallic gold line draws across the middle of the
//          screen, then a navy curtain rises from below and covers the page; the next page opens
//          with the curtain leaving upward, led by the same line.
//   expand (links marked data-tx="expand" that hold an <img>): the picture lifts out of its frame
//          and grows to fill the screen over navy; on the next page it settles into the element
//          marked data-tx-target, so the image travels between the two pages.
// Reduced motion: no curtain, no travel; links navigate at once.

const KEY = "mda-tx";
const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = "cubic-bezier(.77, 0, .175, 1)";
const EASE_OUT = "cubic-bezier(.16, 1, .3, 1)";

type Stored = { kind: "wipe" } | { kind: "expand"; src: string };

function layer() {
  let root = document.getElementById("tx");
  if (!root) {
    root = document.createElement("div");
    root.id = "tx";
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = '<div class="tx-panel"></div><div class="tx-line"></div>';
    document.body.appendChild(root);
  }
  return {
    root,
    panel: root.querySelector<HTMLElement>(".tx-panel")!,
    line: root.querySelector<HTMLElement>(".tx-line")!,
  };
}

function isInternal(a: HTMLAnchorElement, e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download") || a.dataset.tx === "none") return false;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return false;
  if (url.pathname === location.pathname && url.hash) return false; // in-page anchor
  if (url.href === location.href) return false;
  return true;
}

async function leaveWipe() {
  const { root, panel, line } = layer();
  root.classList.add("on");
  panel.style.clipPath = "inset(100% 0 0 0)";
  line.style.transform = "scaleX(0)";
  line.style.top = "50%";
  await line.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 380, easing: EASE_OUT, fill: "forwards" }).finished;
  await Promise.all([
    panel.animate([{ clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0 0 0 0)" }], { duration: 620, easing: EASE, fill: "forwards" }).finished,
    line.animate([{ top: "50%", opacity: 1 }, { top: "0%", opacity: 0.0 }], { duration: 620, easing: EASE, fill: "forwards" }).finished,
  ]);
}

async function leaveExpand(img: HTMLImageElement) {
  const { root, panel } = layer();
  const r = img.getBoundingClientRect();
  const ghost = img.cloneNode() as HTMLImageElement;
  ghost.className = "tx-ghost";
  Object.assign(ghost.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  root.appendChild(ghost);
  root.classList.add("on");
  panel.style.clipPath = "inset(0 0 0 0)";
  const fade = panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, easing: EASE_OUT, fill: "forwards" });
  const grow = ghost.animate(
    [
      { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` },
      { left: "0px", top: "0px", width: `${innerWidth}px`, height: `${innerHeight}px` },
    ],
    { duration: 820, easing: EASE, fill: "forwards" },
  );
  await Promise.all([fade.finished, grow.finished]);
}

function go(href: string, stored: Stored) {
  try { sessionStorage.setItem(KEY, JSON.stringify(stored)); } catch { /* navigation still happens */ }
  location.href = href;
}

async function enter() {
  let stored: Stored | null = null;
  try { stored = JSON.parse(sessionStorage.getItem(KEY) || "null"); sessionStorage.removeItem(KEY); } catch { stored = null; }
  const { root, panel, line } = layer();
  document.documentElement.classList.remove("tx-cover");
  if (!stored || reduce()) { root.classList.remove("on"); return; }
  root.classList.add("on");

  if (stored.kind === "expand") {
    const target = document.querySelector<HTMLElement>("[data-tx-target]");
    const ghost = document.createElement("img");
    ghost.className = "tx-ghost";
    ghost.src = stored.src;
    ghost.alt = "";
    Object.assign(ghost.style, { left: "0px", top: "0px", width: `${innerWidth}px`, height: `${innerHeight}px` });
    root.appendChild(ghost);
    panel.style.clipPath = "inset(0 0 0 0)";
    if (target) {
      target.style.visibility = "hidden";
      await new Promise((r) => requestAnimationFrame(r));
      const t = target.getBoundingClientRect();
      await Promise.all([
        ghost.animate(
          [
            { left: "0px", top: "0px", width: `${innerWidth}px`, height: `${innerHeight}px` },
            { left: `${t.left}px`, top: `${t.top}px`, width: `${t.width}px`, height: `${t.height}px` },
          ],
          { duration: 900, easing: EASE, fill: "forwards" },
        ).finished,
        panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 700, delay: 250, easing: EASE_OUT, fill: "forwards" }).finished,
      ]);
      target.style.visibility = "";
    } else {
      await Promise.all([
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: EASE_OUT, fill: "forwards" }).finished,
        panel.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, easing: EASE_OUT, fill: "forwards" }).finished,
      ]);
    }
    ghost.remove();
  } else {
    panel.style.clipPath = "inset(0 0 0 0)";
    line.style.top = "100%";
    line.style.transform = "scaleX(1)";
    await Promise.all([
      panel.animate([{ clipPath: "inset(0 0 0 0)" }, { clipPath: "inset(0 0 100% 0)" }], { duration: 820, delay: 80, easing: EASE, fill: "forwards" }).finished,
      line.animate([{ top: "100%", opacity: 1 }, { top: "0%", opacity: 0 }], { duration: 820, delay: 80, easing: EASE, fill: "forwards" }).finished,
    ]);
  }
  root.classList.remove("on");
  panel.getAnimations().forEach((a) => a.cancel());
  line.getAnimations().forEach((a) => a.cancel());
  panel.style.opacity = "";
}

let leaving = false;
document.addEventListener("click", async (e) => {
  const a = (e.target as Element)?.closest?.("a") as HTMLAnchorElement | null;
  if (!a || leaving || !isInternal(a, e)) return;
  if (reduce()) return; // plain navigation
  e.preventDefault();
  leaving = true;
  const href = a.href;
  const img = a.dataset.tx === "expand" ? a.querySelector("img") : null;
  // safety: never strand the visitor if an animation is interrupted
  const fallback = setTimeout(() => go(href, { kind: "wipe" }), 1600);
  try {
    if (img && img.complete) {
      await leaveExpand(img);
      clearTimeout(fallback);
      go(href, { kind: "expand", src: img.currentSrc || img.src });
    } else {
      await leaveWipe();
      clearTimeout(fallback);
      go(href, { kind: "wipe" });
    }
  } catch {
    clearTimeout(fallback);
    location.href = href;
  }
});

// back/forward cache: a restored page must never show the curtain
addEventListener("pageshow", (e) => {
  if ((e as PageTransitionEvent).persisted) {
    leaving = false;
    const root = document.getElementById("tx");
    root?.classList.remove("on");
    root?.querySelectorAll(".tx-ghost").forEach((g) => g.remove());
    root?.querySelectorAll<HTMLElement>(".tx-panel, .tx-line").forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  }
});

enter();
