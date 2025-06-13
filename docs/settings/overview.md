# Settings and Preferences

## Feature Purpose and Scope

Manage user preferences for the Ollama web interface including chat behaviour and storage paths.

## Core Flows and UI Touchpoints

- The **Settings** page at `/settings` exposes form inputs for vector storage and model options.
- The **ChatSettings** button in the chat header toggles advanced chat parameters such as temperature.

## Primary Types/Interfaces

- `Settings` – global preferences stored in `useSettingsStore`.
- `ChatSettings` – chat-specific parameters imported from `/types/settings`.

## Key Dependencies and Related Modules

- Zustand for state management in `settings-store.ts`.
- UI components in `components/ui` for form controls.
