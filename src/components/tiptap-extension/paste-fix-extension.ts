import { Extension } from "@tiptap/core";

export const PasteFix = Extension.create({
  name: "pasteFix",

  addKeyboardShortcuts() {
    return {
      "Mod-v": () => {
        // Let the default paste behavior happen
        return false;
      },
    };
  },

  addPasteRules() {
    return [];
  },
});
