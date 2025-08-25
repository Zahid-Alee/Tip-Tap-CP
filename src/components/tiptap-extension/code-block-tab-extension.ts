import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export const CodeBlockTabExtension = Extension.create({
  name: "codeBlockTab",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("codeBlockTab"),
        props: {
          handleKeyDown: (view, event) => {
            const { state, dispatch } = view;
            const { selection, tr } = state;

            // Check if we're in a code block
            const $from = selection.$from;
            const codeBlockType = state.schema.nodes.codeBlock;

            if (!codeBlockType) return false;

            // Find if we're inside a code block
            let isInCodeBlock = false;
            for (let depth = $from.depth; depth >= 0; depth--) {
              const node = $from.node(depth);
              if (node.type === codeBlockType) {
                isInCodeBlock = true;
                break;
              }
            }

            if (!isInCodeBlock) return false;

            // Handle Tab key
            if (event.key === "Tab") {
              event.preventDefault();

              // Insert 4 spaces (or tab character)
              const tabText = "    "; // 4 spaces
              const newTr = tr.insertText(
                tabText,
                selection.from,
                selection.to
              );
              dispatch(newTr);

              return true;
            }

            // Handle Shift+Tab (unindent)
            if (event.key === "Tab" && event.shiftKey) {
              event.preventDefault();

              // Get the text before cursor on current line
              const doc = state.doc;
              const $pos = selection.$from;
              const textBefore = doc.textBetween(
                Math.max(0, $pos.pos - 100), // Look back up to 100 chars
                $pos.pos,
                "\n"
              );

              // Find the start of current line
              const lines = textBefore.split("\n");
              const currentLine = lines[lines.length - 1];
              const lineStartPos = $pos.pos - currentLine.length;

              // Check if line starts with spaces/tabs
              const leadingSpaces = currentLine.match(/^(\s+)/);
              if (leadingSpaces) {
                const spacesToRemove = Math.min(4, leadingSpaces[1].length);
                const newTr = tr.delete(
                  lineStartPos,
                  lineStartPos + spacesToRemove
                );
                dispatch(newTr);
              }

              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});

export default CodeBlockTabExtension;
