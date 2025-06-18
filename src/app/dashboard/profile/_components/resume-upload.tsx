"use client";

import { useState, useRef, useCallback } from "react";
import { useUploadResume, useDeleteResume } from "@/hooks/job-seeker-profiles";
import { useUploadFile } from "@/hooks/files";
import { useFileUrl } from "@/hooks/files";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface ResumeUploadProps {
  currentPath?: string | null;
}

export function ResumeUpload({ currentPath }: ResumeUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadResumeMutation = useUploadResume();
  const uploadFileMutation = useUploadFile();
  const deleteResumeMutation = useDeleteResume();

  // Get signed URL for current CV if exists
  const { data: fileUrlData, isLoading: isLoadingUrl } = useFileUrl({
    bucket: "cvs",
    path: currentPath || "",
    enabled: !!currentPath,
  });

  const isUploading =
    uploadResumeMutation.isPending || uploadFileMutation.isPending;
  const isDeleting = deleteResumeMutation.isPending;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File) => {
    // Check file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("File quá lớn. Kích thước tối đa là 50MB");
    }

    // Check file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Chỉ hỗ trợ file PDF, DOC, DOCX");
    }

    return true;
  };

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        validateFile(file);

        // Create FormData for upload
        const formData = new FormData();
        formData.append("resume", file);

        // Simulate progress (since we don't have real progress from the mutation)
        setUploadProgress(0);
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        // Upload using resume-specific action
        await uploadResumeMutation.mutateAsync({ formData });

        setUploadProgress(100);
        clearInterval(progressInterval);

        toast.success("Upload CV thành công!");

        // Reset progress after success
        setTimeout(() => setUploadProgress(0), 1000);
      } catch (error) {
        setUploadProgress(0);
        toast.error(error instanceof Error ? error.message : "Upload thất bại");
      }
    },
    [uploadResumeMutation]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileUpload(file);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const viewCurrentCV = () => {
    if (fileUrlData?.success && fileUrlData.data.url) {
      // Open CV in new tab for viewing
      window.open(fileUrlData.data.url, "_blank");
    } else {
      toast.error("Không thể mở CV để xem");
    }
  };

  const removeCurrentCV = async () => {
    try {
      if (window.confirm("Bạn có chắc chắn muốn xóa CV này không?")) {
        await deleteResumeMutation.mutateAsync();
        toast.success("CV đã được xóa thành công!");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Không thể xóa CV");
    }
  };

  return (
    <div className="space-y-4">
      {/* Current CV Display */}
      {currentPath && !isUploading && !isDeleting && (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">CV đã được upload</p>
              <p className="text-sm text-green-600">
                {currentPath.split("/").pop()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={viewCurrentCV}
              disabled={isLoadingUrl || !fileUrlData?.success}
              className="text-blue-700 border-blue-300 hover:bg-blue-100"
              title="Xem CV"
            >
              {isLoadingUrl ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={removeCurrentCV}
              disabled={isDeleting}
              className="text-red-700 border-red-300 hover:bg-red-100"
              title="Xóa CV"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        } ${isUploading || isDeleting ? "pointer-events-none opacity-50" : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx"
          onChange={handleFileSelect}
          disabled={isUploading || isDeleting}
        />

        {isUploading ? (
          <div className="space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Đang upload CV...</p>
              {uploadProgress > 0 && (
                <div className="space-y-1">
                  <Progress
                    value={uploadProgress}
                    className="w-full max-w-xs mx-auto"
                  />
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 text-muted-foreground">
              <Upload className="w-full h-full" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                {currentPath ? "Upload CV mới" : "Upload CV của bạn"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Kéo thả file vào đây hoặc{" "}
                <button
                  onClick={openFileSelector}
                  className="text-primary hover:underline font-medium"
                >
                  chọn file
                </button>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Requirements */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Yêu cầu file:</strong>
          <ul className="mt-1 space-y-1 text-xs">
            <li>• Định dạng: PDF, DOC, DOCX</li>
            <li>• Kích thước tối đa: 50MB</li>
            <li>• Nên sử dụng tên file có ý nghĩa</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Upload Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Mẹo upload CV hiệu quả:</strong>
        </p>
        <ul className="space-y-1 ml-4">
          <li>• Sử dụng định dạng PDF để đảm bảo hiển thị đúng</li>
          <li>• Tên file nên rõ ràng (vd: NguyenVanA_CV_2024.pdf)</li>
          <li>• Cập nhật CV thường xuyên để thu hút nhà tuyển dụng</li>
        </ul>
      </div>
    </div>
  );
}
