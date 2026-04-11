# Design Map Generator

Browser-based lesson-design tool for building a Design Map, reflection charts, an LCC lesson-plan prompt, and an editable Lesson Observation Form.

Created by Mathew Lim. Updated on 11 April 2026. Inspired by and Adapted from ETD's original Design Map Generrator and Gabriel Chua's protoypes.

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
- Saves draft inputs locally in the browser.

## Main features

### 1. Input

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
- Markdown is only captured if the field names and format match the expected template exactly.

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
- Includes empty-state guidance when no map has been generated yet.

### 4. Charts

- Shows three reflection charts based on completed activities:
  - Active Learning Process
  - Types of Interaction
  - Key Application of Technology
- Updates from the current lesson data.
- Includes an empty state with a direct call to return to Input if no data is ready yet.
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
- Avoids duplicated sections such as:
  - recommended workflow
  - downloads
  - best results
  - what each page does

## Export options

- Design Map Image
- Design Map (Editable PPTX)
- Charts
- Lesson Observation Form (`.docx`)

## Technical notes

- Runs fully in the browser.
- Draft data is saved temporarily in local browser storage.
- `Clear All` removes the saved draft.
- The app uses local bundled files:
  - `html2canvas.min.js`
  - `pptxgen.bundle.js`
  - `script.js`
- The Lesson Observation Form `.docx` export is generated client-side.
- No external CDN is required for the `.docx` export path.
- `JSZip` is accessed from the local `pptxgen.bundle.js` bundle rather than from an external CDN.

## File overview

- `index.html`: page structure, tab layout, help content, export controls
- `style.css`: UI styling, typography, layout, chart and observation-form presentation
- `script.js`: state management, markdown parsing, Design Map rendering, charts, LCC prompt generation, Lesson Observation Form generation, and export logic
- `pptxgen.bundle.js`: local bundle used for PPTX export and bundled `JSZip`
- `html2canvas.min.js`: local image capture library used for PNG export

## Usage summary

1. Enter lesson details in `Input`, or use `Markdown Input` to populate them.
2. Add activities and click `Generate Design Map`.
3. Review the `Design Map`.
4. Review or download the `Charts`.
5. Copy the prompt from `Lesson Plan Prompt Generator (using LCC)` and paste it into the Lesson Collaborator Chatbot (LCC) on AIBots.
6. Edit and download the `Lesson Observation Form` as `.docx`.

