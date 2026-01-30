# Design Map Generator

A browser-based tool for creating lesson design maps and reflection charts for technology‑enabled lessons.

## What this tool does

- Builds a structured lesson design map from activity inputs.
- Visualizes time distribution across Active Learning Process, Interaction Types, and Key Application of Technology.
- Exports the design map and charts as images for sharing or documentation.
- Saves inputs locally in the browser for temporary recovery.

## Core features

### Lesson overview inputs

- Topic, level, student profile, learning outcomes, prerequisite knowledge, and learning issues.
- Level of technology integration (optional): Replacement, Amplification, Transformation.
  - “Optional” will not appear on the generated design map.

### Activity builder

- Add multiple activities with:
  - Interaction Type
  - Active Learning Process
  - Time (minutes)
  - Activity details
  - Key Application of Technology (optional)
  - Tech tool (optional)
- Required fields are clearly marked with `*`.
- Delete specific activities inline.
- Activities are automatically renumbered after deletion.

### Design Map output

- Activities plotted on a social plane (Community, Class, Group, Individual) against time flow.
- Activity cards color‑coded by Active Learning Process (consistent with charts).
- Key Application of Technology appears as a vertical tag on each activity card.
- Time badges appear on each activity.
- Legend for Active Learning Process colors.
- Duration mismatch warning appears if total activity time ≠ planned lesson duration.

### Charts (reflection)

- Pie charts for:
  - Active Learning Process
  - Types of Interaction
  - Key Application of Technology
- Clear labels near the chart center.
- Simple legend without minutes/percent for quick scanning.

### Export

- Download Design Map Image (PNG) — captures the full map, even with many activities.
- Download Charts (JPG) — optimized for clear color rendering.

### Autosave (temporary)

- Inputs are saved locally in the browser as you type.
- Clearing all data removes the saved draft.

## Suggested workflow

1. Enter lesson overview details.
2. Add activities and fill in required fields.
3. Generate the Design Map.
4. Review reflection charts.
5. Export images for sharing or documentation.

## Tip: Use with a lesson‑planning chatbot

After generating the Design Map image, you can upload it to a lesson‑planning chatbot (e.g., a **Lesson Collaborator Chatbot**) to:

- Summarize the lesson flow.
- Suggest refinements for pacing and interaction balance.
- Draft a full lesson plan from the map structure.

This creates a fast feedback loop between design mapping and lesson writing.

