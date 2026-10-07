# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Calm, light "travel journal" identity: warm off-white canvas, white cards, exactly one deep teal accent, system sans-serif, generous spacing and hand-built bars — Linear/Stripe restraint instead of dashboard noise.

## Colors

- `--color-bg`: **#F7F6F3**
- `--color-surface`: **#FFFFFF**
- `--color-surfaceMuted`: **#F2F1EC**
- `--color-fg`: **#1C1B1A**
- `--color-fgSecondary`: **#3A3833**
- `--color-muted`: **#6B6862**
- `--color-border`: **#E3E1DC**
- `--color-borderStrong`: **#D6D3CC**
- `--color-accent`: **#0F766E**
- `--color-accentHover`: **#0B5F59**
- `--color-accentActive`: **#094F4A**
- `--color-accentSoft`: **#E6F2F0**
- `--color-onAccent`: **#FFFFFF**
- `--color-danger`: **#B3261E**
- `--color-dangerHover`: **#93201A**
- `--color-dangerSoft`: **#FDF6F5**
- `--color-focusRing`: **#0F766E**
- `--color-overlay`: **rgba(28, 27, 26, 0.40)**

## Typography

- `font_family`: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji"
- `font_mono`: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace
- `heading_weight`: 600
- `body_weight`: 400
- `weight_medium`: 500
- `numeric_feature`: font-variant-numeric: tabular-nums on all money, time, date and count values
- `size_xs`: 12px
- `size_sm`: 13px
- `size_md`: 14px
- `size_base`: 15px
- `size_lg`: 18px
- `size_xl`: 24px
- `size_2xl`: 32px
- `line_height_body`: 1.5
- `line_height_heading`: 1.25
- `letter_spacing_heading`: -0.01em

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-xs`: 4px
- `--radius-sm`: 6px
- `--radius-md`: 10px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button (primary)

Full-width on mobile, auto width from 480px up. min-height 44px (tap target >=44x44), padding 0 20px, radius md 10px, font 15px/600, bg accent #0F766E, text #FFFFFF (5.5:1 contrast). States — default: bg accent; hover: bg accentHover #0B5F59 + box-shadow 0 1px 2px rgba(16,24,40,.10), transition 120ms ease; active: bg accentActive #094F4A + transform translateY(1px); disabled: bg surfaceMuted #F2F1EC, text #8A867E, cursor not-allowed, aria-disabled=true (never color-only); busy: label becomes 'Saving…', aria-busy=true, same dimensions. Focus-visible on every state: outline 2px solid focusRing, outline-offset 2px — never removed.

### Button (secondary / ghost)

Secondary: min-height 44px, padding 0 16px, radius md, bg surface #FFFFFF, border 1px solid border #E3E1DC, text fgSecondary #3A3833, 15px/500. Hover: bg surfaceMuted #F2F1EC, border-color borderStrong #D6D3CC. Active: bg #EBE9E3. Disabled: text #8A867E, bg surface, cursor not-allowed. Ghost (row actions): min 44x44, padding 0 12px, transparent bg, text fgSecondary; hover bg surfaceMuted radius md; always visible (never opacity:0) and reachable by keyboard. Destructive ghost: text danger #B3261E, hover bg dangerSoft #FDF6F5, same 44px target. Icon-only buttons require aria-label.

### Input (text / date / time / number)

min-height 44px, padding 0 12px, radius md 10px, border 1px solid border #E3E1DC, bg surface #FFFFFF, text fg 15px/400, placeholder #8A867E, width 100%. Date and time fields are real native controls: input type=date / input type=time (never text). Number field for costs: input type=number, min=0, step=0.01, right-aligned tabular-nums. Focus: border-color accent + box-shadow 0 0 0 3px rgba(15,118,110,.20), no outline removal. Invalid: border-color danger #B3261E, bg dangerSoft #FDF6F5, aria-invalid=true, aria-describedby points at the error element. Disabled: bg surfaceMuted, text muted, cursor not-allowed.

### Select (Category, single choice)

Exactly the same box as Input (44px, radius md, border 1px, 15px), plus a 16px chevron icon on the right (aria-hidden, pointer-events none) and padding-right 36px. Options are fixed and text-only: Travel, Accommodation, Food, Activities, Shopping, Other — never a free-text field. Hover: border-color borderStrong. Focus: same accent ring as Input. Invalid/disabled identical to Input.

### FormField (wrapper: label + control + error)

Vertical stack, gap 6px between elements; 16px between fields, 24px between field groups. Label above control: <label for> always present, 13px/600, color fgSecondary #3A3833. Optional hint: 13px/400 muted #6B6862. Error: 13px/500 danger #B3261E with a 14px warning icon (aria-hidden) before the text; appears directly under the field only after the field was touched (blur) or submit was attempted — an untouched form is neutral, no reserved space. Error text uses plain language, e.g. 'Please enter a destination', 'The end date must not be before the start date'. On submit with errors: focus moves to the first invalid field, form is not persisted.

### AppHeader + navigation

Sticky top, height 60px, full-width bar, bg rgba(255,255,255,.92) + backdrop-filter blur(8px), border-bottom 1px solid border. Inner container max-width 1120px, padding 0 16px (360px) / 0 32px (>=900px). Left: product name 'Trip Planner' 16px/600 fg, links to the trip list. Tabs 'Trips | Itinerary | Budget | Packing': each min-height 44px, padding 0 12px, radius md, 15px/500 fgSecondary, gap 4px. Active tab: 15px/600 accent + 2px accent underline 8px below the label + aria-current=page. Hover: bg surfaceMuted. Focus-visible: accent ring. Width <640px: tabs live in one horizontally scrollable row (overflow-x auto, scrollbar hidden, -webkit-overflow-scrolling touch) — the page itself never scrolls horizontally. On trip detail pages a context line shows the trip name + date range (15px muted #6B6862, 16px below the header).

### TripCard (trip list item)

bg surface, radius lg 16px, border 1px solid border, padding 20px, gap 8px inside. Row 1: trip name 18px/600 fg (wraps, no truncation). Row 2: destination 15px/400 fgSecondary with 16px pin icon (aria-hidden). Row 3: date range 14px/400 muted, tabular-nums ('12 May 2025 – 18 May 2025'). Row 4 (24px above): actions 'Rename' and 'Delete' as ghost buttons, min 44px, right-aligned; Delete uses the destructive ghost style. Whole card is a single link target to the itinerary (card + inner action buttons must not nest interactive elements — actions sit outside the link with stopPropagation). Hover: border-color accent + box-shadow 0 2px 8px rgba(16,24,40,.06). Focus-visible: accent ring around the card. List grid: 1 column <900px, 2 columns 900–1199px, 3 columns >=1200px, gap 16px, cards stretch to equal height.

### DaySection (itinerary day)

24px gap between consecutive days. Header row: left 'Mon, 12 May 2025' 16px/600 fg (weekday short + day + month short + year, tabular-nums); right meta '2 activities · €45.00' 13px/400 muted, tabular-nums, item label singular at 1 ('1 activity'). 1px border-bottom 8px below the header. Body: activity rows with 8px gap; every day of the date range is rendered, including days without activities. Empty day: dashed 1px border border #E3E1DC box, radius md, bg surfaceMuted, padding 16px, text 'No activities yet' 15px/400 muted, plus the 'Add activity' secondary button (44px) inside the section — never a hidden or silently dead control.

### ActivityRow

bg surface, radius md 10px, border 1px solid border, padding 12px 16px, min-height 56px, grid: time 56px (15px/600, tabular-nums, 24h 'HH:mm') | title (15px/500 fg) + location below (13px/400 muted, 14px pin icon aria-hidden, omitted when empty) | cost right-aligned (15px/600, tabular-nums, '€12.50') | category badge | actions. Gap 12px. Actions: Edit and Delete ghost icon buttons, each 44x44, aria-labelled. Rows sorted by time ascending; identical times keep insertion order. Hover: border-color borderStrong, bg #FCFCFB. Width <640px: two rows — line 1 time + title + cost, line 2 location + badge + actions; nothing truncates and nothing overflows horizontally.

### CategoryBadge

Inline pill, radius pill, padding 2px 10px, 12px/500, no uppercase transform. All six categories (Travel, Accommodation, Food, Activities, Shopping, Other) share one neutral treatment — bg surfaceMuted #F2F1EC, text fgSecondary #3A3833, border 1px solid border — because the palette has exactly one accent colour; identity comes from the text, not from a sixth hue. Never color-only information: the category name is always written out.

### BudgetBar (hand-built chart)

No chart library — plain DOM + CSS. Above the rows: 'Total' 18px/600 with the trip total right-aligned 18px/600 accent, 16px padding-bottom, 1px border-bottom. Then one row per category that has activities, sorted descending by sum, 16px apart. Row grid (>=640px): label 120px (14px/500 fg, no truncation — use the full category name) | track 1fr | amount 88px right-aligned (14px/600, tabular-nums). Track: height 12px, radius pill, bg #F0EFEA, overflow hidden. Fill: height 100%, radius pill, bg accent #0F766E, width = categorySum / maxCategorySum * 100%, min-width 6px whenever the sum is > 0, transition width 200ms ease. The largest category is therefore always a full-width bar; bars carry title/aria-label '<Category>: €x.xx'. <640px: label and amount on one line above the full-width track. Empty state (no activities at all): no axes, no zero bars — a centred EmptyState with 'No costs yet' and a link to the itinerary.

### PackingItem

Row min-height 44px, padding 8px 0, 1px border-bottom between rows (last row none). Checkbox: custom 20x20, radius xs 4px, border 2px solid borderStrong, bg surface; checked: bg accent, border accent, white 12px check icon (decorative, aria-hidden) — the state is never colour-only. Hit area is the whole label (min 44px high) via <label> wrapping. Text 15px/400 fg; checked text: colour muted #6B6862 + line-through. Delete ghost icon button 44x44 at the end of the row, aria-label 'Delete item'. Keyboard: Space toggles, Enter on delete removes. Hover: bg surfaceMuted radius md. Focus-visible: accent ring on checkbox and delete button.

### PackingProgress

Above the list: text '2 of 6 packed' 14px/500 fgSecondary, tabular-nums, always 'x of y packed' (0 of 0 packed when the list is empty), plus a 6px full-width progress track (radius pill, bg #F0EFEA) with an accent fill of (packed/total)*100%. Single accent colour only; the text is the accessible source of truth (role=status, aria-live=polite on change).

### ConfirmDialog (delete trip / delete activity)

Overlay bg overlay rgba(28,27,26,.40). Panel: bg surface, radius lg 16px, max-width 420px, padding 24px, centred with 16px viewport margin; shadow 0 12px 32px rgba(16,24,40,.18). Title 18px/600, body 15px/400 fgSecondary explaining the consequence ('This deletes the trip and all of its activities and packing items.'). Buttons bottom-right, 12px gap: 'Cancel' secondary (44px), destructive confirm with bg danger #B3261E, text #FFFFFF (6.5:1), hover dangerHover #93201A. role=alertdialog, aria-modal=true, focus trapped and set to Cancel, Esc closes, focus returns to the triggering button, background not scrollable. <480px: buttons stack full-width, primary action last.

### EmptyState

Centred block, max-width 420px, margin 48px auto, padding 40px 24px, dashed 1px border border, radius lg, bg surface, text-align centre. 48px mood icon (decorative, aria-hidden, accentSoft circle with accent glyph) or nothing, title 18px/600 fg (e.g. 'No trips yet'), body 15px/400 muted with the concrete next step, then 24px above a primary Button (44px) — e.g. 'New trip' on the trip list, 'Add an activity' on an empty day, 'No costs yet — add activities to see your budget' on the budget page. Every empty state names the next action; no empty axes, no blank screens.

### NotFoundView

Centred, max-width 480px, 80px from the top, padding 24px. Small '404' marker 13px/600 accent, title 'Page not found' 24px/600 fg, body 15px/400 muted ('The page or trip you are looking for does not exist.'), then 24px above a secondary Button 'Back to trips' 44px that routes to the trip list. Same layout for unknown routes and for non-existent trip ids — never an empty page or a crash.

### SectionHeading

h2, 18px/600 fg, margin 0 0 12px, 24px above when it follows another block, optional right-aligned action ('Add activity', secondary 44px). Used identically on Itinerary, Budget and Packing so the three detail pages read as one product.

## Layout Principles

- Container: max-width 1120px, centred, horizontal padding 16px (360–639px) / 24px (640–899px) / 32px (>=900px); page background bg #F7F6F3, content on white surfaces only. No horizontal scrolling at any width.
- Breakpoints: 480px (buttons/forms go full width to auto), 640px (single-row tables become two-row, budget label moves above the bar), 900px (trip list 2 columns, header padding 32px), 1200px (trip list 3 columns). Narrow-first: <=640px everything is a single column, tap targets >=44x44 everywhere.
- Trip list grid: repeat(auto-fill, minmax(280px, 1fr)) with gap 16px, equal-height cards; 900px+ from 2 columns, 1200px+ 3 columns. Itinerary, Budget and Packing are single-column content with max-width 760px for comfortable reading.
- Vertical rhythm: 24px between page sections, 32px between major blocks, 48px page top padding (24px on mobile), 12px between a heading and its content, 8px between list rows. Density stays low — generous whitespace is part of the identity.
- ONE format for every value the product shows, everywhere (itinerary, budget, packing, cards, dialogs): single date = 'Mon, 12 May 2025' (weekday short, comma, day, month short, year); date range = '12 May 2025 – 18 May 2025' (en dash, spaces); time = 24-hour 'HH:mm' (e.g. '14:30'); duration = '8 days' / '1 day'; money = Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR' }) → '€1,234.56', zero shown as '€0.00', never a raw number; counts = '2 activities' / '1 activity'; progress = '2 of 6 packed'. All of these use font-variant-numeric: tabular-nums and the same 13–18px scale. No second date or money format anywhere in the app.
- Language and tone: all user-visible text is English, sentence case, plain and concrete ('Please enter a destination'), no exclamation marks, no technical jargon; buttons are short imperative verbs ('New trip', 'Save trip', 'Add activity', 'Delete').
- Colour discipline: exactly one accent (#0F766E) for primary actions, the active nav tab, bars and focus; neutrals for everything else; danger red #B3261E only for destructive actions and error messages. Light theme only — no dark mode, no theme switcher (out of scope).
- Consistency: every page uses the same AppHeader, SectionHeading, FormField, EmptyState and Button styles; a control that does nothing is either visibly disabled or labelled 'coming soon' — no silently dead controls (AC-20).
- Accessibility: every field has a <label>, errors are linked via aria-describedby and use aria-invalid, icons that carry meaning have accessible names (decorative ones aria-hidden), focus-visible rings (2px accent, 2px offset) on all interactive elements, text contrast >=4.5:1 (fg 17:1, muted 5.6:1 on white; white on accent 5.5:1; white on danger 6.5:1), never colour as the only signal.
