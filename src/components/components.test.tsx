import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { expectNoAccessibilityViolations } from "../test/axe.js";
import { Alert, Badge, Breadcrumbs, Button, Card, Dialog, Dropdown, Input, Pagination, Select, Skeleton, Spinner, StatusBadge, Table, Tabs, Textarea } from "../index.js";

describe("Button", () => {
  // The HTML default for a button inside a form is "submit", which makes any
  // unrelated button submit the form by accident.
  it("defaults to type=button", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("allows the type to be overridden", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Save</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("StatusBadge", () => {
  it.each([
    { status: "ready", tone: "success" },
    { status: "degraded", tone: "warning" },
    { status: "open", tone: "danger" },
    { status: "disabled", tone: "neutral" },
    { status: "something-else", tone: "neutral" },
  ])("maps $status to the $tone tone", ({ status, tone }) => {
    const { container } = render(<StatusBadge status={status} />);
    expect(container.querySelector(".bs-badge")).toHaveClass(`bs-badge--${tone}`);
  });

  // Colour must never be the only thing carrying meaning: the status word is
  // always rendered, and a description can be added for assistive technology.
  it("always renders the status as text", () => {
    render(<StatusBadge status="degraded" description="Upstream is rate limiting" />);
    expect(screen.getByText("degraded")).toBeInTheDocument();
    expect(screen.getByText(/Upstream is rate limiting/)).toBeInTheDocument();
  });
});

describe("fields", () => {
  // A control with no associated label is unusable with a screen reader, and
  // the association is exactly what gets forgotten when it is done per usage.
  it.each([
    { name: "Input", element: <Input label="Client name" /> },
    { name: "Textarea", element: <Textarea label="Client name" /> },
    { name: "Select", element: <Select label="Client name" options={[{ value: "a", label: "A" }]} /> },
  ])("associates $name with its label", ({ element }) => {
    render(element);
    expect(screen.getByLabelText("Client name")).toBeInTheDocument();
  });

  it("announces the description with the control", () => {
    render(<Input label="Limit" description="Maximum items per page" />);
    expect(screen.getByLabelText("Limit")).toHaveAccessibleDescription("Maximum items per page");
  });

  it("marks the control invalid and announces the error", () => {
    render(<Input label="Limit" error="Must be a number" />);
    const input = screen.getByLabelText("Limit");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(expect.stringContaining("Must be a number") as unknown as string);
    // A validation failure appearing after submission has to be announced,
    // not merely rendered.
    expect(screen.getByRole("alert")).toHaveTextContent("Must be a number");
  });

  it("announces both the description and the error", () => {
    render(<Input label="Limit" description="Maximum items" error="Too large" />);
    const description = screen.getByLabelText("Limit").getAttribute("aria-describedby") ?? "";
    expect(description.split(" ")).toHaveLength(2);
  });

  it("is not marked invalid without an error", () => {
    render(<Input label="Limit" />);
    expect(screen.getByLabelText("Limit")).not.toHaveAttribute("aria-invalid");
  });

  // Two fields on one page must not collide, which they would if the id were
  // derived from the label.
  it("gives each field a distinct id", () => {
    render(
      <>
        <Input label="First" />
        <Input label="Second" />
      </>,
    );
    expect(screen.getByLabelText("First").id).not.toBe(screen.getByLabelText("Second").id);
  });

  it("renders select options and an optional placeholder", async () => {
    render(
      <Select
        label="Source"
        placeholder="Choose a source"
        options={[
          { value: "espocrm", label: "EspoCRM" },
          { value: "redmine", label: "Redmine", disabled: true },
        ]}
      />,
    );
    const select = screen.getByLabelText("Source");
    expect(within(select).getByRole("option", { name: "Choose a source" })).toBeInTheDocument();
    expect(within(select).getByRole("option", { name: "Redmine" })).toBeDisabled();
    await userEvent.selectOptions(select, "espocrm");
    expect(select).toHaveValue("espocrm");
  });
});

describe("Alert", () => {
  // An error interrupts; a success waits for a pause. Interrupting a
  // screen-reader user to say something worked is an interruption for nothing.
  it.each([
    { tone: "danger" as const, role: "alert" },
    { tone: "warning" as const, role: "alert" },
    { tone: "info" as const, role: "status" },
    { tone: "success" as const, role: "status" },
  ])("uses $role for the $tone tone", ({ tone, role }) => {
    render(<Alert tone={tone}>Message</Alert>);
    expect(screen.getByRole(role)).toHaveTextContent("Message");
  });

  it("names the tone in text so colour is not the only signal", () => {
    render(<Alert tone="danger">Upstream failed</Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent(/Error:/);
  });

  it("renders an optional title", () => {
    render(<Alert tone="info" title="Heads up">Body</Alert>);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });
});

describe("Spinner and Skeleton", () => {
  it("gives the spinner accessible text rather than a spinning shape", () => {
    render(<Spinner label="Loading clients" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading clients");
  });

  // A screen-reader user should hear "loading" once from a status message, not
  // a description of grey rectangles.
  it("hides the skeleton from assistive technology", () => {
    const { container } = render(<Skeleton lines={3} />);
    expect(container.querySelector(".bs-skeleton")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".bs-skeleton__line")).toHaveLength(3);
  });

  it("draws at least one line", () => {
    const { container } = render(<Skeleton lines={0} />);
    expect(container.querySelectorAll(".bs-skeleton__line")).toHaveLength(1);
  });
});

describe("Table", () => {
  const rows = [
    { id: "CL-000001", name: "Northwind", count: 3 },
    { id: "CL-000002", name: "Globex", count: 11 },
  ];
  const columns = [
    { key: "name", header: "Name", render: (row: (typeof rows)[number]) => row.name },
    { key: "count", header: "Count", numeric: true, render: (row: (typeof rows)[number]) => row.count },
  ];

  it("renders a caption and column headers", () => {
    render(<Table caption="Clients" columns={columns} rows={rows} />);
    expect(screen.getByRole("table", { name: "Clients" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader")).toHaveLength(2);
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("scope", "col");
  });

  it("shows an empty message rather than an empty body", () => {
    render(<Table caption="Clients" columns={columns} rows={[]} empty="No clients" />);
    expect(screen.getByText("No clients")).toBeInTheDocument();
    expect(screen.queryByText("Northwind")).not.toBeInTheDocument();
  });
});

describe("Breadcrumbs", () => {
  it("marks the last crumb as the current page and does not link it", () => {
    render(<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Clients", href: "/clients" }, { label: "Northwind" }]} />);
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Northwind" })).not.toBeInTheDocument();
    expect(screen.getByText("Northwind")).toHaveAttribute("aria-current", "page");
  });

  // Linking a page to itself gives a keyboard user a stop that does nothing.
  it("does not link a final crumb even when given an href", () => {
    render(<Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Clients", href: "/clients" }]} />);
    expect(screen.queryByRole("link", { name: "Clients" })).not.toBeInTheDocument();
  });
});

describe("Dialog", () => {
  function Harness({ onClose = () => undefined }: { onClose?: () => void }) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open</Button>
        <Dialog
          open={open}
          onClose={() => {
            setOpen(false);
            onClose();
          }}
          title="Confirm"
          footer={<Button>Confirm</Button>}
        >
          <p>Body</p>
        </Dialog>
      </>
    );
  }

  it("is absent until opened and is labelled by its title", async () => {
    render(<Harness />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog", { name: "Confirm" })).toHaveAttribute("aria-modal", "true");
  });

  it("moves focus into the dialog when it opens", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
  });

  // Without this a keyboard user is dropped at the top of the document and has
  // to find their place again.
  it("returns focus to the trigger when it closes", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes from the close control", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  // Focus leaving a modal lands in a page the user cannot see, so they end up
  // typing into something invisible.
  it("traps Tab inside the dialog", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");

    for (let press = 0; press < 6; press++) {
      await userEvent.tab();
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
    for (let press = 0; press < 6; press++) {
      await userEvent.tab({ shift: true });
      expect(dialog).toContainElement(document.activeElement as HTMLElement);
    }
  });
});

describe("Tabs", () => {
  const items = [
    { id: "one", label: "One", content: <p>First panel</p> },
    { id: "two", label: "Two", content: <p>Second panel</p> },
    { id: "three", label: "Three", content: <p>Third panel</p> },
  ];

  it("selects the first tab and hides the other panels", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("First panel")).toBeVisible();
    expect(screen.getByText("Second panel")).not.toBeVisible();
  });

  // Making every tab a tab stop forces a keyboard user through all of them to
  // reach the panel.
  it("keeps only the selected tab in the tab order", () => {
    render(<Tabs items={items} />);
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveAttribute("tabindex", "-1");
  });

  it("moves between tabs with the arrow keys and wraps", async () => {
    render(<Tabs items={items} />);
    screen.getByRole("tab", { name: "One" }).focus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Two" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus();
    await userEvent.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "One" })).toHaveFocus();
    await userEvent.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus();
  });

  it("skips a disabled tab when moving", async () => {
    render(<Tabs items={[items[0], { ...items[1], disabled: true }, items[2]]} />);
    screen.getByRole("tab", { name: "One" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Three" })).toHaveFocus();
  });

  it("reports the selection to a controlling parent", async () => {
    const onChange = vi.fn();
    render(<Tabs items={items} value="one" onChange={onChange} />);
    await userEvent.click(screen.getByRole("tab", { name: "Two" }));
    expect(onChange).toHaveBeenCalledWith("two");
    // Controlled: the selection does not move until the parent says so.
    expect(screen.getByRole("tab", { name: "One" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Dropdown", () => {
  const items = [
    { id: "a", label: "Rerun", onSelect: vi.fn() },
    { id: "b", label: "Cancel", onSelect: vi.fn() },
  ];

  it("reports its state on the trigger", async () => {
    render(<Dropdown label="Actions" items={items} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("opens with ArrowDown on the first item and ArrowUp on the last", async () => {
    render(<Dropdown label="Actions" items={items} />);
    const trigger = screen.getByRole("button", { name: "Actions" });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(screen.getByRole("menuitem", { name: "Rerun" })).toHaveFocus();

    await userEvent.keyboard("{Escape}");
    await userEvent.keyboard("{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Cancel" })).toHaveFocus();
  });

  it("wraps around the menu with the arrow keys", async () => {
    render(<Dropdown label="Actions" items={items} />);
    screen.getByRole("button", { name: "Actions" }).focus();
    await userEvent.keyboard("{ArrowDown}{ArrowUp}");
    expect(screen.getByRole("menuitem", { name: "Cancel" })).toHaveFocus();
  });

  it("runs the action and closes on selection", async () => {
    const onSelect = vi.fn();
    render(<Dropdown label="Actions" items={[{ id: "a", label: "Rerun", onSelect }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Rerun" }));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    render(<Dropdown label="Actions" items={items} />);
    const trigger = screen.getByRole("button", { name: "Actions" });
    await userEvent.click(trigger);
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes when the pointer goes elsewhere", async () => {
    render(
      <>
        <Dropdown label="Actions" items={items} />
        <p data-testid="outside">Elsewhere</p>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await userEvent.click(screen.getByTestId("outside"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});

describe("Pagination", () => {
  it("disables the direction that has no page", () => {
    render(<Pagination hasPrevious={false} hasNext onPrevious={() => undefined} onNext={() => undefined} />);
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("reports the position in a live region", () => {
    render(<Pagination hasPrevious hasNext shown={10} total={42} onPrevious={() => undefined} onNext={() => undefined} />);
    const summary = screen.getByText("10 of 42");
    expect(summary).toHaveAttribute("aria-live", "polite");
  });

  it("calls the handlers", async () => {
    const onPrevious = vi.fn();
    const onNext = vi.fn();
    render(<Pagination hasPrevious hasNext onPrevious={onPrevious} onNext={onNext} />);
    await userEvent.click(screen.getByRole("button", { name: "Previous" }));
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });
});

describe("accessibility", () => {
  it.each([
    { name: "Button", element: <Button>Save</Button> },
    { name: "Card", element: <Card><p>Body</p></Card> },
    { name: "Badge", element: <Badge tone="success">Ready</Badge> },
    { name: "StatusBadge", element: <StatusBadge status="degraded" description="Rate limited" /> },
    { name: "Input", element: <Input label="Name" description="Full legal name" /> },
    { name: "Input with an error", element: <Input label="Name" error="Required" /> },
    { name: "Textarea", element: <Textarea label="Notes" /> },
    { name: "Select", element: <Select label="Source" options={[{ value: "a", label: "A" }]} /> },
    { name: "Alert", element: <Alert tone="danger" title="Failed">Body</Alert> },
    { name: "Spinner", element: <Spinner /> },
    { name: "Skeleton", element: <Skeleton lines={2} /> },
    {
      name: "Table",
      element: (
        <Table
          caption="Clients"
          columns={[{ key: "name", header: "Name", render: (row: { name: string }) => row.name }]}
          rows={[{ id: "1", name: "Northwind" }]}
        />
      ),
    },
    { name: "Breadcrumbs", element: <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Here" }]} /> },
    {
      name: "Tabs",
      element: <Tabs items={[{ id: "a", label: "A", content: <p>A</p> }, { id: "b", label: "B", content: <p>B</p> }]} />,
    },
    {
      name: "Pagination",
      element: <Pagination hasPrevious hasNext shown={5} total={20} onPrevious={() => undefined} onNext={() => undefined} />,
    },
  ])("has no automated violations: $name", async ({ element }) => {
    const { container } = render(element);
    await expectNoAccessibilityViolations(container);
  });

  it("has no automated violations: Dialog", async () => {
    const { container } = render(
      <Dialog open onClose={() => undefined} title="Confirm" footer={<Button>Confirm</Button>}>
        <p>Body</p>
      </Dialog>,
    );
    await expectNoAccessibilityViolations(container);
  });

  it("has no automated violations: Dropdown", async () => {
    const { container } = render(<Dropdown label="Actions" items={[{ id: "a", label: "Rerun", onSelect: () => undefined }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Actions" }));
    await expectNoAccessibilityViolations(container);
  });
});
