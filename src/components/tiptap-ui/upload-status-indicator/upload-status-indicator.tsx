import * as React from "react";
import { Loader2, X, CheckCircle, AlertCircle } from "lucide-react";
import {
  useUploadManager,
  type ActiveUpload,
} from "../../../hooks/use-upload-manager";
import "./upload-status-indicator.scss";

export interface UploadStatusIndicatorProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  showProgress?: boolean;
}

export const UploadStatusIndicator: React.FC<UploadStatusIndicatorProps> = ({
  position = "top-right",
  showProgress = true,
}) => {
  const { activeUploads, cancelUpload } = useUploadManager();

  if (activeUploads.length === 0) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "uploading":
        return <Loader2 className="animate-spin" size={16} />;
      case "success":
        return <CheckCircle size={16} className="text-green-500" />;
      case "error":
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return <Loader2 size={16} />;
    }
  };

  return (
    <div
      className={`upload-status-indicator upload-status-indicator--${position}`}
    >
      {activeUploads.map((upload: ActiveUpload) => (
        <div
          key={upload.id}
          className={`upload-status-item upload-status-item--${upload.status}`}
        >
          <div className="upload-status-content">
            <div className="upload-status-icon">
              {getStatusIcon(upload.status)}
            </div>

            <div className="upload-status-text">
              <div className="upload-status-filename">{upload.fileName}</div>
              {showProgress && upload.status === "uploading" && (
                <div className="upload-status-progress">
                  <div className="upload-status-progress-bar">
                    <div
                      className="upload-status-progress-fill"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                  <span className="upload-status-progress-text">
                    {Math.round(upload.progress)}%
                  </span>
                </div>
              )}
              {upload.status === "error" && (
                <div className="upload-status-error">Upload failed</div>
              )}
              {upload.status === "success" && (
                <div className="upload-status-success">Upload complete</div>
              )}
            </div>

            {upload.status === "uploading" && (
              <button
                onClick={() => cancelUpload(upload.id)}
                className="upload-status-cancel"
                aria-label="Cancel upload"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UploadStatusIndicator;
