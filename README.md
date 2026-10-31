# Design Map Generator

Browser-based lesson-design tool for building a Design Map, reflection charts, an LCC lesson-plan prompt, and an editable Lesson Observation Form.

Created by Mathew Lim. Updated on 31 October 2026. Inspired by and adapted from ETD's original Design Map Generator and Gabriel Cheow's prototypes.

## Current page order

1. Input
2. Markdown Input (with AI chatbot assistance)
3. Design Map
4. Charts
5. Lesson Plan Prompt Generator (using LCC)
6. Lesson Observation Form
7. How to use

## What the app does

- Collects lesson overview details and activity-by-activity lesson flow.
- Builds a visual Design Map across Community, Class, Group, and Individual interaction types.
- Generates reflection charts for:
  - Active Learning Process
  - Types of Interaction
  - Key Application of Technology
- Generates a prompt for the Lesson Collaborator Chatbot (LCC).
- Builds an editable Lesson Observation Form inside the app and exports it as `.docx`.
- Autosaves draft inputs locally in the browser.
- Keeps up to 5 named, time-stamped Saved Versions that can be loaded or deleted at any time.
- Shows visible success, validation and error messages for lesson actions.

## Main features

### 1. Input

- A compact one-line **Saved Versions** bar sits at the top of the page (see [Saving and reopening work](#saving-and-reopening-work)).
- Enter:
  - Topic
  - Level
  - Student profile
  - Duration
  - Learning outcomes
  - Prerequisite knowledge
  - Learning issue to be addressed
  - Level of technology integration
- Add multiple activities in sequence.
- Each activity supports:
  - Interaction Type
  - Active Learning Process
  - Time (mins)
  - Activity Details
  - Key Application of Technology
  - Tech Tool
- Required fields are marked with `*`.
- Helper text is shown for harder fields such as:
  - Active Learning Process
  - Key Application of Technology
- Character counters are included for:
  - Activity Details: 115 characters
  - Tech Tool: 25 characters
- Activities can be deleted inline and are renumbered automatically.
- The main action is `Generate Design Map`.

### 2. Markdown Input (with AI chatbot assistance)

- Supports AI-assisted lesson entry using markdown.
- The page heading explicitly references AI chatbot assistance, with examples such as:
  - Pair
  - ChatGPT
  - Claude
  - Gemini
- `Paste Sample Format` inserts the required markdown template.
- `Apply Markdown` parses the markdown and fills the lesson overview and activity inputs automatically.
- `Copy Prompt` copies the sample markdown prompt for use with an AI chatbot.
- Markdown uses the template's field names and dropdown values. Bold field labels, bullet prefixes and surrounding code fences are accepted.
- Standard Markdown line breaks (a trailing backslash or two spaces) are accepted after field values.
- Imports are checked before replacing the current lesson. Unrecognised or incomplete activities, overlong details/tools, and invalid activity times are rejected with an error; the current lesson is kept.
- Duration and activity times accept non-negative decimal minutes. Blank times stay unspecified; generating or saving does not add time to them. Invalid imported duration is rejected before replacing the lesson.

### 3. Design Map

- Generates the lesson flow visually after the required activity fields are completed.
- Maps activities across the social plane:
  - Community
  - Class
  - Group
  - Individual
- Shows activity timing inline in each activity card.
- Uses Active Learning Process color coding.
- Shows Key Application of Technology on the activity card when provided.
- Displays a warning if total activity time does not match the planned lesson duration.
- Supports editing from the output page:
  - click an activity card to edit it
  - add an activity from the output editor
  - delete an activity from the output editor
  - drag a card vertically to change its interaction row
- Clicking a card opens its current fields in the editor. Typing in this editor does not change Input, the map, prompts, charts or autosave.

#### Applying changes from the Design Map editor

| Action | Result |
| --- | --- |
| `Confirm Changes to Existing Activity` | Updates the selected activity with the entered fields. Its activity number stays the same. |
| `Add as New Activity` | Creates one separate activity immediately after the selected activity, using the entered fields. The original activity is kept and later activities are renumbered. |
| `Close` or Escape | Discards unconfirmed field edits and closes the editor. |
| Select another card or leave the Design Map page | Discards unconfirmed field edits. |
| `Delete Activity` | Removes the selected existing activity and renumbers the remaining activities. |

Both confirmation and addition require:

- Interaction Type
- Active Learning Process
- Activity Details containing more than whitespace, within 115 characters

Time is optional and must be a non-negative number when entered. Tech Tool is optional and must stay within 25 characters. An invalid action is rejected immediately, the relevant fields are highlighted, and the entered editor values are kept for correction. No activity is added, changed or autosaved by a rejected action.

Successful confirmation or addition updates both Input and the Design Map and autosaves the resulting lesson. `Add as New Activity` uses the values already in the editor; there is no second blank-activity step.

#### Map interaction and layout

- Dragging a card or confirming changes in the side editor updates the map in place. The entrance animation is not replayed, so the map doesn't blink, and the sideways scroll position is kept.
- Dragging a card between rows immediately changes its Interaction Type and autosaves it.
- Crowded maps scroll horizontally on laptops, including maps with six or fewer activities. Cards keep a readable minimum width.
- Keyboard users can focus a card and press Enter or Space to edit it. Escape closes the editor and returns focus to the card. The editor stays open while required fields are temporarily empty.
- Includes empty-state guidance when no map has been generated yet.

### 4. Charts

- Shows three reflection charts based on completed activities:
  - Active Learning Process
  - Types of Interaction
  - Key Application of Technology
- Updates from the current lesson data.
- Includes an empty state with a direct call to return to Input if no data is ready yet.
- Numeric legends keep small slices readable. Technology-application percentages cover only activities with a selected application. Charts with no allocated time use a neutral empty circle.
- Supports chart download as an image.

### 5. Lesson Plan Prompt Generator (using LCC)

- Generates a ready-to-copy prompt from the lesson data already entered in the app.
- The app uses the term:
  - Lesson Collaborator Chatbot (LCC)
- Users are directed to paste the prompt into the Lesson Collaborator Chatbot (LCC) on AIBots:
  - `https://go.gov.sg/lcc-aibots`
- The top tab and page heading both use:
  - `Lesson Plan Prompt Generator (using LCC)`

### 6. Lesson Observation Form

- Builds a lesson observation layout from the current lesson inputs and completed activities.
- Uses a two-column table layout:
  - left column: planned lesson activity details
  - right column: lesson observation box
- The form is editable inside the app before export.
- Users can revise:
  - form title
  - subtitle
  - topic, level, duration, student profile, technology integration
  - learning outcomes, prerequisite knowledge, learning issue
  - activity titles and activity details
  - interaction, active learning process, key application of technology, tech tool
  - observation notes
- Observation boxes do not include guide lines.
- `Refresh From Lesson Inputs` can regenerate the form from current lesson data.
- Supports `.docx` download.

### 7. How to use

- Includes a dedicated `How to use` page at the end of the app.
- Focuses on how to use each page in app order.
- The numbered guide has 7 short steps. Step 2, `Saving your work`, comes straight after `Input` and briefly covers autosave, Saved Versions and local-storage deletion.
- Avoids duplicated sections such as:
  - recommended workflow
  - downloads
  - best results
  - what each page does

## Saving and reopening work

### Autosave

- Every change on the Input page is saved automatically to the browser's `localStorage` (key `design-map-state-v1`).
- A small `Saved` note appears beside the action buttons after each save.
- On Input, adding a blank activity is autosaved too. If browser storage is full or blocked, the note shows `Not saved` and the page continues updating its prompt and validation messages.
- In the Design Map editor, field edits stay unconfirmed until `Confirm Changes to Existing Activity` or `Add as New Activity` is clicked. Unconfirmed edits are excluded from autosave and Saved Versions.
- The draft is restored when the page is reopened in the same browser.
- `Clear All` empties the current inputs but keeps the Saved Versions.

### Saved Versions (up to 5)

- `Save Current Version` stores a snapshot of the lesson overview, all activities and the Lesson Observation Form.
- Each version is named after the **Topic** (or "Untitled design map" if Topic is empty) and stamped with the date and time, e.g. `Saved 31 Oct 2026, 14:32`.
- The bar is one line at the top of the Input page: `Saved Versions (n / 5)`, a dropdown, `Load`, `Delete` and `Save Current Version`.
- The dropdown lists every saved version, newest first, as `Topic — date, time`. The newest save is selected automatically.
- `Load` restores the selected version into the Input page after a confirmation prompt. The user stays on the Input page, and the Design Map, Charts, LCC prompt and Observation Form update in the background.
- `Delete` removes the selected version after a confirmation prompt.
- When there are no saved versions, the dropdown, `Load` and `Delete` are greyed out.
- At most 5 versions can be kept. When all 5 are used, saving is blocked: the button shows `Limit reached`, and a slim tip under the bar asks the user to delete a version first.
- Versions are stored in `localStorage` under the key `design-map-saved-versions-v1`.
- Rapid saves receive distinct IDs. Malformed stored entries cannot crash startup, and an invalid lesson snapshot is rejected before any current input is replaced.

### Limits

- Saved data stays in one browser on one device. It does not sync to other browsers or computers.
- Clearing the browser cache or site data, or using a private/incognito window, permanently removes it.
- The app warns users about this in four places:
  - an always-visible note under the Saved Versions bar
  - an in-app tooltip on `Save Current Version`
  - an in-app tooltip on `Load`
  - the `Saved` confirmation message

## Click feedback

Lesson actions provide feedback through button states and message cards:

- **Button state.** The clicked button changes for about 2.5 seconds:
  - green with a tick for success (`Copied`, `Saved`, `Loaded`, `Applied`, `Pasted`, `Refreshed`, `Downloaded`, `Activity added`)
  - orange for a warning (`Limit reached`, `Nothing to apply`)
  - red for an error (`Copy failed`, `Not saved`, `Download failed`)
- **Message card.** A card with an icon, a title, a short message, a countdown bar and a close (×) button appears:
  - just below the clicked button, with a pointer to it, when that button is on screen
  - in the bottom-right corner when the button is no longer visible, e.g. after `Generate Design Map` or `Apply Markdown` switches tabs
- Success messages close after about 3 seconds. Warnings and errors stay for about 5 seconds.
- **No browser pop-ups.** The app never uses the browser's own `alert()` or `confirm()` boxes:
  - Actions that need a yes/no (`Clear All`, `Load`, `Delete`, `Refresh From Lesson Inputs`) open an in-app dialog with `Cancel` and a confirm button. Destructive actions use a red confirm button.
  - `Esc` or clicking outside the dialog cancels it.
  - Validation and error notices (e.g. "fill in at least one activity", "unable to download") appear as the in-app message cards described above.
  - Hover hints use an in-app tooltip (any element with `data-tooltip`) instead of the browser's `title` tooltip. Examples: the PPTX download limit, the compulsory-field `*` marks, the Saved Versions label.
  - As a safety net, `window.alert` is redirected to an in-app "Notice" message, so a bundled library cannot open a browser alert either.
- All pop-ups share one look: white cards, or dark cards for tooltips, with hairline borders, soft shadows, the same icons, and the same green, orange and red colours.
- Both copy buttons report whether the copy worked, in the same standard way: `Copy Prompt` on the Markdown page and `Copy prompt` on the LCC page.
- The Design Map editor shows `Changes confirmed` or `Activity added` after a successful action. Invalid confirmation or addition shows `Not changed` or `Not added`, plus field-level validation guidance. Closing the editor discards unconfirmed edits.

## Visual design

### Header and app icon

- The title **Design Map Generator** uses the device's system display font, following Apple's design approach:
  - SF Pro on Apple devices
  - Segoe UI Variable on Windows
  - Helvetica or Arial elsewhere
- No font file is downloaded, so the title always renders crisply.
- The title is a two-weight wordmark: **Design Map** in semibold white, and "Generator" in a lighter weight at about 70% white. Letter spacing is slightly tight.
- Beside the title is an app-icon style SVG that is a miniature of an actual Design Map:
  - a white sheet with rounded corners
  - the grey Social Plane label column with four rows (Community, Class, Group, Individual)
  - black axes along the left and bottom
  - three activity boxes stepping up from Individual to Group to Class, in the Activate, Promote and Monitor colours
  - each box shows a dark Key Application strip on its right edge and faint lines for its title, details and tool text
  - elbow arrows link each activity to the next
- The icon scales with the title, so the two stay in proportion on any screen size.
- The browser tab icon (favicon) uses the same mini map, embedded in `index.html`. The text lines are left out because they would be too small at tab size.

### Colours, borders and shadows

- Colour palette: primary `#0b4f6c`, secondary `#3a86ff`, the per-tab accent colours, and the Active Learning Process colours (Activate `#6aced8`, Promote `#cc6bff`, Facilitate `#ffc000`, Monitor `#f6bbbf`).
- Borders, corner radii and shadows are defined once as CSS variables in `style.css` (`--border-subtle`, `--border-strong`, `--radius-*`, `--shadow-xs` to `--shadow-lg`, `--ring`), so the whole app stays consistent.
- Cards and inputs use 1px hairline borders and soft layered shadows.
- The active tab shows a 3px underline in that tab's accent colour.
- Activity cards and the Saved Versions bar have a coloured left edge.
- Purple activity cards use dark text for readable contrast.
- Buttons and form fields show a visible focus ring for keyboard users.
- Activity fields have associated labels. Tabs expose their selected page to screen readers and support Left/Right, Home and End keys.
- Animations are reduced automatically when the operating system's "reduce motion" setting is on.

## Export options

- Design Map Image
- Design Map (Editable PPTX)
- Charts
- Lesson Observation Form (`.docx`)

## Technical notes

- Runs fully in the browser.
- Draft data is autosaved in local browser storage.
- Up to 5 Saved Versions are kept separately in local browser storage.
- `Clear All` removes the autosaved draft only. Saved Versions are kept.
- The app uses local bundled files:
  - `html2canvas.min.js`
  - `pptxgen.bundle.js`
  - `script.js`
- The Lesson Observation Form `.docx` export is generated client-side.
- No external CDN is required for the `.docx` export path.
- `JSZip` is accessed from the local `pptxgen.bundle.js` bundle rather than from an external CDN.
- Fonts are never downloaded.
  - `css2.css` declares Karla, DM Serif Display and DM Mono as local-only fonts. They are used only if they are installed on the device; otherwise the browser falls back to a similar font.
  - The main title always uses the system display font (see [Header and app icon](#header-and-app-icon)).

## File overview

- `index.html`: page structure, header title and mini Design Map icon, browser-tab icon, tab layout, help content, export controls
- `css2.css`: local-only font declarations (Karla, DM Serif Display, DM Mono)
- `style.css`: UI styling, design tokens (borders, radii, shadows), typography including the header title, layout, chart and observation-form presentation, the Saved Versions bar, and all in-app pop-ups (message cards, confirm dialog, tooltips)
- `design.css`: Design Map grid, activity cards and legend table
- `script.js`: state management, autosave and Saved Versions, click feedback, in-app confirm dialog and tooltips, markdown parsing, Design Map rendering, charts, LCC prompt generation, Lesson Observation Form generation, and export logic
- `pptxgen.bundle.js`: local bundle used for PPTX export and bundled `JSZip`
- `html2canvas.min.js`: local image capture library used for PNG export
- `tests/app.test.cjs`: isolated regression tests for imports, editor actions, saving, charts and exports
- `tests/fixtures/wwii-lesson.md`: eight-activity Markdown example with trailing-backslash line breaks used for regression testing
- `package.json` and `package-lock.json`: development-only test dependencies and commands; normal app use requires no npm installation

## Usage summary

1. Enter lesson details in `Input`, or use `Markdown Input` to populate them.
2. Click `Save Current Version` whenever you want to keep a copy (up to 5, stored in this browser only).
3. Add activities and click `Generate Design Map`.
4. Review the `Design Map`. Drag cards between rows or click a card to edit it.
   Choose `Confirm Changes to Existing Activity` to update that activity, or `Add as New Activity` to create a separate activity from the entered fields. Close discards unconfirmed edits.
5. Review or download the `Charts`.
6. Copy the prompt from `Lesson Plan Prompt Generator (using LCC)` and paste it into the Lesson Collaborator Chatbot (LCC) on AIBots.
7. Edit and download the `Lesson Observation Form` as `.docx`.

## Development checks

The app still opens directly from `index.html`; no installation is required for normal use.

To run the regression checks, install Node.js 24 or later and run:

```sh
npm ci
npm test
npm run check
```

The tests run against isolated DOMs and storage. They cover imports (including the eight-activity WWII lesson and common AI formatting), blank and decimal times, draft restoration, saved versions, malformed storage, confirmation dialogs, keyboard access, text escaping, prompts, chart calculations and export handlers.

Design Map editor checks verify that typing leaves the lesson unchanged, confirmation updates only the selected activity, adding as new keeps the original, missing compulsory fields reject both actions, and closing discards unconfirmed edits. They also cover renumbering, repeated clicks and cancelled drags.

DOCX and editable PPTX archives are generated with the actual bundled libraries and their XML is checked, including pasted control characters in DOCX notes. Exported connector geometry and map connector updates after resizing are checked separately.

DOM tests do not verify browser layout or rasterised PNG appearance. Image export tests substitute the capture boundary and check download, cleanup and error handling; visual browser checks are still needed for those details.
