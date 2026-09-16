import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The stylesheet contract.
 *
 * Nothing else in this repository reads the CSS. jsdom does not lay out or
 * paint, TypeScript does not parse stylesheets, and `src/test/axe.ts` disables
 * the contrast rule explicitly — honestly, since it cannot be evaluated without
 * layout — which leaves `docs/ARCHITECTURE.md`'s "sufficient contrast"
 * requirement asserted by nobody.
 *
 * Contrast does not need layout, though. It needs the two colours, and both are
 * in `tokens.css`. So these tests resolve the tokens themselves and do the
 * arithmetic, for every foreground/background pair the components actually
 * form, in both themes.
 *
 * The rest are the rules `tokens.css` states in its own header, enforced rather
 * than described. Each failure they catch is silent: a misspelled custom
 * property renders as no colour at all, and a token added to one theme and
 * forgotten in the other makes the light theme depend on how it was reached.
 */

// Read from disk rather than through the module graph: an import would hand
// back whatever the bundler makes of a stylesheet, and what is under test is
// the file a consumer receives.
const read = (name: string) => readFileSync(join(process.cwd(), "src", name), "utf8");
const tokensCss = read("tokens.css");
const componentsCss = read("components.css");

/** The body of the block a selector opens, brace-matched. */
function blockOf(css: string, selector: string): string {
  const open = css.indexOf(selector);
  if (open < 0) throw new Error(`no such selector: ${selector}`);
  let i = css.indexOf("{", open);
  const start = i;
  let depth = 0;
  for (; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}") {
      depth -= 1;
      if (depth === 0) return css.slice(start + 1, i);
    }
  }
  throw new Error(`unbalanced block: ${selector}`);
}

function declarations(block: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const [, name, value] of block.matchAll(/(--bs-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    found.set(name, value.trim());
  }
  return found;
}

const root = declarations(blockOf(tokensCss, ":root {"));
const systemLight = declarations(blockOf(tokensCss, "@media (prefers-color-scheme: light)"));
const forcedLight = declarations(blockOf(tokensCss, ':root[data-theme="light"]'));

const dark = root;
const light = new Map([...root, ...forcedLight]);

/** A primitive carries a raw value and no meaning; a semantic says what it is for. */
const isPrimitive = (name: string) => /^--bs-(gray|white|black|blue|green|amber|red|purple)(-\d+)?$/.test(name);

const referencedByComponents = new Set(
  [...componentsCss.matchAll(/var\((--bs-[a-z0-9-]+)/g)].map((match) => match[1]),
);

describe("the token layers", () => {
  // A misspelled custom property is not an error anywhere: the declaration is
  // simply dropped, and the element renders with no colour — or, worse, an
  // inherited one that looks plausible.
  it("defines every token the components reference", () => {
    const undefinedTokens = [...referencedByComponents].filter((name) => !root.has(name));
    expect(undefinedTokens).toEqual([]);
  });

  // tokens.css: "A component that reaches past a semantic token to a primitive
  // cannot be re-themed, because the theme is exactly the mapping between the
  // two layers."
  it("keeps components on the semantic layer", () => {
    const reachingPast = [...referencedByComponents].filter(isPrimitive);
    expect(reachingPast).toEqual([]);
  });

  // The same rule, one step further. A literal colour does not merely skip the
  // semantic layer — it leaves the token system altogether, so no theme can
  // reach it. Two button rules used `color: white` while
  // --bs-color-text-on-accent existed for exactly that job.
  it("leaves no colour outside the token system", () => {
    const literals: string[] = [];
    const named = /\b(white|black|red|blue|green|gray|grey|silver|navy|teal|orange|yellow|purple|pink|brown)\b/;
    for (const [, property, value] of componentsCss.matchAll(
      /(color|background|background-color|border-color|border-top-color|border-left-color|border-bottom-color|fill|stroke)\s*:\s*([^;]+);/g,
    )) {
      if (/#[0-9a-fA-F]{3,8}/.test(value) || named.test(value)) literals.push(`${property}: ${value.trim()}`);
    }
    expect(literals).toEqual([]);
  });
});

describe("the light theme", () => {
  // The light mapping is written twice — once for a reader whose system asks
  // for it, once for an application that forces it. Two copies drift, and the
  // drift is invisible: the theme simply differs depending on how it was
  // reached, which nobody would think to check.
  it("is the same mapping however it is reached", () => {
    expect([...systemLight.keys()].sort()).toEqual([...forcedLight.keys()].sort());
    for (const [name, value] of systemLight) {
      expect(`${name}: ${forcedLight.get(name)}`).toBe(`${name}: ${value}`);
    }
  });

  // An override with no token beneath it is a token the dark theme lacks, which
  // means the dark theme falls back to nothing.
  it("overrides only tokens the default theme defines", () => {
    const orphans = [...systemLight.keys()].filter((name) => !root.has(name));
    expect(orphans).toEqual([]);
  });
});

/** Resolves a token through any chain of var() references. */
function resolve(name: string, theme: Map<string, string>): string {
  let value = theme.get(name);
  if (value === undefined) throw new Error(`undefined token: ${name}`);
  for (let hops = 0; hops < 10; hops += 1) {
    const reference = /^var\((--bs-[a-z0-9-]+)\)$/.exec(value!);
    if (!reference) return value!;
    value = theme.get(reference[1]);
    if (value === undefined) throw new Error(`undefined token: ${reference[1]}`);
  }
  throw new Error(`token reference cycle: ${name}`);
}

type Colour = { r: number; g: number; b: number; a: number };

function parse(value: string): Colour {
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(value.trim());
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((d) => d + d).join("") : hex[1];
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: 1,
    };
  }
  const rgb = /^rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+)%\s*)?\)$/.exec(value.trim());
  if (rgb) {
    return {
      r: Number(rgb[1]),
      g: Number(rgb[2]),
      b: Number(rgb[3]),
      a: rgb[4] === undefined ? 1 : Number(rgb[4]) / 100,
    };
  }
  throw new Error(`cannot read colour: ${value}`);
}

/** Lays a translucent colour over an opaque one, as the browser would. */
function over(front: Colour, back: Colour): Colour {
  if (front.a === 1) return front;
  return {
    r: Math.round(front.r * front.a + back.r * (1 - front.a)),
    g: Math.round(front.g * front.a + back.g * (1 - front.a)),
    b: Math.round(front.b * front.a + back.b * (1 - front.a)),
    a: 1,
  };
}

/** WCAG 2.1 relative luminance. */
function luminance({ r, g, b }: Colour): number {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(foreground: Colour, background: Colour): number {
  const opaque = over(foreground, background);
  const [lighter, darker] = [luminance(opaque), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * The pairs the components actually form, each traced to the rule in
 * components.css that puts the two together. Inventing a pair would assert a
 * requirement nobody has; omitting a real one would let it regress.
 *
 * `beneath` is the opaque surface a translucent background sits on — the alert
 * tints are percentages, so the colour a reader sees is the composite.
 */
const PAIRS: { what: string; fg: string; bg: string; beneath?: string }[] = [
  { what: "body text on the page", fg: "--bs-color-text", bg: "--bs-color-bg" },
  { what: "text on a card", fg: "--bs-color-text", bg: "--bs-color-surface" },
  { what: "text in a dialog", fg: "--bs-color-text", bg: "--bs-color-surface-raised" },
  { what: "a table header", fg: "--bs-color-text", bg: "--bs-color-surface-sunken" },
  { what: "a field description", fg: "--bs-color-text-muted", bg: "--bs-color-surface" },
  { what: "a table caption", fg: "--bs-color-text-muted", bg: "--bs-color-bg" },
  { what: "a badge label", fg: "--bs-color-text-muted", bg: "--bs-color-surface-raised" },
  { what: "a success badge", fg: "--bs-color-success", bg: "--bs-color-surface-raised" },
  { what: "a warning badge", fg: "--bs-color-warning", bg: "--bs-color-surface-raised" },
  { what: "a danger badge", fg: "--bs-color-danger", bg: "--bs-color-surface-raised" },
  { what: "a field error", fg: "--bs-color-danger", bg: "--bs-color-surface" },
  { what: "a breadcrumb link", fg: "--bs-color-primary", bg: "--bs-color-bg" },
  { what: "a primary button label", fg: "--bs-color-text-on-accent", bg: "--bs-color-primary-solid" },
  { what: "a danger button label", fg: "--bs-color-text-on-accent", bg: "--bs-color-danger-solid" },
  { what: "an info alert", fg: "--bs-color-text", bg: "--bs-color-info-surface", beneath: "--bs-color-surface" },
  { what: "a success alert", fg: "--bs-color-text", bg: "--bs-color-success-surface", beneath: "--bs-color-surface" },
  { what: "a warning alert", fg: "--bs-color-text", bg: "--bs-color-warning-surface", beneath: "--bs-color-surface" },
  { what: "a danger alert", fg: "--bs-color-text", bg: "--bs-color-danger-surface", beneath: "--bs-color-surface" },
];

describe.each([
  ["dark", dark],
  ["light", light],
])("contrast in the %s theme", (_theme, palette) => {
  // WCAG AA for text below 18.66px bold or 24px. Every pair here is body text,
  // a label or a button label at 0.875rem, so none of them qualifies for the
  // relaxed large-text threshold of 3:1.
  it.each(PAIRS)("reads at AA: $what", ({ fg, bg, beneath }) => {
    const background = beneath
      ? over(parse(resolve(bg, palette)), parse(resolve(beneath, palette)))
      : parse(resolve(bg, palette));
    const ratio = contrast(parse(resolve(fg, palette)), background);

    expect(Number(ratio.toFixed(2))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("the accent fills", () => {
  // The reason --bs-color-primary-solid exists as its own token. If the two
  // ever collapse back into one value, one of the two jobs silently loses: a
  // button label becomes unreadable, or an accent link does.
  it.each([
    ["dark", dark],
    ["light", light],
  ])("serve a fill and an accent separately where they must (%s)", (_theme, palette) => {
    const onAccent = parse(resolve("--bs-color-text-on-accent", palette));
    const page = parse(resolve("--bs-color-bg", palette));

    for (const [fill, accent] of [
      ["--bs-color-primary-solid", "--bs-color-primary"],
      ["--bs-color-danger-solid", "--bs-color-danger"],
    ]) {
      expect(contrast(onAccent, parse(resolve(fill, palette)))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(parse(resolve(accent, palette)), page)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
