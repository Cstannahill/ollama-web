# Prompt Guidelines for Advanced Markdown

These guidelines explain how system prompts should direct the LLM to output markdown that the application can render with rich features.

## Callouts
- Use the standard blockquote syntax (`>`) and prefix with **TIP**, **INFO**, or **WARNING** to create callout boxes.
- Example:
  ```markdown
  > **TIP**: Remember to check your API key.
  ```

## Multi-Tab Code Blocks
- For multi-file examples, separate each file with a heading line using three dashes (`---`).
- Start each section with a fenced code block that includes the language and filename.
- Example:
  ```markdown
  ```ts index.ts```
  console.log('main');
  ---
  ```ts utils.ts```
  export const util = () => {};
  ```
  ```

## Diagrams
- Produce diagrams using mermaid fenced blocks so they render automatically.
- Example:
  ```markdown
  ```mermaid
  flowchart TD
      A --> B
  ```
  ```

See the [overview](./overview.md) for component details.
