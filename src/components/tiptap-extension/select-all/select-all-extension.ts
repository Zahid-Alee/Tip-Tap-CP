import { Extension } from '@tiptap/core'

// Option 1: Create a custom extension
const SelectAllExtension = Extension.create({
    name: 'selectAll',

    addKeyboardShortcuts() {
        return {
            'Mod-a': () => {
                const { state, dispatch } = this.editor.view
                const { doc } = state

                // Select all content in the editor
                const selection = state.selection.constructor.create(doc, 0, doc.content.size)
                dispatch(state.tr.setSelection(selection))

                return true // Prevent default browser behavior
            }
        }
    }
})
export default SelectAllExtension;