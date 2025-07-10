import { createRoot } from "react-dom/client";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useEffect, useRef, useState } from "react";
import EditorLoader from "./components/tiptap-ui/Loader/EditorLoader";

const getCsrfToken = () => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute("content") : null;
};

const fakeTranslationHistory = [
  {
    title: "English to Spanish",
    text: "<p>Este es el contenido traducido al español.</p>",
    language: "es",
    timestamp: "2025-06-11T10:15:00Z",
    audio: "public/images/file_example_MP3_700KB.mp3",
  },
  {
    title: "English to French",
    text: "<p>Ceci est le contenu traduit en français.</p>",
    language: "fr",
    timestamp: "2025-06-11T10:16:00Z",
  },
  {
    title: "English to German",
    text: "<p>Dies ist der ins Deutsche übersetzte Inhalt.</p>",
    language: "de",
    timestamp: "2025-06-11T10:17:00Z",
  },
  {
    title: "English to Japanese",
    text: "<p>これは日本語に翻訳されたコンテンツです。</p>",
    language: "ja",
    timestamp: "2025-06-11T10:18:00Z",
  },
];

const App = () => {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState({
    loadUrl: null,
    saveUrl: null,
    headers: {
      "X-CSRF-TOKEN": getCsrfToken(),
    },
    readOnly: false,
    initialContent: `loading editor...`,
    title: "My Text Lecture",
    translations: [],
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const editorRef = useRef(null);
  const configReceivedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "EDITOR_CONFIG") {
        setConfig((prevConfig) => ({
          ...prevConfig,
          ...event.data.config,
        }));
        configReceivedRef.current = true;
        event.source.postMessage(
          { type: "EDITOR_CONFIG_RECEIVED" },
          event.origin
        );
      }
    };

    window.addEventListener("message", handleMessage);

    if (window.parent) {
      setTimeout(() => {
        window.parent.postMessage({ type: "EDITOR_READY" }, "*");
      }, 500);
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (isInitialized && editorRef.current && configReceivedRef.current) {
      editorRef.current.setContent(config.initialContent);
    }
  }, [isInitialized, config.initialContent]);

  const handleSaveSuccess = (data) => {
    if (window.parent) {
      window.parent.postMessage({ type: "EDITOR_SAVE_SUCCESS", data }, "*");
    }
  };

  const handleSaveError = (error) => {
    if (window.parent) {
      window.parent.postMessage(
        { type: "EDITOR_SAVE_ERROR", error: error.message },
        "*"
      );
    }
  };

  const handleLoadSuccess = (data) => {
    if (window.parent) {
      window.parent.postMessage({ type: "EDITOR_LOAD_SUCCESS" }, "*");
    }
    setIsInitialized(true);
  };

  const handleLoadError = (error) => {
    if (window.parent) {
      window.parent.postMessage(
        { type: "EDITOR_LOAD_ERROR", error: error.message },
        "*"
      );
    }
  };

  const handleEditorReady = () => {
    setIsInitialized(true);

    if (configReceivedRef.current && editorRef.current) {
      editorRef.current.setContent(config.initialContent);
    }
  };

  if (!config.saveUrl) return <EditorLoader />;

  return (
    <SimpleEditor
      ref={editorRef}
      saveUrl={config.saveUrl}
      headers={config.headers}
      onSaveSuccess={handleSaveSuccess}
      onSaveError={handleSaveError}
      onLoadSuccess={handleLoadSuccess}
      onLoadError={handleLoadError}
      initialContent={config.initialContent}
      readOnlyValue={config.readOnly}
      onReady={handleEditorReady}
      title={config.title}
      translations={config.translations}
    />
  );
};

createRoot(document.getElementById("root")).render(<App />);
