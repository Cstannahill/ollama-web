# AGENTS.md

## Purpose

This file defines mandatory protocols for all agents (AI or human) contributing to this repository. It ensures strict compliance with the architectural plan, coding standards, and review procedures.  
**All agents must fully read and adhere to these guidelines before contributing code or documentation.**

---

## Source of Truth

- **`ollama-design.md` is READ-ONLY:**
  - Treat `ollama-design.md` as an immutable architectural reference.
  - **Never edit or suggest changes to this file.**
  - All implementation decisions, naming, features, and technical choices must strictly follow what is defined there.
  - If clarification is needed, raise a discussion with maintainers—do not make assumptions or edits.

---

## Feature Documentation Standards

- **Directory Structure:**  
  - Every major feature must have its own directory under `/docs` (e.g., `docs/chat`, `docs/model`, etc.).
- **Overview File:**  
  - Each feature directory must include an `overview.md` file summarizing:
    - **Feature purpose and scope**
    - **Core flows and UI touchpoints**
    - **Primary types/interfaces (with references to the relevant `/types` files)**
    - **Key dependencies and related modules**
- **Architecture & Visuals:**  
  - Include **detailed architectural sketches, diagrams, and type maps** for the feature within its documentation directory.
  - Visuals should cover both high-level flow (e.g., sequence, data, or interaction diagrams) and detailed type/interface relationships.
  - Diagrams must be updated as the architecture evolves.
- **Cross-Linking:**
  - Reference all relevant types (from `/types`) and routes/components (from code) so new contributors can easily map the documentation to the implementation.
  - For guidance on system prompts that generate advanced markdown (callouts, multi-tab code blocks, diagrams), see [docs/markdown/prompt-guidelines.md](docs/markdown/prompt-guidelines.md).
- **Documentation Is Continuous:**
  - Documentation must be updated as features are built, not after.
  - PRs for major features must include documentation updates.

---

## Component Architecture & Structure

- **Isolated/Standalone Components:**  
  - **All UI logic, views, and reusable behaviors must be built as isolated, standalone components wherever possible.**
  - Avoid monolithic components or tightly coupled logic.  
  - Prefer pure, stateless, and prop-driven components unless local state is required.
- **Page Files are Orchestrators:**  
  - Page files (e.g., in `app/`) should act primarily as *orchestrators*—they should import and compose components, not contain substantial UI or business logic directly.
  - Pages must remain as lean as possible.
- **Component Decomposition:**  
  - **Large components must be broken down into smaller, logical, manageable subcomponents.**
  - These subcomponents must be grouped under a dedicated directory within `components/` that reflects the parent feature or domain.
    - _Example:_  
      ```
      components/
      └─ chat/
         ├─ ChatInterface.tsx
         ├─ ChatMessage.tsx
         ├─ ChatInput.tsx
         ├─ ChatHeader.tsx
         └─ index.ts // Barrel file for chat components
      ```
    - **Every feature/component group must have its own subdirectory.**
    - Use an `index.ts` barrel file within each group for clean imports.
  - **Composition > Inheritance:**
    - Always prefer composing components together over creating deep inheritance trees.

---

## Advanced Markdown Component

- **Location:** `components/markdown` contains `AdvancedMarkdown` and its helpers.
- **Core Features:** multi-tab code blocks, callout blocks, and collapsible sections.
- **Assistant Responses:** All assistant replies must use these elements when presenting information or code.
- **Documentation Maintenance:** Update `docs/markdown` whenever new markdown features are introduced.

---

## Tooling & Build Requirements

- **Package Manager:**  
  - This repository uses [pnpm](https://pnpm.io/) as the exclusive package manager.
  - **All agents must use `pnpm` for all install, update, and script commands.**
  - Do not use `npm` or `yarn`—dependencies or lockfiles from other managers will not be accepted.
- **Build Check Before Pull Request:**  
  - **The application MUST successfully build (`pnpm build` or relevant command) before submitting a pull request.**
  - Do not submit PRs with unresolved type errors, linter errors, or any code that fails to build.
  - If you encounter build issues, resolve them fully prior to requesting review.

---

## Checklist Process

- **Checklist Location:** All task checklists and completion tracking are kept in `checklist.md`.
- **Completion Protocol:**
  - Upon finishing a task, agents must thoroughly cross-check their work against both `ollama-design.md` (for specification) and logical completeness (no missed “obvious” steps).
  - Mark the task as complete in `checklist.md` only when satisfied that all aspects are done, including minor details and edge cases.

---

## File & Type Structure

### Types & Interfaces

- **Centralized Types Directory:**
  - All types and interfaces must reside under the top-level `/types` directory.
  - Each domain/entity (e.g., `chat`, `model`, `settings`, etc.) **must** have its own folder under `/types`.
  - Within each entity directory:
    - Split files logically by purpose.  
      _Example for chat:_
      ```
      types/
      └─ chat/
         ├─ ChatMessage.ts
         ├─ Conversations.ts
         ├─ ChatSettings.ts
         └─ index.ts  // Barrel file, exporting all types in this folder
      ```
    - **Every entity folder must contain an `index.ts` that barrel-exports all types/interfaces within it.**
  - The root `/types/index.ts` must barrel-export all entity indexes.  
    _Example:_
    ```ts
    export * from "./chat";
    export * from "./model";
    export * from "./settings";
    // etc.
    ```
  - **No types/interfaces should be declared inline within business logic or component files**—always import from `/types`.

---

## Next.js 15+ Dynamic Routing: MANDATORY ASYNC PROMISE EXPORTS

> **This is non-negotiable.**  
> **Most AI and legacy code samples will get this wrong by default. Always double-check!**

- **Dynamic route files (`page.tsx`, `route.ts`, etc.) must export an `async` function and return a Promise.**
- **Never use synchronous route components for dynamic routes.**
- This is required by Next.js 15+ (App Router).

**Correct Example:**

```ts
// app/blog/[slug]/page.tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <div>My Post: {slug}</div>;
}
```

**Incorrect Example (will fail):**

```ts
// ❌ DO NOT DO THIS
export default function Page({ params }) {
  // Synchronous dynamic route
}
```

- Always check the [official Next.js docs](https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes) for the latest requirements.

---

## Contribution Workflow

1. **Read-only Rule:**

   - Never edit or suggest edits to `ollama-design.md`.

2. **Reference Architecture:**

   - Map all code/features directly to what’s described in `ollama-design.md`.

3. **Types:**

   - Define and import all types from the `/types` directory as described above.

4. **Check Completion:**

   - On task finish, review both the doc and your work for completeness—don’t leave “small” details out.
   - Only then mark the task as done in `checklist.md`.

5. **Routing:**

   - Review _all_ dynamic route files for proper async Promise exports—no exceptions.

6. **Raise Questions:**

   - If something is unclear, request clarification from the maintainers. Never assume or guess.

---

## Enforcement

- **Any code or suggestions that do not strictly follow these rules must not be merged.**
- **If you see a violation (especially dynamic routing or types location), open an issue or PR immediately to correct it.**

---
