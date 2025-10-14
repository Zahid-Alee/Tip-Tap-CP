import { Extension } from "@tiptap/react";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface LeadingNodeOptions {
  /**
   * The types of nodes that should trigger deletion of leading empty paragraphs
   */
  blockTypes: string[];
}

/**
 * Extension to prevent empty paragraphs before block elements like images.
 * When a block element (image, card, etc.) is the first content or becomes first,
 * this extension removes any leading empty paragraph to avoid unwanted whitespace.
 */
export const LeadingNode = Extension.create<LeadingNodeOptions>({
  name: "leadingNode",

  addOptions() {
    return {
      blockTypes: ["resizableImage", "imageUpload", "codeBlock", "card"],
    };
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey(this.name);

    return [
      new Plugin({
        key: pluginKey,
        appendTransaction: (transactions, oldState, newState) => {
          // Only process if document actually changed
          const docChanged = transactions.some((tr) => tr.docChanged);
          if (!docChanged) {
            return null;
          }

          const { doc, tr } = newState;
          const { blockTypes } = this.options;

          // Check if first node is an empty paragraph
          const firstNode = doc.firstChild;
          if (!firstNode || firstNode.type.name !== "paragraph") {
            return null;
          }

          // Check if the paragraph is empty (no content or only whitespace)
          const isEmpty =
            firstNode.content.size === 0 ||
            (firstNode.textContent.trim() === "" && firstNode.childCount <= 1);

          if (!isEmpty) {
            return null;
          }

          // Check if there's a second node and if it's one of the specified block types
          const secondNode = doc.maybeChild(1);
          if (!secondNode) {
            return null;
          }

          const isBlockType = blockTypes.includes(secondNode.type.name);
          if (!isBlockType) {
            return null;
          }

          // Delete the empty leading paragraph
          return tr.delete(0, firstNode.nodeSize);
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      // Handle backspace at the start of a block element
      Backspace: () => {
        const { state, view } = this.editor;
        const { selection, doc } = state;
        const { $from } = selection;

        // Check if we're at the start of a node
        if ($from.pos === 0 || $from.parentOffset > 0) {
          return false;
        }

        // Get the node before cursor
        const nodeBefore = $from.nodeBefore;
        if (!nodeBefore) {
          return false;
        }

        // Check if the node before is an empty paragraph
        if (
          nodeBefore.type.name === "paragraph" &&
          nodeBefore.content.size === 0
        ) {
          const currentNode = $from.parent;

          // Check if current node is a block type
          if (this.options.blockTypes.includes(currentNode.type.name)) {
            // Delete the empty paragraph before
            const tr = state.tr.delete(
              $from.pos - nodeBefore.nodeSize,
              $from.pos
            );
            view.dispatch(tr);
            return true;
          }
        }

        return false;
      },

      // Handle delete at the end of an empty paragraph before a block element
      Delete: () => {
        const { state, view } = this.editor;
        const { selection, doc } = state;
        const { $from } = selection;

        // Check if we're in an empty paragraph
        const currentNode = $from.parent;
        if (
          currentNode.type.name !== "paragraph" ||
          currentNode.content.size > 0
        ) {
          return false;
        }

        // Check if cursor is at the end of the paragraph
        if ($from.parentOffset !== currentNode.content.size) {
          return false;
        }

        // Get the node after
        const nodeAfter = $from.nodeAfter;
        if (!nodeAfter) {
          return false;
        }

        // Check if the next node is a block type
        if (this.options.blockTypes.includes(nodeAfter.type.name)) {
          // Delete the empty paragraph
          const tr = state.tr.delete(
            $from.pos - $from.parentOffset,
            $from.pos - $from.parentOffset + currentNode.nodeSize
          );
          view.dispatch(tr);
          return true;
        }

        return false;
      },
    };
  },
});

export default LeadingNode;
