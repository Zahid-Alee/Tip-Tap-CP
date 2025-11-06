import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { clamp, isNumber } from "lodash-es";

import "./image.scss";

export const IMAGE_MAX_SIZE = 1200;
export const IMAGE_MIN_SIZE = 100;
export const IMAGE_THROTTLE_WAIT_TIME = 8;

interface Size {
  width: number;
  height: number;
}

const ResizeDirection = {
  TOP_LEFT: "tl",
  TOP_RIGHT: "tr",
  BOTTOM_LEFT: "bl",
  BOTTOM_RIGHT: "br",
};

export function ResizableImageView(props: any) {
  const [maxSize, setMaxSize] = useState<Size>({
    width: IMAGE_MAX_SIZE,
    height: IMAGE_MAX_SIZE,
  });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [resizing, setResizing] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastUpdate = useRef<number>(0);
  const [resizerState, setResizerState] = useState({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    dir: "",
  });

  const resizeDirections: string[] = [
    ResizeDirection.TOP_LEFT,
    ResizeDirection.TOP_RIGHT,
    ResizeDirection.BOTTOM_LEFT,
    ResizeDirection.BOTTOM_RIGHT,
  ];

  const { align, inline } = props?.node?.attrs;
  const float = props?.node?.attrs?.float || null;
  const caption: string | null = props?.node?.attrs?.caption || null;
  const isEditable = !!props?.editor?.view?.editable;

  const imgAttrs = useMemo(() => {
    const { src, alt, width: w, height: h, flipX, flipY } = props?.node?.attrs;
    const width = isNumber(w) ? `${w}px` : w;
    const height = isNumber(h) ? `${h}px` : h;
    const transformStyles: string[] = [];
    if (flipX) transformStyles.push("rotateX(180deg)");
    if (flipY) transformStyles.push("rotateY(180deg)");
    const transform = transformStyles.join(" ");
    return {
      src: src || undefined,
      alt: alt || undefined,
      style: {
        width: width || undefined,
        height: height || undefined,
        transform: transform || "none",
      },
    };
  }, [props?.node?.attrs]);

  const imageMaxStyle = useMemo(() => {
    const {
      style: { width },
    } = imgAttrs as any;
    return { width: width === "100%" ? width : undefined };
  }, [imgAttrs]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const target = e.target as HTMLImageElement;
    setOriginalSize({
      width: target.naturalWidth,
      height: target.naturalHeight,
    });
  }

  function selectImage() {
    if (!isEditable) return; // prevent selection in read-only mode
    const { editor, getPos } = props;
    const pos = getPos();
    if (pos !== undefined) {
      editor.commands.setNodeSelection(pos);
    }
  }

  const getMaxSize = useCallback(() => {
    const { editor } = props;
    const { width } = getComputedStyle(editor.view.dom);
    setMaxSize((prev) => ({ ...prev, width: Number.parseInt(width, 10) }));
  }, [props?.editor]);

  function onMouseDown(e: React.MouseEvent, dir: string) {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    const originalWidth = originalSize.width;
    const originalHeight = originalSize.height;
    const aspectRatio = originalWidth / originalHeight;
    let width = Number(props.node.attrs.width);
    let height = Number(props.node.attrs.height);
    const maxWidth = maxSize.width;
    if (width && !height) {
      width = width > maxWidth ? maxWidth : width;
      height = Math.round(width / aspectRatio);
    } else if (height && !width) {
      width = Math.round(height * aspectRatio);
      width = width > maxWidth ? maxWidth : width;
    } else if (!width && !height) {
      width = originalWidth > maxWidth ? maxWidth : originalWidth;
      height = Math.round(width / aspectRatio);
    } else {
      width = width > maxWidth ? maxWidth : width;
    }
    setResizing(true);
    setResizerState({ x: e.clientX, y: e.clientY, w: width, h: height, dir });
  }

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing) return;
      e.preventDefault();
      e.stopPropagation();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const now = Date.now();
        if (now - lastUpdate.current < IMAGE_THROTTLE_WAIT_TIME) return;
        lastUpdate.current = now;
        const { x, w, dir } = resizerState;
        const dx = (e.clientX - x) * (/l/.test(dir) ? -1 : 1);
        const width = clamp(w + dx, IMAGE_MIN_SIZE, maxSize.width);
        props.updateAttributes({ width, height: null });
      });
    },
    [resizing, resizerState, maxSize.width, props]
  );

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!resizing) return;
      e.preventDefault();
      e.stopPropagation();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setResizerState({ x: 0, y: 0, w: 0, h: 0, dir: "" });
      setResizing(false);
      selectImage();
    },
    [resizing]
  );

  useEffect(() => {
    if (resizing) {
      document.addEventListener("mousemove", onMouseMove, { passive: false });
      document.addEventListener("mouseup", onMouseUp, { passive: false });
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [resizing, onMouseMove, onMouseUp]);

  useEffect(() => {
    const resizeOb = new ResizeObserver(getMaxSize);
    resizeOb.observe(props.editor.view.dom);
    return () => resizeOb.disconnect();
  }, [getMaxSize, props.editor.view.dom]);

  return (
    <NodeViewWrapper
      as={inline ? "span" : "div"}
      className="image-view"
      style={{
        ...imageMaxStyle,
        textAlign: float ? undefined : align,
        display: inline ? "inline" : "block",
        float: float || undefined,
        marginRight: float === "left" ? "1rem" : undefined,
        marginLeft: float === "right" ? "1rem" : undefined,
        marginBottom: float ? "0.5rem" : undefined,
      }}
    >
      <div
        data-drag-handle={isEditable ? true : undefined}
        draggable={isEditable ? "true" : undefined}
        style={imageMaxStyle}
        className={`image-view__body ${
          props?.selected && isEditable ? "image-view__body--focused" : ""
        } ${resizing ? "image-view__body--resizing" : ""}`}
      >
        <img
          alt={imgAttrs.alt}
          className="image-view__body__image block"
          height="auto"
          onClick={selectImage}
          onLoad={onImageLoad}
          src={imgAttrs.src}
          style={imgAttrs.style}
        />

        {!isEditable && caption && (
          <p
            style={imgAttrs.style}
            className="text-xs  text-gray-500 text-center !mt-[0px] italic"
          >
            {caption}
          </p>
        )}

        {isEditable && (props?.selected || resizing) && (
          <div className="image-resizer">
            {resizeDirections.map((direction) => (
              <span
                className={`image-resizer__handler image-resizer__handler--${direction}`}
                key={`image-dir-${direction}`}
                onMouseDown={(e) => onMouseDown(e, direction)}
              />
            ))}
          </div>
        )}

        {isEditable && (
          <div
            className="image-view__caption-wrapper"
            // onClick={(e) => e.stopPropagation()}
            style={imgAttrs.style}
          >
            <p className="text-xs text-gray-500 text-center !mt-[0px] italic">
              {caption}
            </p>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}
