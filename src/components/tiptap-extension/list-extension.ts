import { Extension } from '@tiptap/core'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'

export interface ExtendedListOptions {
    HTMLAttributes: Record<string, any>
    allowCustomMarkers: boolean
    enableKeyboardShortcuts: boolean
}

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        extendedList: {
            /**
             * Toggle an extended list with custom styling
             */
            toggleExtendedList: (listType: string, attributes?: Record<string, any>) => ReturnType
            /**
             * Set list style type
             */
            setListStyleType: (listType: string, styleType: string) => ReturnType
        }
    }
}

export const ExtendedListExtension = Extension.create<ExtendedListOptions>({
    name: 'extendedList',

    addOptions() {
        return {
            HTMLAttributes: {},
            allowCustomMarkers: true,
            enableKeyboardShortcuts: true,
        }
    },

    addCommands() {
        return {
            toggleExtendedList: (listType: string, attributes = {}) => ({ commands, editor }) => {
                const { selection } = editor.state
                const { $from } = selection

                // Find if we're already in a list
                let depth = $from.depth
                let currentListNode = null
                let currentListType = null

                while (depth > 0) {
                    const node = $from.node(depth)
                    if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
                        currentListNode = node
                        currentListType = node.type.name
                        break
                    }
                    depth--
                }

                // If we're in the same list type with same attributes, toggle off
                if (currentListNode && currentListType === listType) {
                    const currentAttrs = currentListNode.attrs || {}
                    const isSameStyle = Object.keys(attributes).every(key =>
                        currentAttrs[key] === attributes[key]
                    )

                    if (isSameStyle) {
                        return listType === 'bulletList'
                            ? commands.toggleBulletList()
                            : commands.toggleOrderedList()
                    }
                }

                // Apply the list with custom attributes
                const success = listType === 'bulletList'
                    ? commands.toggleBulletList()
                    : commands.toggleOrderedList()

                if (success && Object.keys(attributes).length > 0) {
                    return commands.updateAttributes(listType, attributes)
                }

                return success
            },

            setListStyleType: (listType: string, styleType: string) => ({ commands }) => {
                return commands.updateAttributes(listType, {
                    listStyleType: styleType,
                    style: `list-style-type: ${styleType};`,
                    'data-list-type': listType,
                })
            },
        }
    },

    // addKeyboardShortcuts() {
    //     if (!this.options.enableKeyboardShortcuts) {
    //         return {}
    //     }

    //     return {
    //         'Mod-Shift-a': () => this.editor.commands.toggleExtendedList('orderedList', {
    //             listStyleType: 'lower-alpha',
    //             style: 'list-style-type: lower-alpha;',
    //             'data-list-type': 'alphabetList',
    //         }),
    //         'Mod-Alt-a': () => this.editor.commands.toggleExtendedList('orderedList', {
    //             listStyleType: 'upper-alpha',
    //             style: 'list-style-type: upper-alpha;',
    //             'data-list-type': 'upperAlphabetList',
    //         }),
    //         'Mod-Shift-r': () => this.editor.commands.toggleExtendedList('orderedList', {
    //             listStyleType: 'lower-roman',
    //             style: 'list-style-type: lower-roman;',
    //             'data-list-type': 'lowerRomanList',
    //         }),
    //         'Mod-Alt-Shift-r': () => this.editor.commands.toggleExtendedList('orderedList', {
    //             listStyleType: 'upper-roman',
    //             style: 'list-style-type: upper-roman;',
    //             'data-list-type': 'upperRomanList',
    //         }),
    //         'Mod-Shift-s': () => this.editor.commands.toggleExtendedList('bulletList', {
    //             listStyleType: 'square',
    //             style: 'list-style-type: square;',
    //             'data-list-type': 'squareList',
    //         }),
    //         'Mod-Shift-o': () => this.editor.commands.toggleExtendedList('bulletList', {
    //             listStyleType: 'circle',
    //             style: 'list-style-type: circle;',
    //             'data-list-type': 'circleList',
    //         }),
    //     }
    // },

    addGlobalAttributes() {
        return [
            {
                types: ['bulletList', 'orderedList'],
                attributes: {
                    listStyleType: {
                        default: null,
                        parseHTML: element => element.style.listStyleType || element.getAttribute('data-list-style-type'),
                        renderHTML: attributes => {
                            if (!attributes.listStyleType) {
                                return {}
                            }
                            return {
                                style: `list-style-type: ${attributes.listStyleType};`,
                                'data-list-style-type': attributes.listStyleType,
                            }
                        },
                    },
                    'data-list-type': {
                        default: null,
                        parseHTML: element => element.getAttribute('data-list-type'),
                        renderHTML: attributes => {
                            if (!attributes['data-list-type']) {
                                return {}
                            }
                            return {
                                'data-list-type': attributes['data-list-type'],
                            }
                        },
                    },
                },
            },
        ]
    },

    onCreate() {
        // this.addCustomStyles()
    },

    addCustomStyles() {
        const styleId = 'extended-list-styles'

        // Remove existing styles if they exist
        const existingStyle = document.getElementById(styleId)
        if (existingStyle) {
            existingStyle.remove()
        }

        // Add new styles
        const style = document.createElement('style')
        style.id = styleId
        style.textContent = `
            /* Standard list styles with custom colors */
            .ProseMirror ul[data-list-type="squareList"] {
                list-style-type: square;
            }
            
            .ProseMirror ul[data-list-type="squareList"] li::marker {
                color: #8b5cf6;
            }
            
            .ProseMirror ul[data-list-type="circleList"] {
                list-style-type: circle;
            }
            
            .ProseMirror ul[data-list-type="circleList"] li::marker {
                color: #06b6d4;
            }
            
            /* Ordered list custom styles */
            .ProseMirror ol[data-list-type="alphabetList"] {
                list-style-type: lower-alpha;
            }
            
            .ProseMirror ol[data-list-type="upperAlphabetList"] {
                list-style-type: upper-alpha;
            }
            
            .ProseMirror ol[data-list-type="lowerRomanList"] {
                list-style-type: lower-roman;
            }
            
            .ProseMirror ol[data-list-type="upperRomanList"] {
                list-style-type: upper-roman;
            }
            
            /* Hover effects for standard markers */
            .ProseMirror ul[data-list-type] li:hover::marker {
                transform: scale(1.1);
                transition: transform 0.2s ease;
            }
            
            .ProseMirror ol[data-list-type] li:hover::marker {
                font-weight: bold;
                transition: font-weight 0.2s ease;
            }
        `
        document.head.appendChild(style)
    },

    onDestroy() {
        // Clean up styles when extension is destroyed
        const styleId = 'extended-list-styles'
        const existingStyle = document.getElementById(styleId)
        if (existingStyle) {
            existingStyle.remove()
        }
    },
})

// Enhanced BulletList extension with custom attributes
export const ExtendedBulletList = BulletList.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            listStyleType: {
                default: null,
                parseHTML: element => element.style.listStyleType || element.getAttribute('data-list-style-type'),
                renderHTML: attributes => {
                    if (!attributes.listStyleType) {
                        return {}
                    }
                    return {
                        style: `list-style-type: ${attributes.listStyleType};`,
                        'data-list-style-type': attributes.listStyleType,
                    }
                },
            },
            'data-list-type': {
                default: null,
                parseHTML: element => element.getAttribute('data-list-type'),
                renderHTML: attributes => {
                    if (!attributes['data-list-type']) {
                        return {}
                    }
                    return {
                        'data-list-type': attributes['data-list-type'],
                    }
                },
            },
        }
    },
})

// Enhanced OrderedList extension with custom attributes
export const ExtendedOrderedList = OrderedList.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            listStyleType: {
                default: null,
                parseHTML: element => element.style.listStyleType || element.getAttribute('data-list-style-type'),
                renderHTML: attributes => {
                    if (!attributes.listStyleType) {
                        return {}
                    }
                    return {
                        style: `list-style-type: ${attributes.listStyleType};`,
                        'data-list-style-type': attributes.listStyleType,
                    }
                },
            },
            'data-list-type': {
                default: null,
                parseHTML: element => element.getAttribute('data-list-type'),
                renderHTML: attributes => {
                    if (!attributes['data-list-type']) {
                        return {}
                    }
                    return {
                        'data-list-type': attributes['data-list-type'],
                    }
                },
            },
            start: {
                default: 1,
                parseHTML: element => {
                    const start = element.getAttribute('start')
                    return start ? parseInt(start, 10) : 1
                },
                renderHTML: attributes => {
                    if (attributes.start === 1) {
                        return {}
                    }
                    return {
                        start: attributes.start,
                    }
                },
            },
        }
    },
})

export default ExtendedListExtension