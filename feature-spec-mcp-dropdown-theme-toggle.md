# Feature Spec: Docs "Open in AI Tool" Dropdown + Dark/Light Mode Toggle

## Context

Add two UI features to the docs site, modeled after the pattern used on
`docs.privy.io`:

1. An **"Open in Claude" style dropdown** on every docs page that lets a user
   or an external AI coding tool pull the current page (and the wider docs
   set) in directly, via MCP.
2. A **dark/light mode toggle** in the top nav bar.

---

## 1. Docs Assistant Dropdown

### Location
Top-right of the page header/title block on every rendered docs page
(same row as the H1, right-aligned). Also acceptable: fixed in the top nav
next to Search.

### Trigger button
- Label: `Open in Claude` (icon + label + chevron)
- Clicking toggles an open dropdown menu (click-away closes it)

### Menu items (in this order)

| Item | Icon | Behavior |
|---|---|---|
| **Open in Claude** | sparkle | Opens `claude.ai` in a new tab with a prefilled prompt referencing the current page's MCP resource URL, so Claude can fetch and answer questions about it |
| **Open in ChatGPT** | logo | Same, but for ChatGPT |
| **Connect to Cursor** | logo | Deep-links to Cursor's "Add MCP Server" flow, prefilled with our MCP server URL |
| **Connect to VS Code** | logo | Deep-links to VS Code's "Add MCP Server" flow, prefilled with our MCP server URL |
| **Copy MCP Server** | clipboard | Copies our MCP server URL to the clipboard |
| **Copy page** | copy | Copies the current page's content as raw Markdown to the clipboard |
| **View as Markdown** | markdown icon | Opens `<page-url>.md` (or `?format=md`) in a new tab, plain text |

### Requirements

- **Every docs page must have a raw Markdown counterpart.** If pages are
  built from MDX/Markdown source, expose the raw source at a predictable
  URL, e.g. `/basics/get-started/about.md` or via a `?format=md` query
  param. This powers both "Copy page" and "View as Markdown."
- **MCP server exposing the `/docs` folder.** Stand up an MCP server (can
  be a lightweight Node/Python service) that:
  - Serves the docs folder as browsable/searchable MCP resources (one
    resource per page, or a `search_docs` + `get_page` tool pair).
  - Is reachable at a stable public URL, e.g. `https://mcp.<ourdomain>.com`.
  - Requires no auth for read-only access to public docs pages.
- **"Copy MCP Server" copies this MCP server's URL**, not a per-page URL.
- **"Connect to Cursor" / "Connect to VS Code"** should use each tool's
  documented URL scheme / deep link for registering an MCP server (check
  current Cursor and VS Code docs for the exact deep-link format, as these
  change — don't hardcode based on memory).
- **"Open in Claude" / "Open in ChatGPT"** should open a new tab with a
  short prefilled prompt like: `Here's a doc page: <mcp-resource-or-page-url>. I have questions about it.`
- Dropdown should close on `Escape` and on outside click.
- Fully keyboard-navigable (arrow keys between items, `Enter` to select).

### Acceptance criteria
- [ ] Dropdown renders on all docs pages, not just the homepage.
- [ ] MCP server is live and returns docs content for at least a `search`
      and a `get_page` tool.
- [ ] Every page has a working `.md` raw endpoint.
- [ ] "Copy page" and "Copy MCP Server" both use the Clipboard API with a
      toast/confirmation on success.
- [ ] All menu links open in a new tab (`target="_blank" rel="noopener"`).

---

## 2. Dark / Light Mode Toggle

### Location
Top nav bar, far right (next to Support/Dashboard links), rendered as a
sun/moon icon button.

### Behavior
- Clicking toggles between `light` and `dark` themes.
- On first load (no stored preference), default to the user's OS
  preference via `prefers-color-scheme`.
- Persist the user's explicit choice (e.g. `localStorage`) so it survives
  reloads and overrides OS preference once set.
- Apply the theme by toggling a class (e.g. `class="dark"` on `<html>`)
  and driving all colors through CSS variables — no hardcoded hex colors
  in components.
- Transition should be instant or a fast fade (~150ms), no layout shift.

### Requirements
- Define a CSS variable palette for both themes (background, text,
  border, accent, code-block background, etc.) in a single theme file.
- Icon swaps between sun (light mode active → click for dark) and moon
  (dark mode active → click for light).
- No flash of incorrect theme on page load (set the theme class before
  first paint, e.g. via an inline script in `<head>`).

### Acceptance criteria
- [ ] Toggle is visible and functional on every page.
- [ ] Preference persists across reloads and new tabs.
- [ ] No flash-of-unstyled-theme on initial load.
- [ ] All existing components render correctly in both themes (spot-check
      code blocks, tables, callouts/admonitions).

---

## Suggested File/Folder Additions

```
/mcp-server/            # MCP server exposing /docs
  index.ts
  tools/search.ts
  tools/get_page.ts
/components/
  DocsAssistantDropdown.tsx
  ThemeToggle.tsx
/lib/
  theme.ts              # theme init + persistence logic
  docs-markdown.ts       # helper to serve raw .md for a given page
/styles/
  theme-tokens.css       # CSS variables for light/dark
```

## Out of Scope
- Auth-gated docs pages (assume all docs are public for MCP access).
- Analytics/telemetry on dropdown usage (can be a follow-up).
