import { createRoot } from "react-dom/client";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { useEffect, useRef, useState } from "react";
import EditorLoader from "./components/tiptap-ui/Loader/EditorLoader";

const getCsrfToken = () => {
  const metaTag = document.querySelector('meta[name="csrf-token"]');
  return metaTag ? metaTag.getAttribute("content") : null;
};

const App = () => {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState({
    loadUrl: null,
    saveUrl: 'null',
    headers: {
      "X-CSRF-TOKEN": getCsrfToken(),
    },
    readOnly: false,
    initialContent: `loading editor`,
    title: "My Text Lecture",
    translations: [],
    editorId: "",
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
      editorId={config.editorId}
      onReady={handleEditorReady}
      title={config.title}
      translations={config.translations}
    />
  );
};

const container = window?.shadowEditorRoot || document.getElementById("root");
createRoot(container).render(<App />);

// import { createRoot } from "react-dom/client";
// import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
// import { useEffect, useRef, useState } from "react";
// import EditorLoader from "./components/tiptap-ui/Loader/EditorLoader";

// const getCsrfToken = () => {
//   const metaTag = document.querySelector('meta[name="csrf-token"]');
//   return metaTag ? metaTag.getAttribute("content") : null;
// };

// const App = () => {
//   const [mounted, setMounted] = useState(false);
//   const [config, setConfig] = useState({
//     loadUrl: null,
//     saveUrl: null,
//     headers: {
//       "X-CSRF-TOKEN": getCsrfToken(),
//     },
//     readOnly: false,
//     initialContent: `<header>
//   <h1>Cyber security introduction</h1>
//   <p>Welcome to the world of cyber security! In this lecture, we'll explore the fundamental concepts that underpin the protection of digital assets.</p>
// </header>`,
//     title: "My Text Lecture",
//     translations: [],
//     editorId: "",
//   });

//   const [isInitialized, setIsInitialized] = useState(false);
//   const editorRef = useRef(null);
//   const configReceivedRef = useRef(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   // Handles iframe OR Shadow DOM config delivery
//   useEffect(() => {
//     const handleMessage = (event) => {
//       if (event.data && event.data.type === "EDITOR_CONFIG") {
//         setConfig((prev) => ({ ...prev, ...event.data.config }));
//         configReceivedRef.current = true;
//         event.source?.postMessage(
//           { type: "EDITOR_CONFIG_RECEIVED" },
//           event.origin
//         );
//       }
//     };

//     const handleCustomShadowConfig = (e) => {
//       const shadowConfig = e.detail;
//       if (shadowConfig) {
//         setConfig((prev) => ({ ...prev, ...shadowConfig }));
//         configReceivedRef.current = true;

//         // Optional: Notify host that config was received
//         window.dispatchEvent(new CustomEvent("EDITOR_CONFIG_RECEIVED"));
//       }
//     };

//     window.addEventListener("message", handleMessage); // iframe
//     window.addEventListener("shadow-editor-config", handleCustomShadowConfig); // shadow root

//     // Notify parent (iframe or shadow root host) that the editor is ready
//     setTimeout(() => {
//       window.parent?.postMessage?.({ type: "EDITOR_READY" }, "*");
//       window.dispatchEvent?.(new CustomEvent("EDITOR_READY"));
//     }, 500);

//     return () => {
//       window.removeEventListener("message", handleMessage);
//       window.removeEventListener(
//         "shadow-editor-config",
//         handleCustomShadowConfig
//       );
//     };
//   }, []);

//   useEffect(() => {
//     if (isInitialized && editorRef.current && configReceivedRef.current) {
//       editorRef.current.setContent(config.initialContent);
//     }
//   }, [isInitialized, config.initialContent]);

//   const notify = (type, data) => {
//     window.parent?.postMessage?.({ type, data }, "*"); // iframe
//     window.dispatchEvent?.(new CustomEvent(type, { detail: data })); // shadow DOM
//   };

//   const handleSaveSuccess = (data) => notify("EDITOR_SAVE_SUCCESS", data);
//   const handleSaveError = (error) =>
//     notify("EDITOR_SAVE_ERROR", { error: error.message });
//   const handleLoadSuccess = () => {
//     notify("EDITOR_LOAD_SUCCESS");
//     setIsInitialized(true);
//   };
//   const handleLoadError = (error) =>
//     notify("EDITOR_LOAD_ERROR", { error: error.message });

//   const handleEditorReady = () => {
//     setIsInitialized(true);
//     if (configReceivedRef.current && editorRef.current) {
//       editorRef.current.setContent(config.initialContent);
//     }
//   };

//   if (!config.saveUrl) return <EditorLoader />;

//   return (
//     <SimpleEditor
//       ref={editorRef}
//       saveUrl={config.saveUrl}
//       headers={config.headers}
//       onSaveSuccess={handleSaveSuccess}
//       onSaveError={handleSaveError}
//       onLoadSuccess={handleLoadSuccess}
//       onLoadError={handleLoadError}
//       initialContent={config.initialContent}
//       readOnlyValue={config.readOnly}
//       editorId={config.editorId}
//       onReady={handleEditorReady}
//       title={config.title}
//       translations={config.translations}
//     />
//   );
// };

// // Shadow root aware mounting
// const container =
//   window.shadowEditorRoot ||
//   document.getElementById("editor-root") ||
//   document.getElementById("root");
// createRoot(container).render(<App />);
