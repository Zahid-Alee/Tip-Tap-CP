// components/tiptap-extension/find-replace/find-replace-extension.ts
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface FindReplaceOptions {
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
  wholeWord: boolean;
}

export interface FindReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
  wholeWord: boolean;
  currentIndex: number;
  results: Array<{ from: number; to: number; text: string }>;
}

const findReplacePluginKey = new PluginKey('findReplace');

export const FindReplace = Extension.create<FindReplaceOptions, FindReplaceStorage>({
  name: 'findReplace',

  addOptions() {
    return {
      searchTerm: '',
      replaceTerm: '',
      caseSensitive: false,
      wholeWord: false,
    };
  },

  addStorage() {
    return {
      searchTerm: '',
      replaceTerm: '',
      caseSensitive: false,
      wholeWord: false,
      currentIndex: -1,
      results: [],
    };
  },

  addCommands() {
    return {
      setSearchTerm: (searchTerm: string) => ({ tr, dispatch }) => {
        this.storage.searchTerm = searchTerm;
        return this.editor.commands.updateFindResults();
      },
      setReplaceTerm: (replaceTerm: string) => ({ tr, dispatch }) => {
        this.storage.replaceTerm = replaceTerm;
        return true;
      },
      setCaseSensitive: (caseSensitive: boolean) => ({ tr, dispatch }) => {
        this.storage.caseSensitive = caseSensitive;
        return this.editor.commands.updateFindResults();
      },
      setWholeWord: (wholeWord: boolean) => ({ tr, dispatch }) => {
        this.storage.wholeWord = wholeWord;
        return this.editor.commands.updateFindResults();
      },
      updateFindResults: () => ({ tr, dispatch, state }) => {
        const { searchTerm, caseSensitive, wholeWord } = this.storage;

        if (!searchTerm) {
          this.storage.results = [];
          this.storage.currentIndex = -1;
          if (dispatch) {
            dispatch(tr.setMeta(findReplacePluginKey, { type: 'clear' }));
          }
          return true;
        }

        const results: Array<{ from: number; to: number; text: string }> = [];
        const doc = state.doc;

        let flags = 'g';
        if (!caseSensitive) flags += 'i';

        let pattern = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (wholeWord) {
          pattern = `\\b${pattern}\\b`;
        }

        try {
          const regex = new RegExp(pattern, flags);

          doc.descendants((node, pos) => {
            if (node.isText && node.text) {
              const matches = [...node.text.matchAll(regex)];
              matches.forEach(match => {
                if (match.index !== undefined) {
                  const from = pos + match.index;
                  const to = from + match[0].length;
                  results.push({ from, to, text: match[0] });
                }
              });
            }
          });
        } catch (error) {
          console.error('Invalid regex pattern:', error);
        }

        this.storage.results = results;
        this.storage.currentIndex = results.length > 0 ? 0 : -1;

        if (dispatch) {
          const newTr = tr.setMeta(findReplacePluginKey, {
            type: 'update',
            results: results,
            currentIndex: this.storage.currentIndex
          });
          dispatch(newTr);
        }

        return true;
      },
      findNext: () => ({ tr, dispatch }) => {
        const { results, currentIndex } = this.storage;
        if (results.length === 0) return false;

        const nextIndex = currentIndex + 1 >= results.length ? 0 : currentIndex + 1;
        this.storage.currentIndex = nextIndex;

        const result = results[nextIndex];
        if (result) {
          this.editor.commands.setTextSelection({ from: result.from, to: result.to });

          // Trigger decoration update
          if (dispatch) {
            dispatch(tr.setMeta(findReplacePluginKey, {
              type: 'update',
              results: results,
              currentIndex: nextIndex
            }));
          }
        }

        return true;
      },

      findPrevious: () => ({ tr, dispatch }) => {
        const { results, currentIndex } = this.storage;
        if (results.length === 0) return false;

        const prevIndex = currentIndex - 1 < 0 ? results.length - 1 : currentIndex - 1;
        this.storage.currentIndex = prevIndex;

        const result = results[prevIndex];
        if (result) {
          this.editor.commands.setTextSelection({ from: result.from, to: result.to });

          // Trigger decoration update
          if (dispatch) {
            dispatch(tr.setMeta(findReplacePluginKey, {
              type: 'update',
              results: results,
              currentIndex: prevIndex
            }));
          }
        }

        return true;
      },
      
      replaceCurrent: () => ({ tr, dispatch, state }) => {
        const { results, currentIndex, replaceTerm } = this.storage;
        if (results.length === 0 || currentIndex === -1) return false;

        const result = results[currentIndex];
        if (!result) return false;

        const newTr = tr.insertText(replaceTerm, result.from, result.to);

        if (dispatch) {
          dispatch(newTr);
        }

        // Update results after replacement
        setTimeout(() => {
          this.editor.commands.updateFindResults();
        }, 0);

        return true;
      },
      replaceAll: () => ({ tr, dispatch, state }) => {
        const { results, replaceTerm } = this.storage;
        if (results.length === 0) return false;

        let newTr = tr;
        // Process replacements in reverse order to maintain positions
        for (let i = results.length - 1; i >= 0; i--) {
          const result = results[i];
          newTr = newTr.insertText(replaceTerm, result.from, result.to);
        }

        if (dispatch) {
          dispatch(newTr);
        }

        // Clear results after replace all
        setTimeout(() => {
          this.storage.results = [];
          this.storage.currentIndex = -1;
        }, 0);

        return true;
      },
      clearSearch: () => ({ tr, dispatch }) => {
        this.storage.searchTerm = '';
        this.storage.results = [];
        this.storage.currentIndex = -1;

        if (dispatch) {
          dispatch(tr.setMeta(findReplacePluginKey, { type: 'clear' }));
        }

        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const extension = this; // Capture the extension instance

    return [
      new Plugin({
        key: findReplacePluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, decorationSet) {
            const meta = tr.getMeta(findReplacePluginKey);

            if (meta?.type === 'clear') {
              return DecorationSet.empty;
            }

            if (meta?.type === 'update') {
              const storage = extension.storage; // Use captured extension reference
              const decorations = meta.results.map((result: any, index: number) => {
                const isCurrentMatch = index === storage.currentIndex;
                return Decoration.inline(result.from, result.to, {
                  class: isCurrentMatch ? 'find-replace-current' : 'find-replace-match',
                });
              });

              return DecorationSet.create(tr.doc, decorations);
            }

            return decorationSet.map(tr.mapping, tr.doc);
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: {
          class: {
            default: null,
            parseHTML: element => element.getAttribute('class'),
            renderHTML: attributes => {
              if (!attributes.class) return {};
              return { class: attributes.class };
            },
          },
        },
      },
    ];
  },
});