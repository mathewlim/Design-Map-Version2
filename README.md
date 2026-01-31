# Design Map Generator

A browser-based tool for creating lesson design maps, reflection charts, and lesson-plan prompts for technology-enabled lessons.

## What this tool does

- Builds a structured lesson design map from activity inputs.
- Visualizes time distribution across Active Learning Process, Interaction Types, and Key Application of Technology.
- Exports the design map and charts as images for sharing or documentation.
- Generates a ready-to-copy lesson-plan prompt for the Lesson Collaborator (LCC) on AIBots.
- Saves inputs locally in the browser for temporary recovery.

## Core features

### Lesson overview inputs

- Topic, level, student profile, learning outcomes, prerequisite knowledge, and learning issues.
- Level of technology integration (optional): Replacement, Amplification, Transformation.
  - "Optional" will not appear on the generated design map.

### Activity builder

- Add multiple activities with:
  - Interaction Type
  - Active Learning Process
  - Time (minutes)
  - Activity details
  - Key Application of Technology (optional)
  - Tech tool (optional)
- Required fields are clearly marked with `*`.
- Inline character counters to keep entries within the card size:
  - Activity Details: 115 characters max
  - Tech Tool: 25 characters max
- Delete specific activities inline ("Delete Activity").
- Activities are automatically renumbered after deletion.

### Design Map output

- Activities plotted on a social plane (Community, Class, Group, Individual) against time flow.
- Activity cards color-coded by Active Learning Process (consistent with charts).
- Key Application of Technology appears as a vertical tag on each activity card.
- Time appears inline as "Activity X (N min)" at the top of each card.
- Legend for Active Learning Process colors.
- Duration mismatch warning appears if total activity time != planned lesson duration.

### Charts (reflection)

- Pie charts for:
  - Active Learning Process
  - Types of Interaction
  - Key Application of Technology
- Clear labels near the chart center.
- Simple legend without minutes/percent for quick scanning.

### Export

- Download Design Map Image (PNG) — captures the full map, even with many activities.
- Download Charts (PNG) — optimized for clear color rendering.

### Lesson plan prompt generator (LCC)

- A dedicated tab assembles a markdown prompt from all inputs and activities.
- Click "Copy prompt" to paste into the Lesson Collaborator (LCC) on AIBots to generate a complete lesson plan.

### Autosave (temporary)

- Inputs are saved locally in the browser as you type.
- Clearing all data removes the saved draft.

## Suggested workflow

1. Enter lesson overview details.
2. Add activities and fill in required fields.
3. Generate the Design Map.
4. Review reflection charts.
5. Open the Lesson Plan Prompt Generator (using LCC) tab and copy the prompt.
6. Export images for sharing or documentation.

## Tip: Use with a lesson-planning chatbot

After generating the Design Map image, you can upload it to a lesson-planning chatbot (e.g., the Lesson Collaborator on AIBots) to:

- Summarize the lesson flow.
- Suggest refinements for pacing and interaction balance.
- Draft a full lesson plan from the map structure.

This creates a fast feedback loop between design mapping and lesson writing.
