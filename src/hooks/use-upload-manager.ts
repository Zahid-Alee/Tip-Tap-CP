import { useState, useCallback, useRef, useEffect } from "react";

export interface ActiveUpload {
  id: string;
  type: "clipboard" | "drag-drop" | "button" | "url";
  fileName: string;
  progress: number;
  status: "uploading" | "success" | "error";
  startTime: number;
}

class UploadManager {
  private activeUploads = new Map<string, ActiveUpload>();
  private listeners = new Set<() => void>();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  getActiveUploads(): ActiveUpload[] {
    return Array.from(this.activeUploads.values());
  }

  hasActiveUpload(): boolean {
    return Array.from(this.activeUploads.values()).some(
      (upload) => upload.status === "uploading"
    );
  }

  startUpload(upload: Omit<ActiveUpload, "id" | "startTime">): string {
    // Check if there's already an active upload
    if (this.hasActiveUpload()) {
      throw new Error(
        "Another image is currently uploading. Please wait for it to complete."
      );
    }

    const id = `upload_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const activeUpload: ActiveUpload = {
      ...upload,
      id,
      startTime: Date.now(),
    };

    this.activeUploads.set(id, activeUpload);
    this.notify();
    return id;
  }

  updateUpload(
    id: string,
    updates: Partial<Pick<ActiveUpload, "progress" | "status">>
  ) {
    const upload = this.activeUploads.get(id);
    if (!upload) return;

    const updatedUpload = { ...upload, ...updates };
    this.activeUploads.set(id, updatedUpload);
    this.notify();

    // Auto-cleanup successful or failed uploads after 3 seconds
    if (updates.status === "success" || updates.status === "error") {
      setTimeout(() => {
        this.removeUpload(id);
      }, 3000);
    }
  }

  removeUpload(id: string) {
    this.activeUploads.delete(id);
    this.notify();
  }

  cancelUpload(id: string) {
    const upload = this.activeUploads.get(id);
    if (upload) {
      this.updateUpload(id, { status: "error" });
    }
  }

  // Emergency cleanup - remove all uploads
  clearAll() {
    this.activeUploads.clear();
    this.notify();
  }

  // Get upload by type
  getUploadsByType(type: ActiveUpload["type"]): ActiveUpload[] {
    return this.getActiveUploads().filter((upload) => upload.type === type);
  }

  // Check if specific type has active upload
  hasActiveUploadOfType(type: ActiveUpload["type"]): boolean {
    return this.getUploadsByType(type).some(
      (upload) => upload.status === "uploading"
    );
  }
}

// Singleton instance
const uploadManager = new UploadManager();

/**
 * Hook to manage image upload state across the entire editor
 */
export function useUploadManager() {
  const [, forceUpdate] = useState({});
  const rerender = useCallback(() => forceUpdate({}), []);

  useEffect(() => {
    const unsubscribe = uploadManager.subscribe(rerender);
    return unsubscribe;
  }, [rerender]);

  const startUpload = useCallback(
    (upload: Omit<ActiveUpload, "id" | "startTime">) => {
      try {
        return uploadManager.startUpload(upload);
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const updateUpload = useCallback(
    (
      id: string,
      updates: Partial<Pick<ActiveUpload, "progress" | "status">>
    ) => {
      uploadManager.updateUpload(id, updates);
    },
    []
  );

  const removeUpload = useCallback((id: string) => {
    uploadManager.removeUpload(id);
  }, []);

  const cancelUpload = useCallback((id: string) => {
    uploadManager.cancelUpload(id);
  }, []);

  return {
    activeUploads: uploadManager.getActiveUploads(),
    hasActiveUpload: uploadManager.hasActiveUpload(),
    hasActiveUploadOfType:
      uploadManager.hasActiveUploadOfType.bind(uploadManager),
    startUpload,
    updateUpload,
    removeUpload,
    cancelUpload,
    clearAll: uploadManager.clearAll.bind(uploadManager),
  };
}

/**
 * Hook for components that need to check if uploads are active but don't need full state
 */
export function useUploadState() {
  const [, forceUpdate] = useState({});
  const rerender = useCallback(() => forceUpdate({}), []);

  useEffect(() => {
    const unsubscribe = uploadManager.subscribe(rerender);
    return unsubscribe;
  }, [rerender]);

  return {
    hasActiveUpload: uploadManager.hasActiveUpload(),
    hasActiveUploadOfType:
      uploadManager.hasActiveUploadOfType.bind(uploadManager),
    activeUploadsCount: uploadManager.getActiveUploads().length,
  };
}

export default uploadManager;
