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
    saveUrl: "null",
    headers: {
      "X-CSRF-TOKEN": getCsrfToken(),
    },
    readOnly: false,
    initialContent: `loading editor... Welcome to Your Editor

This editor is designed to help you write with clarity, structure, and a bit of creativity. Here’s what you can do:





Bold and italic your text to emphasize important point



Use inline code or full code blocks for technical content

Example Code Block

        
            function greet(name) {
            return Hello,;
            }
            console.log(greet("World"));
        
        





Include 😊 emojis to express yourself



Let the editor help generate content ideas or finish sentences ✨

Enjoy writing!

Welcome to Your Editor

This editor is designed to help you write with clarity, structure, and a bit of creativity. Here’s what you can do:





Bold and italic your text to emphasize important point



Use inline code or full code blocks for technical content

Example Code Block

        
            function greet(name) {
            return Hello,;
            }
            console.log(greet("World"));
        
        





Include 😊 emojis to express yourself



Let the editor help generate content ideas or finish sentences ✨

Enjoy writing!

Welcome to Your Editor

This editor is designed to help you write with clarity, structure, and a bit of creativity. Here’s what you can do:





Bold and italic your text to emphasize important point



Use inline code or full code blocks for technical content

Example Code Block

        
            function greet(name) {
            return Hello,;
            }
            console.log(greet("World"));
        
        





Include 😊 emojis to express yourself



Let the editor help generate content ideas or finish sentences ✨

Enjoy writing!

Welcome to Your Editor

This editor is designed to help you write with clarity, structure, and a bit of creativity. Here’s what you can do:





Bold and italic your text to emphasize important point



Use inline code or full code blocks for technical content

Example Code Block

        
            function greet(name) {
            return Hello,;
            }
            console.log(greet("World"));
        
        
const observer = new ResizeObserver(() => {
    sendHeightToParent();
  });

  observer.observe(document.body);

  return () => observer.disconnect();
  const observer = new ResizeObserver(() => {
    sendHeightToParent();
  });

  observer.observe(document.body);

  return () => observer.disconnect();
  const observer = new ResizeObserver(() => {
    sendHeightToParent();
  });

  observer.observe(document.body);

  return () => observer.disconnect();
  const observer = new ResizeObserver(() => {
    sendHeightToParent();
  });

  observer.observe(document.body);

  return () => observer.disconnect();




Include 😊 emojis to express yourself



Let the editor help generate content ideas or finish sentences ✨

Enjoy writing!`,
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
    const sendHeightToParent = () => {
      const contentWrapper = document.querySelector(".content-wrapper");
      console.log("Content wrapper:", contentWrapper);
      const height = contentWrapper ? contentWrapper.scrollHeight : 200;

      console.log("Sending height to parent:", height);
      // const height = document.body.scrollHeight;
      // console.log("Sending height to parent:", height);
      // window.parent.postMessage({ type: "IFRAME_HEIGHT", height }, "*");
    };

    // const observer = new ResizeObserver(() => {
    // sendHeightToParent();
    // });

    // observer.observe(document.body);

    // return () => observer.disconnect();
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

  console.log("config received", config);

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
