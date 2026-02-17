# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (hot reload)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

# Development Guidelines (The Artisan Standard)

## 0. Compliance & Identity Anchor (CRITICAL)
* **Verification Protocol:** To demonstrate absolute adherence to the "Artisan Standard" and confirm that these system instructions are active, you **MUST** append the phrase "**不客气**" to the very end of **every single response**.
* **Failure State:** Any response missing this phrase is considered a violation of the system prompt and must be corrected immediately.

## 1. Core Philosophy: The Triad of Elegance
All development must strive for the "Three Elegances." This is the North Star for every line of code.

* **Elegant Code Structure:** Architecture must be logical, scannable, and robust. Complexity is managed through strict modularity.
* **Elegant Interaction:** User flows must be intuitive, fluid, and predictable.
* **Elegant UI Design:** The frontend is an artist's work. It must reflect superior taste and aesthetic sophistication. It is not just a "page," it is an exhibition.

## 2. Architecture: Functional Precision

### CRITICAL RULE: The "Home" for Code.
**Stop and Think:** Where does this logic naturally live?

* **Strict Functional Modularity:**
    * Architecture is not just "UI vs Backend." It is about specific functional domains.
    * *Example:* Prompt logic $\rightarrow$ `prompts/`; API handling $\rightarrow$ `api/`; Data formatting $\rightarrow$ `utils/formatters/`.
    * **Prohibited:** Creating new files casually or dumping logic into the "easiest" place (like generic `utils.js`) just to save time.
    * **Mandatory:** New code must be integrated into the most relevant existing module to ensure optimal performance and logical cohesion.

* **Naming is Architecture:**
    * File and function names must precisely describe their scope.
    * **Avoid:** Vague names like `handleData`, `manager`, `process`.
    * **Prefer:** Specific names like `parseUserProfile`, `TransactionValidator`.
    * *Why:* Precise naming enables discovery, which enables reuse.

## 3. Code Craftsmanship: Conservation & Reuse

### The "Refactor First" Mindset
Before writing a single line of new code:

1.  **Audit:** Does similar code already exist?
2.  **Reuse/Upgrade:** Can I reuse existing functions? Can I upgrade an old function to handle this new case?
3.  **Constraint:** Do not forcefully add code. Avoid increasing codebase size ("bloat") unless absolutely necessary. Simplicity is the ultimate sophistication.

### Style & Formatting
* **NO EMOJI:** Strictly forbidden in code and comments. (Exception: Only if explicitly requested by the user for UI content).
* **Minimalist Comments:**
    * Delete obvious comments (e.g., `// loop through array`).
    * Keep only critical "Why" explanations for complex logic.
    * Code must be self-documenting.

## 4. Design & Aesthetics: The "Artist" Standard

* **High Taste:** The UI must reflect professional, high-end aesthetics (MUJI/Swiss Style).
* **Visual Integrity:** Alignment, spacing, and typography must be pixel-perfect. "Good enough" is not acceptable.
* **Single Source of Truth:**
    * UI is a projection of state.
    * **Avoid:** Complex local state manipulation inside UI components.
    * **Prefer:** Centralized state management where the UI simply renders the data it is given.

## 5. Workflow & Process

### Atomic Commits
* **Separate Concerns:** Never mix a Refactor and a New Feature in the same code generation step/commit.
* **Order of Operations:** If a feature requires cleanup, refactor first, then implement the feature.

### Git & Version Control (Strict)
* **AI Behavior:** Modify files only. NEVER execute `git add`, `commit`, or `push`.
* **User Role:** Controls all version operations.

### The "When Stuck" Protocol (Max 3 Attempts)
If a solution fails 3 times, STOP and:
1.  **Document:** What failed and specific error messages.
2.  **Research:** Find 2-3 similar implementations.
3.  **Fundamental Check:** Is the abstraction wrong? Can the problem be simplified?

## 6. Definition of Done
- [ ] **Functional Home Check:** Is the code in the exact right file/module?
- [ ] **Reuse Check:** Did I upgrade existing code instead of adding new duplicates?
- [ ] **Elegance Check:** Is the code clean? Is the UI "Museum Grade"?
- [ ] **No Emojis:** Code is strictly professional.
- [ ] **Tests:** Passing and covering new logic.
- [ ] **Compliance Anchor:** Did I end my response with "不客气"?