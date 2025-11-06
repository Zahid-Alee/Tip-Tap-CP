# 🚀 Quick Reference: Smart Markdown Conversion

## ⌨️ Keyboard Shortcut

```
Ctrl + Shift + M  →  Scan & Convert Markdown
```

---

## 🎯 What It Does

### Before You Press:

```
<h1>My Title</h1>              ← HTML (formatted)
**New bold text**              ← Markdown (plain text)
```

### After You Press:

```
<h1>My Title</h1>              ← Preserved ✅
<strong>New bold text</strong> ← Converted ✅
```

---

## ✨ Key Features

| Feature              | Description                            |
| -------------------- | -------------------------------------- |
| 🛡️ **Safe**          | Never breaks existing HTML             |
| 🎯 **Selective**     | Only converts plain text with markdown |
| ⚡ **Fast**          | Single transaction, atomic update      |
| 🔄 **Repeatable**    | Can scan multiple times safely         |
| 📍 **Smart Cursor**  | Maintains cursor position              |
| 🎨 **Mixed Content** | HTML + Markdown in same document       |

---

## 📝 Supported Markdown

| Syntax           | Result        | Pattern             |
| ---------------- | ------------- | ------------------- |
| `**bold**`       | **bold**      | Bold (asterisk)     |
| `__bold__`       | **bold**      | Bold (underscore)   |
| `*italic*`       | _italic_      | Italic (asterisk)   |
| `_italic_`       | _italic_      | Italic (underscore) |
| `~~strike~~`     | ~~strike~~    | Strikethrough       |
| `==highlight==`  | ==highlight== | Highlight           |
| `` `code` ``     | `code`        | Inline code         |
| `[text](url)`    | [text](url)   | Link                |
| `# Heading`      | <h1>          | Heading 1           |
| `## Heading`     | <h2>          | Heading 2-6         |
| `> Quote`        | <blockquote>  | Blockquote          |
| `- Item`         | <ul><li>      | Unordered list      |
| `1. Item`        | <ol><li>      | Ordered list        |
| `- [ ] Task`     | ☐ Task        | Task (unchecked)    |
| `- [x] Task`     | ☑ Task        | Task (checked)      |
| ` ``` code ``` ` | <pre><code>   | Code block          |

---

## 🎬 Common Workflows

### Workflow 1: Paste & Convert

```
1. Paste markdown → Ctrl+V
2. Convert to HTML → Ctrl+Shift+M
3. ✅ Done!
```

### Workflow 2: Mixed Editing

```
1. Format with toolbar (visual)
2. Paste markdown snippet (text)
3. Convert markdown → Ctrl+Shift+M
4. ✅ Both styles coexist!
```

### Workflow 3: Incremental Writing

```
1. Write & convert → Ctrl+Shift+M
2. Add more markdown
3. Convert again → Ctrl+Shift+M
4. Repeat as needed
5. ✅ Previous content safe!
```

### Workflow 4: Selection Mode

```
1. Type: "This is **bold**"
2. Select: "**bold**"
3. Convert → Ctrl+Shift+M
4. ✅ Only selection converts!
```

---

## 🐛 Troubleshooting

### Nothing Converts?

- ✓ Check if text is already HTML
- ✓ Verify markdown syntax is correct
- ✓ Look for console messages

### Some Text Doesn't Convert?

- ✓ It's probably already formatted (correct behavior)
- ✓ Check if text contains HTML tags

### Cursor Jumps?

- ✓ Normal after conversion
- ✓ Position auto-restored
- ✓ Just click where you want to continue

---

## 💡 Pro Tips

### Tip 1: Selection Mode

Select specific text to convert only that portion, leaving rest untouched.

### Tip 2: Check Console

Watch console for conversion feedback:

```
✓ Converted 3 patterns: 2 bold-asterisk, 1 heading
```

### Tip 3: Undo Support

Press `Ctrl+Z` to undo markdown conversion if needed.

### Tip 4: Code Blocks

Markdown inside code blocks won't convert (correct behavior).

### Tip 5: Preview First

Copy content to test in separate editor before committing.

---

## 📊 Decision Tree

```
Do you have existing HTML?
├─ Yes → Want to add more content?
│   ├─ Yes → Type markdown → Ctrl+Shift+M ✅
│   └─ No → Just use toolbar ✅
│
└─ No → Have markdown to paste?
    ├─ Yes → Paste → Ctrl+Shift+M ✅
    └─ No → Type normally ✅
```

---

## 🎓 Learning Path

### Beginner

1. Paste simple markdown
2. Press Ctrl+Shift+M
3. Observe conversion

### Intermediate

1. Mix toolbar formatting with markdown
2. Convert incrementally
3. Use selection mode

### Advanced

1. Understand node-level processing
2. Check console for detailed feedback
3. Contribute custom patterns

---

## 📚 Related Files

- **`MARKDOWN_SOLUTION.md`** - Technical deep dive
- **`MARKDOWN_VISUAL_GUIDE.md`** - Visual examples
- **`MARKDOWN_TEST_SCENARIO.md`** - Test cases
- **`MARKDOWN_IMPLEMENTATION_SUMMARY.md`** - Overview

---

## ⚠️ Important Notes

### ✅ DO:

- Convert plain text with markdown
- Mix HTML and markdown freely
- Scan multiple times as needed
- Use selection mode for precision

### ❌ DON'T:

- Expect HTML to re-convert (it won't, by design)
- Worry about breaking existing content (protected)
- Convert the same text twice (smart detection skips it)

---

## 🆘 Need Help?

### Check These:

1. Is markdown syntax correct?
2. Is text already formatted (HTML)?
3. Did you press Ctrl+Shift+M?
4. Check console for messages

### Still Stuck?

Review `MARKDOWN_VISUAL_GUIDE.md` for detailed examples.

---

## 🎉 Success Checklist

- [ ] Pasted markdown
- [ ] Pressed Ctrl+Shift+M
- [ ] Content converted to HTML
- [ ] Added more markdown
- [ ] Pressed Ctrl+Shift+M again
- [ ] Previous HTML preserved ✅
- [ ] New markdown converted ✅
- [ ] **You're now a markdown master!** 🚀

---

**Remember: Ctrl + Shift + M is your friend!** 🎯
