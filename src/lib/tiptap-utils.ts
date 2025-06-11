import { Selection } from "@tiptap/pm/state"

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  JSONContent,
  Editor,
  isTextSelection,
  isNodeSelection,
  posToDOMRect,
} from "@tiptap/react"

export const COLLAB_DOC_PREFIX =
  import.meta.env.NEXT_PUBLIC_COLLAB_DOC_PREFIX || ""
export const TIPTAP_COLLAB_APP_ID =
  import.meta.env.NEXT_PUBLIC_TIPTAP_COLLAB_APP_ID || ""
export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export type OverflowPosition = "none" | "top" | "bottom" | "both"

/**
 * Utility function to get URL parameters
 */
export const getUrlParam = (param: string): string | null => {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  return params.get(param)
}

/**
 * Checks if a mark exists in the editor schema
 *
 * @param markName - The name of the mark to check
 * @param editor - The editor instance
 */
export const isMarkInSchema = (markName: string, editor: Editor | null) =>
  editor?.schema.spec.marks.get(markName) !== undefined

/**
 * Checks if a node exists in the editor schema
 *
 * @param nodeName - The name of the node to check
 * @param editor - The editor instance
 */
export const isNodeInSchema = (nodeName: string, editor: Editor | null) =>
  editor?.schema.spec.nodes.get(nodeName) !== undefined

/**
 * Removes empty paragraph nodes from content
 *
 * @param content - The JSON content to clean
 */
export const removeEmptyParagraphs = (content: JSONContent) => ({
  ...content,
  content: content.content?.filter(
    (node) =>
      node.type !== "paragraph" ||
      node.content?.some((child) => child.text?.trim() || child.type !== "text")
  ),
})

/**
 * Determines how a target element overflows relative to a container element
 *
 * @param targetElement - The element being checked for overflow
 * @param containerElement - The container element that might be overflowed
 */
export function getElementOverflowPosition(
  targetElement: Element,
  containerElement: HTMLElement
): OverflowPosition {
  const targetBounds = targetElement.getBoundingClientRect()
  const containerBounds = containerElement.getBoundingClientRect()

  const isOverflowingTop = targetBounds.top < containerBounds.top
  const isOverflowingBottom = targetBounds.bottom > containerBounds.bottom

  if (isOverflowingTop && isOverflowingBottom) return "both"
  if (isOverflowingTop) return "top"
  if (isOverflowingBottom) return "bottom"
  return "none"
}

/**
 * Checks if the current selection is valid for a given editor
 *
 * @param editor - The editor instance
 * @param selection - The current selection
 * @param excludedNodeTypes - An array of node types to exclude from the selection check
 */
export const isSelectionValid = (
  editor: Editor | null,
  selection?: Selection,
  excludedNodeTypes: string[] = ["imageUpload"]
): boolean => {
  if (!editor) return false
  if (!selection) selection = editor.state.selection

  const { state } = editor
  const { doc } = state
  const { empty, from, to } = selection

  const isEmptyTextBlock =
    !doc.textBetween(from, to).length && isTextSelection(selection)
  const isCodeBlock =
    selection.$from.parent.type.spec.code ||
    (isNodeSelection(selection) && selection.node.type.spec.code)
  const isExcludedNode =
    isNodeSelection(selection) &&
    excludedNodeTypes.includes(selection.node.type.name)

  return !empty && !isEmptyTextBlock && !isCodeBlock && !isExcludedNode
}

/**
 * Gets the bounding rect of the current selection in the editor.
 *
 * @param editor - The editor instance
 */
export const getSelectionBoundingRect = (editor: Editor): DOMRect | null => {
  const { state } = editor.view
  const { selection } = state
  const { ranges } = selection

  const from = Math.min(...ranges.map((range) => range.$from.pos))
  const to = Math.max(...ranges.map((range) => range.$to.pos))

  if (isNodeSelection(selection)) {
    const node = editor.view.nodeDOM(from) as HTMLElement
    if (node) {
      return node.getBoundingClientRect()
    }
  }

  return posToDOMRect(editor.view, from, to)
}

/**
 * Generates a deterministic avatar URL from a user name
 */
export const getAvatar = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }

  const randomFraction = (Math.abs(hash) % 1000000) / 1000000
  const id = 1 + Math.floor(randomFraction * 20)

  const idString = id.toString().padStart(2, "0")

  return `/avatars/memoji_${idString}.png`
}

export async function handleImageUpload(
  file: File,
  headers: Record<string, string> = {},
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> {

  if (!file) {
    throw new Error("No file provided");
  }
  const formData = new FormData();
  formData.append("file", file);

  const totalSteps = 10;
  const simulatedDelay = Math.min(200 + file.size / (1024 * 50), 1000);

  for (let i = 1; i <= totalSteps; i++) {
    if (abortSignal?.aborted) {
      throw new Error("Upload cancelled");
    }
    await new Promise((resolve) => setTimeout(resolve, simulatedDelay));
    onProgress?.({ progress: Math.min(i * (100 / totalSteps), 100) });
  }

  const response = await fetch("/api/upload/file", {
    method: "POST",
    headers,
    body: formData,
    signal: abortSignal,
  });

  if (!response.ok) {
    throw new Error("Image upload failed");
  }

  const data = await response.json();
  return data.data;
}


export const convertFileToBase64 = (
  file: File,
  abortSignal?: AbortSignal
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    const abortHandler = () => {
      reader.abort()
      reject(new Error("Upload cancelled"))
    }

    if (abortSignal) {
      abortSignal.addEventListener("abort", abortHandler)
    }

    reader.onloadend = () => {
      if (abortSignal) {
        abortSignal.removeEventListener("abort", abortHandler)
      }

      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert File to base64"))
      }
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Fetch collaboration token from the API
 */
export const fetchCollabToken = async (): Promise<string | null> => {
  try {
    const response = await fetch(`/api/collaboration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch token: ${response.status}`)
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error("Failed to fetch collaboration token:", error)
    return null
  }
}



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


// ****** custom*************

type ShortcutKeyResult = {
  symbol: string
  readable: string
}

export type FileError = {
  file: File | string
  reason: "type" | "size" | "invalidBase64" | "base64NotAllowed"
}

export type FileValidationOptions = {
  allowedMimeTypes: string[]
  maxFileSize?: number
  allowBase64: boolean
}

type FileInput = File | { src: string | File; alt?: string; title?: string }

export const isClient = (): boolean => typeof window !== "undefined"
export const isServer = (): boolean => !isClient()
export const isMacOS = (): boolean =>
  isClient() && window.navigator.platform === "MacIntel"

const shortcutKeyMap: Record<string, ShortcutKeyResult> = {
  mod: isMacOS()
    ? { symbol: "⌘", readable: "Command" }
    : { symbol: "Ctrl", readable: "Control" },
  alt: isMacOS()
    ? { symbol: "⌥", readable: "Option" }
    : { symbol: "Alt", readable: "Alt" },
  shift: { symbol: "⇧", readable: "Shift" },
}

export const getShortcutKey = (key: string): ShortcutKeyResult =>
  shortcutKeyMap[key.toLowerCase()] || { symbol: key, readable: key }

export const getShortcutKeys = (keys: string[]): ShortcutKeyResult[] =>
  keys.map(getShortcutKey)

export const isUrl = (
  text: string,
  options: { requireHostname: boolean; allowBase64?: boolean } = {
    requireHostname: false,
  }
): boolean => {
  if (text.includes("\n")) return false

  try {
    const url = new URL(text)
    const blockedProtocols = [
      "javascript:",
      "file:",
      "vbscript:",
      ...(options.allowBase64 ? [] : ["data:"]),
    ]

    if (blockedProtocols.includes(url.protocol)) return false
    if (options.allowBase64 && url.protocol === "data:")
      return /^data:image\/[a-z]+;base64,/.test(text)
    if (url.hostname) return true

    return (
      url.protocol !== "" &&
      (url.pathname.startsWith("//") || url.pathname.startsWith("http")) &&
      !options.requireHostname
    )
  } catch {
    return false
  }
}

export const sanitizeUrl = (
  url: string | null | undefined,
  options: { allowBase64?: boolean } = {}
): string | undefined => {
  if (!url) return undefined

  if (options.allowBase64 && url.startsWith("data:image")) {
    return isUrl(url, { requireHostname: false, allowBase64: true })
      ? url
      : undefined
  }

  return isUrl(url, {
    requireHostname: false,
    allowBase64: options.allowBase64,
  }) || /^(\/|#|mailto:|sms:|fax:|tel:)/.test(url)
    ? url
    : `https://${url}`
}

export const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  const response = await fetch(blobUrl)
  const blob = await response.blob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert Blob to base64"))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export const randomId = (): string => Math.random().toString(36).slice(2, 11)

export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result)
      } else {
        reject(new Error("Failed to convert File to base64"))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const validateFileOrBase64 = <T extends FileInput>(
  input: File | string,
  options: FileValidationOptions,
  originalFile: T,
  validFiles: T[],
  errors: FileError[]
): void => {
  const { isValidType, isValidSize } = checkTypeAndSize(input, options)

  if (isValidType && isValidSize) {
    validFiles.push(originalFile)
  } else {
    if (!isValidType) errors.push({ file: input, reason: "type" })
    if (!isValidSize) errors.push({ file: input, reason: "size" })
  }
}

const checkTypeAndSize = (
  input: File | string,
  { allowedMimeTypes, maxFileSize }: FileValidationOptions
): { isValidType: boolean; isValidSize: boolean } => {
  const mimeType = input instanceof File ? input.type : base64MimeType(input)
  const size =
    input instanceof File ? input.size : atob(input.split(",")[1]).length

  const isValidType =
    allowedMimeTypes.length === 0 ||
    allowedMimeTypes.includes(mimeType) ||
    allowedMimeTypes.includes(`${mimeType.split("/")[0]}/*`)

  const isValidSize = !maxFileSize || size <= maxFileSize

  return { isValidType, isValidSize }
}

const base64MimeType = (encoded: string): string => {
  const result = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)
  return result && result.length > 1 ? result[1] : "unknown"
}

const isBase64 = (str: string): boolean => {
  if (str.startsWith("data:")) {
    const matches = str.match(/^data:[^;]+;base64,(.+)$/)
    if (matches && matches[1]) {
      str = matches[1]
    } else {
      return false
    }
  }

  try {
    return btoa(atob(str)) === str
  } catch {
    return false
  }
}

export const filterFiles = <T extends FileInput>(
  files: T[],
  options: FileValidationOptions
): [T[], FileError[]] => {
  const validFiles: T[] = []
  const errors: FileError[] = []

  files.forEach((file) => {
    const actualFile = "src" in file ? file.src : file

    if (actualFile instanceof File) {
      validateFileOrBase64(actualFile, options, file, validFiles, errors)
    } else if (typeof actualFile === "string") {
      if (isBase64(actualFile)) {
        if (options.allowBase64) {
          validateFileOrBase64(actualFile, options, file, validFiles, errors)
        } else {
          errors.push({ file: actualFile, reason: "base64NotAllowed" })
        }
      } else {
        if (!sanitizeUrl(actualFile, { allowBase64: options.allowBase64 })) {
          errors.push({ file: actualFile, reason: "invalidBase64" })
        } else {
          validFiles.push(file)
        }
      }
    }
  })

  return [validFiles, errors]
}

