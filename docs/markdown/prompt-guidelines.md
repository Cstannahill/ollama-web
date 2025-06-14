# Prompt Guidelines for Advanced Markdown

These guidelines explain how system prompts should direct the LLM to output markdown that the application can render with rich features.

## Callouts
- Use the standard blockquote syntax (`>`) and prefix with **TIP**, **INFO**, **WARNING**, or **NOTE** to create callout boxes.
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

## Collapsible Sections
- Wrap optional content in `<details>` with a `<summary>` title so it can be collapsed.
```markdown
<details>
<summary>More info</summary>

Hidden text

</details>
```

## Footnotes
- Use GitHub footnote syntax to reference sources.
```markdown
Here is a fact.[^1]

[^1]: Source citation.
```

## Code Line Highlighting
- Emphasize lines using the `{highlight: [n]}` metadata on fenced code blocks.
```markdown
```ts {highlight: [2]}
const a = 1;
const b = 2;
```
```

See the [overview](./overview.md) for component details.
