# Visual Guide: Smart Markdown Conversion

## 🎬 The Problem (Before)

### Scan #1: ✅ Works

```
┌─────────────────────────────────────┐
│ Editor Content (Plain Text)        │
├─────────────────────────────────────┤
│ # Heading                           │
│ **Bold** text and *italic*          │
└─────────────────────────────────────┘
         ↓ [Ctrl+Shift+M]
┌─────────────────────────────────────┐
│ Editor Content (HTML)               │
├─────────────────────────────────────┤
│ <h1>Heading</h1>                    │
│ <strong>Bold</strong> text and      │
│ <em>italic</em>                     │
└─────────────────────────────────────┘
```

### Scan #2: ❌ BREAKS (Old Implementation)

```
┌─────────────────────────────────────┐
│ Editor Content (Mixed)              │
├─────────────────────────────────────┤
│ <h1>Heading</h1>                    │
│ <strong>Bold</strong> text and      │
│ <em>italic</em>                     │
│                                     │
│ ## New Section                      │  ← Add new markdown
│ More **bold** here                  │
└─────────────────────────────────────┘
         ↓ [Ctrl+Shift+M] (Old)
┌─────────────────────────────────────┐
│ Editor Content (BROKEN!)            │
├─────────────────────────────────────┤
│ &lt;h1&gt;Heading&lt;/h1&gt;        │  ❌ HTML rendered as text!
│ &lt;strong&gt;Bold&lt;/strong&gt;   │  ❌ All formatting lost!
│ <h2>New Section</h2>                │  ✅ New content works
│ More <strong>bold</strong> here     │  ✅ But old content broken
└─────────────────────────────────────┘
```

**Why?** Old code converted **entire document text**, including HTML tags!

---

## 🎯 The Solution (After)

### How Smart Detection Works

```
┌──────────────────────────────────────────────────────────┐
│                    Document Structure                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📄 Document                                             │
│   ├─ 📦 Heading Node                                     │
│   │   └─ 📝 Text: "Heading"          ← Skip (in heading)│
│   │                                                      │
│   ├─ 📦 Paragraph Node                                   │
│   │   ├─ 📦 Bold Node                                    │
│   │   │   └─ 📝 Text: "Bold"         ← Skip (formatted) │
│   │   ├─ 📝 Text: " text and "       ← Check this       │
│   │   └─ 📦 Italic Node                                  │
│   │       └─ 📝 Text: "italic"       ← Skip (formatted) │
│   │                                                      │
│   └─ 📦 Paragraph Node                                   │
│       └─ 📝 Text: "## New Section"   ← 🎯 CONVERT THIS! │
│           "More **bold** here"                           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Scan #2: ✅ Works Perfectly (New Implementation)

```
┌─────────────────────────────────────┐
│ Editor Content (Mixed)              │
├─────────────────────────────────────┤
│ <h1>Heading</h1>                    │  ← Already HTML
│ <strong>Bold</strong> text and      │  ← Already HTML
│ <em>italic</em>                     │  ← Already HTML
│                                     │
│ ## New Section                      │  ← Plain text with markdown
│ More **bold** here                  │  ← Plain text with markdown
└─────────────────────────────────────┘
         ↓ [Ctrl+Shift+M] (New - Smart Scan)
┌─────────────────────────────────────┐
│ 1. Walk through nodes               │
│    ✓ h1 node → Has HTML → SKIP      │
│    ✓ strong node → Has HTML → SKIP  │
│    ✓ em node → Has HTML → SKIP      │
│    ✓ text node → Has "##" → QUEUE   │
│    ✓ text node → Has "**" → QUEUE   │
│                                     │
│ 2. Convert queued nodes only        │
│    • "## New Section" → <h2>...</h2>│
│    • "**bold**" → <strong>...</>    │
│                                     │
│ 3. Apply in single transaction      │
└─────────────────────────────────────┘
         ↓
┌─────────────────────────────────────┐
│ Editor Content (Perfect!)           │
├─────────────────────────────────────┤
│ <h1>Heading</h1>                    │  ✅ Preserved!
│ <strong>Bold</strong> text and      │  ✅ Preserved!
│ <em>italic</em>                     │  ✅ Preserved!
│                                     │
│ <h2>New Section</h2>                │  ✅ Converted!
│ More <strong>bold</strong> here     │  ✅ Converted!
└─────────────────────────────────────┘
```

---

## 🔍 Detection Logic

### Old Approach (❌ Broken)

```typescript
// Gets ALL text (including HTML tags!)
const text = editor.getText();
// Result: "<h1>Heading</h1>**bold**"

// Converts EVERYTHING
const html = convertMarkdownToHtml(text);
// Result: Escapes HTML tags, breaks formatting
```

### New Approach (✅ Fixed)

```typescript
// Walk through individual text nodes
editor.state.doc.descendants((node, pos) => {
  if (node.isText && node.text) {
    // Check if text is plain or contains HTML
    if (/<[^>]+>/.test(node.text)) {
      return; // SKIP - already formatted
    }

    // Only convert plain text with markdown
    const result = convertMarkdownToHtml(node.text);
    if (result.success) {
      convertThis(node, pos);
    }
  }
});
```

---

## 📊 Processing Flow Diagram

```
                    User Presses Ctrl+Shift+M
                              ↓
                   ┌──────────────────────┐
                   │ Has Text Selected?   │
                   └──────────┬───────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
           Yes (Selection)            No (Full Doc)
                │                           │
                ↓                           ↓
    ┌───────────────────────┐   ┌──────────────────────┐
    │ Get Selected Text     │   │ Walk All Text Nodes  │
    │ Convert Markdown      │   │ Check Each Node:     │
    │ Replace Selection     │   │   • Is it text?      │
    └───────────────────────┘   │   • Has HTML? Skip   │
                                │   • Has markdown?    │
                                │   • Queue conversion │
                                └──────────┬───────────┘
                                           │
                                           ↓
                                ┌──────────────────────┐
                                │ Process Queue:       │
                                │  1. Reverse order    │
                                │  2. Delete old text  │
                                │  3. Insert HTML      │
                                │  4. Run transaction  │
                                └──────────┬───────────┘
                                           │
                ┌──────────────────────────┴──────────────────────┐
                │                                                 │
                ↓                                                 ↓
    ┌───────────────────────┐                        ┌──────────────────────┐
    │ Restore Cursor Pos    │                        │ Show Summary:        │
    │ Focus Editor          │                        │ "✓ Converted 3       │
    └───────────────────────┘                        │  patterns: ..."      │
                                                     └──────────────────────┘
```

---

## 🎭 Real-World Example

### Scenario: Writing a Blog Post

```
Step 1: Initial Draft
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# My Blog Post
This is the introduction.

Press Ctrl+Shift+M
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<h1>My Blog Post</h1>
<p>This is the introduction.</p>


Step 2: Add Formatted Content (Use Toolbar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<h1>My Blog Post</h1>
<p>This is the introduction.</p>
<p style="color: red; font-size: 18px;">
  Important notice
</p>


Step 3: Paste Markdown Content
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<h1>My Blog Post</h1>
<p>This is the introduction.</p>
<p style="color: red; font-size: 18px;">
  Important notice
</p>

## New Section
Here's some **bold** and *italic* text.
- List item 1
- List item 2


Step 4: Convert New Markdown (Ctrl+Shift+M)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
<h1>My Blog Post</h1>              ← Preserved ✅
<p>This is the introduction.</p>   ← Preserved ✅
<p style="color: red; ...">        ← Preserved ✅
  Important notice
</p>

<h2>New Section</h2>               ← Converted ✅
<p>Here's some <strong>bold</strong>
   and <em>italic</em> text.</p>   ← Converted ✅
<ul>
  <li>List item 1</li>             ← Converted ✅
  <li>List item 2</li>             ← Converted ✅
</ul>


Step 5: Continue Writing...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[All previous content preserved]

### Subsection
More content with `inline code`.

Press Ctrl+Shift+M again
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[All previous content still preserved] ← ✅

<h3>Subsection</h3>                ← Converted ✅
<p>More content with
   <code>inline code</code>.</p>   ← Converted ✅
```

---

## 🎯 Key Takeaways

### ✅ What Works Now:

1. **Mixed Content** - HTML and markdown coexist
2. **Incremental Conversion** - Only new markdown converts
3. **Preservation** - Existing formatting never resets
4. **Smart Detection** - Skips already-formatted text
5. **Safe Operations** - Single transaction, atomic updates
6. **Cursor Stability** - Position maintained after conversion

### ❌ What Was Broken Before:

1. Converting entire document as plain text
2. HTML tags treated as text (escaped)
3. All formatting reset on each scan
4. No distinction between formatted/plain text

---

## 🚀 Bottom Line

**You can now:**

- ✅ Use the toolbar to format text (traditional WYSIWYG)
- ✅ Paste markdown snippets anywhere
- ✅ Press Ctrl+Shift+M to render markdown
- ✅ Add more markdown and convert again
- ✅ Repeat forever without breaking existing content

**It's like having two editors in one: A visual editor AND a markdown editor!** 🎉
