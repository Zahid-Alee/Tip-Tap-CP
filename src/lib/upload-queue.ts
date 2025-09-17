interface UploadTask {
  id: string;
  file: File;
  onProgress: (event: { progress: number }) => void;
  onComplete: (url: string) => void;
  onError: (error: Error) => void;
  uploadFunction: (
    file: File,
    onProgress: (event: { progress: number }) => void,
    abortSignal: AbortSignal
  ) => Promise<string>;
  abortController: AbortController;
}

class UploadQueueManager {
  private queue: UploadTask[] = [];
  private isProcessing = false;
  private currentTask: UploadTask | null = null;

  /**
   * Add an upload task to the queue
   */
  addToQueue(
    file: File,
    uploadFunction: (
      file: File,
      onProgress: (event: { progress: number }) => void,
      abortSignal: AbortSignal
    ) => Promise<string>,
    onProgress: (event: { progress: number }) => void,
    onComplete: (url: string) => void,
    onError: (error: Error) => void
  ): string {
    const taskId = `upload_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const abortController = new AbortController();

    const task: UploadTask = {
      id: taskId,
      file,
      onProgress,
      onComplete,
      onError,
      uploadFunction,
      abortController,
    };

    this.queue.push(task);

    // Start processing if not already processing
    if (!this.isProcessing) {
      this.processQueue();
    }

    return taskId;
  }

  /**
   * Process the upload queue one by one
   */
  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) continue;

      this.currentTask = task;

      try {
        // Show queued status if there were items before this one
        if (this.queue.length > 0) {
          task.onProgress({ progress: 0 });
        }

        // Execute the upload
        const url = await task.uploadFunction(
          task.file,
          task.onProgress,
          task.abortController.signal
        );

        if (!task.abortController.signal.aborted) {
          task.onComplete(url);
        }
      } catch (error) {
        if (!task.abortController.signal.aborted) {
          task.onError(
            error instanceof Error ? error : new Error("Upload failed")
          );
        }
      }

      this.currentTask = null;

      // Small delay between uploads to prevent overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  /**
   * Cancel a specific upload task
   */
  cancelUpload(taskId: string): boolean {
    // Cancel if it's the current task
    if (this.currentTask && this.currentTask.id === taskId) {
      this.currentTask.abortController.abort();
      return true;
    }

    // Remove from queue if not started yet
    const taskIndex = this.queue.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      const task = this.queue[taskIndex];
      task.abortController.abort();
      this.queue.splice(taskIndex, 1);
      return true;
    }

    return false;
  }

  /**
   * Cancel all uploads
   */
  cancelAll() {
    // Cancel current task
    if (this.currentTask) {
      this.currentTask.abortController.abort();
      this.currentTask = null;
    }

    // Cancel all queued tasks
    this.queue.forEach((task) => {
      task.abortController.abort();
    });

    this.queue = [];
    this.isProcessing = false;
  }

  /**
   * Get queue status
   */
  getStatus() {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.queue.length,
      currentTaskId: this.currentTask?.id || null,
    };
  }

  /**
   * Get position of a task in queue
   */
  getTaskPosition(taskId: string): number {
    if (this.currentTask && this.currentTask.id === taskId) {
      return 0; // Currently processing
    }

    const index = this.queue.findIndex((task) => task.id === taskId);
    return index === -1 ? -1 : index + 1; // +1 because current task is position 0
  }
}

// Create a singleton instance
export const uploadQueue = new UploadQueueManager();

// Export types for use in components
export type { UploadTask };
