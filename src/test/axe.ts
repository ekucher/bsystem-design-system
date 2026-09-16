import axe from "axe-core";

/**
 * Fails the calling test when a rendered container has any accessibility
 * violation axe can detect.
 *
 * Automated checks cover only part of what accessibility means — they cannot
 * tell whether a label is accurate, whether an order makes sense, or whether
 * focus goes somewhere useful. Those are covered by the behavioural tests
 * alongside these. What automation does catch is the part that regresses
 * silently: a missing name, a broken association, a control with no
 * accessible text.
 */
export async function expectNoAccessibilityViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    // jsdom does not lay out or paint, so contrast cannot be evaluated. It is
    // excluded explicitly rather than appearing to pass.
    rules: { "color-contrast": { enabled: false } },
  });
  if (results.violations.length === 0) return;

  const described = results.violations
    .map((violation) => `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(" ")).join(", ")})`)
    .join("\n  ");
  throw new Error(`accessibility violations:\n  ${described}`);
}
