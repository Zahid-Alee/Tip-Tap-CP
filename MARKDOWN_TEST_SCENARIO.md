# Test Scenarios for Smart Markdown Conversion

## Scenario 1: Initial Markdown Paste

### Action:

Paste the following content:

```
# Main Title
This is **bold text** and this is *italic text*.

## Subsection
- Item 1
- Item 2
- Item 3

Here's some `inline code` and a [link](https://example.com).
```

### Expected Result (First Scan):

✅ All markdown converts to proper HTML
✅ Headings render with custom styles
✅ Bold, italic, code, and links all formatted

---

## Scenario 2: Add More Markdown to Existing HTML

### Action:

After first conversion, add new markdown below the existing content:

```
### New Section
This is **new bold text** in the middle of rendered content.

> A new blockquote
```

### Expected Result (Second Scan):

✅ Existing HTML blocks remain unchanged
✅ Only new markdown converts
✅ No formatting reset on existing content
✅ Mixed HTML and markdown coexist properly

---

## Scenario 3: Selection-Based Conversion

### Action:

1. Have mixed content in editor
2. Select only a portion with markdown: `**Select this bold** text`
3. Press Ctrl+Shift+M

### Expected Result:

✅ Only selected text converts
✅ Rest of document untouched
✅ Cursor restored to original position

---

## Scenario 4: Complex Nested Content

### Action:

Create a document with:

```html
<h1>Existing Heading</h1>
<p>Formatted paragraph</p>
<ul>
  <li>Existing list item</li>
</ul>

**New bold text** ## New heading - New list item
```

### Expected Result (Scan):

✅ Existing HTML preserved exactly
✅ New markdown converts to matching structure
✅ No duplication or reset

---

## Scenario 5: Code Blocks

### Action:

```
\`\`\`javascript
const test = "**This should NOT convert**";
\`\`\`

But **this should** convert because it's outside the code block.
```

### Expected Result:

✅ Code block content remains literal (no markdown conversion)
✅ Text outside code block converts properly
✅ Code block HTML structure preserved

---

## Scenario 6: Multiple Scans

### Action:

1. Paste markdown → Scan (Ctrl+Shift+M)
2. Add more markdown → Scan again
3. Add even more markdown → Scan again

### Expected Result:

✅ Each scan only converts new markdown
✅ Previously converted content stable
✅ No cumulative formatting issues
✅ Document structure remains intact

---

## Verification Checklist

After testing, verify:

- [ ] **No HTML reset** - Existing formatted content unchanged
- [ ] **Selective conversion** - Only markdown text converts
- [ ] **Mixed content works** - HTML and markdown coexist
- [ ] **Cursor maintained** - Position restored after conversion
- [ ] **Undo works** - Can undo conversion with Ctrl+Z
- [ ] **Performance good** - No lag on large documents
- [ ] **Console messages** - Clear feedback on conversions
- [ ] **No errors** - No console errors during conversion

---

## Common Issues & Solutions

### Issue: Some text doesn't convert

**Cause**: Text might already contain HTML tags  
**Solution**: The system correctly skips it to preserve formatting

### Issue: Cursor jumps to wrong position

**Cause**: Document structure changed significantly  
**Solution**: Implementation includes cursor restoration logic

### Issue: Conversion happens but reverts

**Cause**: Editor state conflict  
**Solution**: All changes applied in single transaction

---

## Console Output Examples

### Successful Conversion:

```
✓ Converted 5 markdown pattern(s): 2 bold-asterisk, 1 italic-asterisk, 1 heading, 1 link
```

### No Patterns Found:

```
No markdown patterns found to convert.
```

### Selection Mode:

```
✓ Converted 3 markdown pattern(s): 2 bold-asterisk, 1 italic-asterisk
```
