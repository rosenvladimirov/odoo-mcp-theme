# odoo-mcp-theme — 19.0

Editorial "paper" theme for the MCP Works platform. OKLCH paper/ink palette + indigo accents, Geist + Instrument Serif + JetBrains Mono fonts, custom snippets and a vertical-timeline language switcher dropdown.

## Branches

| Branch | Odoo version | Module |
|---|---|---|
| `19.0` | 19.0 (Enterprise) | `theme_mcp_works` |

(Future branches: 16.0, 17.0, 18.0, master — port when needed.)

## Module

- **`theme_mcp_works`** — installs as a "Theme/Specialized" app. Activates on a website via Settings → Website → Theme.

## Features

- **Paper palette** (`#f6f0e3` cream) + **ink** text (`#2c2620`) + **indigo accent** (`#4a4eb5`) for links, menus, slider, active states.
- **Fonts**: Instrument Serif (headings), Geist (body), JetBrains Mono (code/labels).
- **Sharp corners**: cards, buttons, badges all flat (no border-radius).
- **12-column grid overlay** behind body (subtle vertical guide).
- **Custom snippets**:
  - `s_mcp_ticker` — scrolling marquee strip.
  - `s_mcp_hero` — hero with terminal mockup.
  - `s_mcp_lang_switcher` (+ demo variant) — connected-dots flag switcher.
- **Mega menu styling**: paper-2 + indigo border + bouncy slide-in `mcp-mega-in` keyframe + 12-col grid overlay inside.
- **Tool Catalog** (`s_table_of_content`): paper cards with offset shadow + accent stripe + icon rotation on hover.
- **Process Steps**: sharp square markers (was Bootstrap rounded circles) — Instrument Serif numerals, indigo border, hover invert.
- **Lang switcher**: vertical timeline dropdown (dimmed page backdrop, transparent panel with light paper wash, dotted indigo line, walking dot slider, bouncy flag hover).
- **Mega-menu mobile-toggle guard** (inline `<head>` JS): patches Odoo's missing `#top_menu_collapse_mobile .top_menu .o_mega_menu_toggle` element to avoid `UncaughtPromiseError`.

## Install

```bash
# Place in your Odoo addons path
cp -r theme_mcp_works /path/to/odoo/addons/

# In Odoo: Apps → Update Apps List → search "Theme MCP Works" → Install
# Then Settings → Website → choose website → Theme tab → activate
```

## License

AGPL-3.0 — see [LICENSE](LICENSE).
