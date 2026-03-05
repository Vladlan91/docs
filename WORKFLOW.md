# Documentation Workflow

## Process

1. **Plan** — Claude analyzes internal docs and proposes structure in Ukrainian
2. **Approve** — User reviews, adjusts, confirms
3. **Write** — Claude writes content in English using Mintlify components
4. **Review** — User reviews the result
5. **Commit** — Claude commits approved changes

## Language

- All documentation content: **English**
- Plans and discussions: **Ukrainian**

## Mintlify Components Usage

### Navigation & Layout
- `<CardGroup cols={2|3}>` + `<Card>` — navigation blocks, feature grids
- `<Tabs>` + `<Tab>` — tabbed content sections
- `<AccordionGroup>` + `<Accordion>` — collapsible FAQ / details
- `<Steps>` + `<Step>` — sequential instructions

### Media & Embeds
- `<Frame caption="...">` — image wrapper with caption (for screenshots)
- `<img>` inside `<Frame>` — actual screenshot images
- `<video>` — embedded video demos

### Callouts
- `<Note>` — important information
- `<Tip>` — helpful hints
- `<Warning>` — caution notices
- `<Info>` — supplementary context

### Code
- Triple backtick blocks with language tag (```html, ```javascript, ```bash)
- `<CodeGroup>` — multiple code variants side by side

### Other
- `<Icon icon="name" />` — inline icons (FontAwesome)
- `<Tooltip tip="...">` — hover tooltips
- Tables — standard markdown tables

## Screenshots

- Store in `/images/` directory
- Use `<Frame>` wrapper with descriptive caption
- Naming: `{section}-{description}.png` (e.g., `agents-workflow-editor.png`)
- Placeholder format when screenshot not yet available:

```mdx
<Frame caption="Agent workflow editor">
  <img src="/images/agents-workflow-editor.png" alt="Agent workflow editor" />
</Frame>
```

## File Structure

```
docs-public/
├── docs.json              # Mintlify config (navigation, theme)
├── introduction.mdx       # Platform overview
├── quickstart.mdx         # Getting started guide
├── concepts.mdx           # Key terminology
├── agents/                # AI Agents section
├── conversations/         # Conversations section
├── integrations/          # Integrations section
├── widget/                # Widget & Tracker section
├── billing/               # Billing section
├── api-reference/         # API docs
├── images/                # Screenshots and diagrams
└── logo/                  # Logo assets
```
