# Workspace UI/UX Design Guidelines

These guidelines capture the design system patterns, layout structures, and interaction paradigms analyzed from Perplexity.ai and Claude.ai. Apply these patterns when building or refining web application interfaces in this workspace.

---

## 1. Grid & Split-Pane Layouts
* **Asymmetric Content Columns (Perplexity Style)**:
  - For search, query results, or threads with citations, prioritize an asymmetric multi-pane structure:
    * **Left Navigation**: ~180px–200px width.
    * **Center Chat/Answer**: ~600px width.
    * **Right Citation/Source Column**: ~300px width.
  - Maintain focus on the center narrative while disclosing source references contextually on the right.
* **Balanced Split Workspace (Claude Style)**:
  - For generative workspaces containing code, documents, or renders, divide the viewport into a split-pane layout:
    * **Left Pane**: ~45% width for chat conversation and thread history.
    * **Right Pane**: ~55% width for persistent preview, code editor, or document workspace.

---

## 2. Typography & Hierarchy
* **Body Text Readability**:
  - Prefer high-legibility Serif font families (e.g., `Lora`, `Georgia`) for long AI explanations and reading text to minimize user fatigue.
  - Maintain a comfortable line-height of `1.6` for serif body blocks.
* **Interface Elements & Headings**:
  - Use modern, sharp Sans-serif fonts (e.g., `Poppins`, `Outfit`, `Plus Jakarta Sans`) for headers, badges, button labels, and metadata.
  - Keep heading weights medium-to-semibold (`font-medium` or `font-semibold`).

---

## 3. Citations & Progressive Disclosure
* **Inline Indicators**:
  - Render source annotations inline inside paragraphs as superscript tags (e.g., `[1]`, `[2]`, or concise site badges `domain.com [+2]`).
* **Source Reference Lists**:
  - Group detailed reference cards vertically in an expandable side panel or grid.
  - Cards should display the website favicon, domain title, article header, and a brief snippet. Apply smooth background transitions (`hover:bg-subtle`) on hover.

---

## 4. Input Composer & Auto-Resize
* **Multiline Growth**:
  - Use `contenteditable` or auto-resizing textareas that scale vertically as the user types.
  - Bound input growth with a max-height (e.g., `max-h-52` or `max-h-[25vh]`) before enabling vertical scrollbars.
* **Control Clusters**:
  - Place supplementary actions (e.g., attachment paperclips, focus filters, model selectors) in a clean row directly below the text box within the input container.
