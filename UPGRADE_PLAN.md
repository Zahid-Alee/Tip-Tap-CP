# TipTap v2 to v3 Upgrade Plan

## Overview

This document outlines the complete upgrade strategy for migrating the TipTap editor from version 2 to version 3. The upgrade will be divided into 4 sessions to ensure stability and minimize breaking changes.

---

## Current State Analysis

### Dependencies (v2)

```json
"@tiptap/extension-code-block-lowlight": "^2.12.0",
"@tiptap/extension-color": "^2.12.0",
"@tiptap/extension-font-family": "^2.12.0",
"@tiptap/extension-font-size": "^3.0.0-next.3",
"@tiptap/extension-highlight": "^2.11.7",
"@tiptap/extension-image": "^2.11.7",
"@tiptap/extension-link": "^2.11.7",
"@tiptap/extension-mathematics": "^3.6.6",
"@tiptap/extension-subscript": "^2.11.7",
"@tiptap/extension-superscript": "^2.11.7",
"@tiptap/extension-table": "^2.12.0",
"@tiptap/extension-table-cell": "^2.12.0",
"@tiptap/extension-table-header": "^2.12.0",
"@tiptap/extension-table-row": "^2.12.0",
"@tiptap/extension-task-item": "^2.11.7",
"@tiptap/extension-task-list": "^2.11.7",
"@tiptap/extension-text-align": "^2.11.7",
"@tiptap/extension-text-style": "^2.12.0",
"@tiptap/extension-typography": "^2.11.7",
"@tiptap/extension-underline": "^2.11.7",
"@tiptap/pm": "^2.11.7",
"@tiptap/react": "^2.12.0",
"@tiptap/starter-kit": "^2.11.7"
```

### Key Breaking Changes in v3

1. **Package Consolidation**

   - Table extensions merged into `@tiptap/extension-table`
   - List extensions merged into `@tiptap/extension-list`
   - Utility extensions merged into `@tiptap/extensions`
   - Menu components moved to `/menus` subpath

2. **Menu System Changes**

   - Tippy.js replaced with Floating UI
   - BubbleMenu and FloatingMenu require new import paths
   - `tippyOptions` replaced with `options` prop

3. **API Changes**

   - `shouldRerenderOnTransaction` defaults to `false`
   - `getPos()` can return `undefined` in NodeViews
   - `setContent` signature changed
   - History extension renamed to UndoRedo

4. **StarterKit Updates**
   - Now includes Link, ListKeymap, and Underline by default
   - History renamed to undoRedo

---

## Session 1: Dependencies & Core Package Updates

**Goal**: Update core packages and install new dependencies

### Tasks

1. ✅ Install Floating UI dependencies
2. ✅ Update all @tiptap packages to v3
3. ✅ Update package consolidations
4. ✅ Verify no breaking import issues

### Files to Modify

- `package.json`

### Commands

```bash
# Install Floating UI
npm install @floating-ui/dom@^1.6.0

# Uninstall tippy.js
npm uninstall tippy.js

# Update all @tiptap packages to v3
npm install @tiptap/core@latest @tiptap/react@latest @tiptap/starter-kit@latest
npm install @tiptap/extension-table@latest
npm install @tiptap/extension-list@latest
npm install @tiptap/extensions@latest
npm install @tiptap/extension-color@latest
npm install @tiptap/extension-font-family@latest
npm install @tiptap/extension-font-size@latest
npm install @tiptap/extension-highlight@latest
npm install @tiptap/extension-image@latest
npm install @tiptap/extension-link@latest
npm install @tiptap/extension-mathematics@latest
npm install @tiptap/extension-subscript@latest
npm install @tiptap/extension-superscript@latest
npm install @tiptap/extension-text-align@latest
npm install @tiptap/extension-text-style@latest
npm install @tiptap/extension-typography@latest
npm install @tiptap/extension-underline@latest
npm install @tiptap/extension-code-block-lowlight@latest
npm install @tiptap/pm@latest
```

### Expected Outcome

- All packages updated to v3
- Floating UI installed
- Build may have errors (expected - will fix in next sessions)

---

## Session 2: Import Path Updates & Package Consolidation

**Goal**: Update all import statements to match v3 structure

### Tasks

1. ✅ Update table extension imports
2. ✅ Update list extension imports (if using separate packages)
3. ✅ Update utility extension imports
4. ✅ Update BubbleMenu/FloatingMenu imports
5. ✅ Update StarterKit configuration

### Files to Modify

1. `src/components/tiptap-extension/table-extension.tsx`
2. `src/components/tiptap-ui/table/table-bubble-menu.tsx`
3. `src/components/tiptap-templates/simple/simple-editor.tsx`
4. `src/components/tiptap-ui/toolbars/BubbleToolbar.tsx`
5. Any other files using BubbleMenu/FloatingMenu

### Changes Required

#### Table Extensions

```typescript
// BEFORE
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

// AFTER
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
```

#### BubbleMenu Imports

```typescript
// BEFORE
import { BubbleMenu, FloatingMenu } from "@tiptap/react";

// AFTER
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
```

#### StarterKit Configuration

```typescript
// BEFORE
StarterKit.configure({
  history: false, // disable history
});

// AFTER
StarterKit.configure({
  undoRedo: false, // disable undo/redo (previously history)
});
```

### Expected Outcome

- All imports updated to v3 structure
- No import errors
- Code compiles but may have runtime issues

---

## Session 3: Menu System Migration (Tippy.js → Floating UI)

**Goal**: Replace all Tippy.js configurations with Floating UI

### Tasks

1. ✅ Update BubbleMenu components
2. ✅ Update FloatingMenu components (if any)
3. ✅ Update all tippyOptions to Floating UI options
4. ✅ Test menu positioning and behavior

### Files to Modify

1. `src/components/tiptap-ui/table/table-bubble-menu.tsx`
2. `src/components/tiptap-ui/toolbars/BubbleToolbar.tsx`
3. `src/components/tiptap-extension/hover-word/hover-word-bubble-menu.tsx`
4. `src/components/tiptap-extension/Image/ImageBubbleMenu.tsx`
5. `src/components/tiptap-node/card-node/card-bubble-menu.tsx`
6. `src/components/tiptap-extension/column/column-bubble-menu.tsx`

### Changes Required

#### BubbleMenu Migration

```typescript
// BEFORE
<BubbleMenu
  editor={editor}
  tippyOptions={{
    duration: 100,
    placement: "top",
    animation: "fade",
  }}
>
  {/* content */}
</BubbleMenu>;

// AFTER
import { offset } from "@floating-ui/dom";

<BubbleMenu
  editor={editor}
  options={{
    placement: "top",
    offset: 6,
  }}
>
  {/* content */}
</BubbleMenu>;
```

### Expected Outcome

- All menus use Floating UI
- No Tippy.js references
- Menus display correctly

---

## Session 4: API Updates & React Integration

**Goal**: Update editor configuration and handle breaking API changes

### Tasks

1. ✅ Add `shouldRerenderOnTransaction` configuration
2. ✅ Update NodeView components to handle `undefined` getPos
3. ✅ Update `setContent` calls
4. ✅ Test all editor functionality
5. ✅ Fix any remaining runtime issues

### Files to Modify

1. `src/components/tiptap-templates/simple/simple-editor.tsx`
2. `src/components/tiptap-node/image-upload-node/image-upload-node.tsx`
3. `src/components/tiptap-node/card-node/card-node-component.tsx`
4. `src/components/tiptap-node/math-node/math-node-view.tsx`
5. `src/components/tiptap-ui/code/CodeBlockComponent.tsx`
6. `src/components/tiptap-ui/output-block/OutputBlockComponent.tsx`
7. `src/components/tiptap-extension/Image/ResizableImageView.tsx`

### Changes Required

#### Editor Configuration

```typescript
const editor = useEditor({
  // Add this to maintain previous behavior (optional)
  shouldRerenderOnTransaction: true,

  // Or use manual state tracking for better performance
  onTransaction({ transaction }) {
    // Track specific state changes
  },

  // ... rest of config
});
```

#### NodeView getPos Handling

```typescript
// BEFORE
const pos = nodeViewProps.getPos();

// AFTER
const pos = nodeViewProps.getPos();
if (pos !== undefined) {
  // use pos
}
```

#### setContent Updates

```typescript
// BEFORE
editor.commands.setContent(content, true); // emitUpdate

// AFTER
editor.commands.setContent(content, { emitUpdate: true });
```

### Expected Outcome

- Editor fully functional
- All features working
- No console errors
- Performance optimized

---

## Verification Checklist

### After Each Session

- [ ] Code compiles without errors
- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] Dev server runs successfully

### Final Verification (After Session 4)

- [ ] Editor initializes correctly
- [ ] All toolbar buttons work
- [ ] Text formatting works (bold, italic, underline, etc.)
- [ ] Lists work (bullet, ordered, task)
- [ ] Tables can be inserted and manipulated
- [ ] Images can be uploaded and resized
- [ ] Links work correctly
- [ ] BubbleMenu appears correctly
- [ ] Code blocks work with syntax highlighting
- [ ] Math nodes render correctly
- [ ] Card nodes work correctly
- [ ] Find & Replace functionality works
- [ ] Context menu works
- [ ] AI generation works
- [ ] Translation functionality works
- [ ] Mobile view works correctly
- [ ] Read-only mode works
- [ ] All keyboard shortcuts work
- [ ] Markdown scanning works
- [ ] Upload progress indicators work
- [ ] Hover word functionality works

---

## Rollback Plan

If critical issues arise:

1. Create a backup branch before starting
2. Keep the old package.json backed up
3. Can rollback by:
   ```bash
   git checkout backup-branch
   npm install
   ```

---

## Notes for Future Sessions

### Session 1 Completion Prompt Template

```
I completed Session 1 of the TipTap v2 to v3 upgrade:
- Updated all packages to v3
- Installed @floating-ui/dom
- Removed tippy.js

Current status:
- [✅/❌] Build compiles
- [✅/❌] Dependencies installed correctly
- [Issues found if any]

Please proceed with Session 2: Import Path Updates
```

### Session 2 Completion Prompt Template

```
I completed Session 2 of the TipTap v2 to v3 upgrade:
- Updated table extension imports
- Updated BubbleMenu imports
- Updated StarterKit configuration

Current status:
- [✅/❌] All imports updated
- [✅/❌] Code compiles
- [Issues found if any]

Please proceed with Session 3: Menu System Migration
```

### Session 3 Completion Prompt Template

```
I completed Session 3 of the TipTap v2 to v3 upgrade:
- Migrated all BubbleMenu components to Floating UI
- Removed all tippyOptions references

Current status:
- [✅/❌] Menus display correctly
- [✅/❌] No Tippy.js references
- [Issues found if any]

Please proceed with Session 4: API Updates
```

---

## Estimated Timeline

- Session 1: 15-20 minutes
- Session 2: 30-45 minutes
- Session 3: 45-60 minutes
- Session 4: 60-90 minutes

**Total: 2.5 - 3.5 hours**

---

## Additional Resources

- [TipTap v3 Upgrade Guide](https://tiptap.dev/docs/guides/upgrade-tiptap-v2)
- [Floating UI Documentation](https://floating-ui.com/)
- [TipTap v3 API Reference](https://tiptap.dev/docs/editor/api)
