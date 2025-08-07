import React, { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadAreaProps {
  label: string;
  description: string;
  accept: string;
  icon: React.ReactNode;
  onFileChange: (file: File | null) => void;
  selectedFile: File | null;
  className?: string;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  label,
  description,
  accept,
  icon,
  onFileChange,
  selectedFile,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name) {
      onFileChange(file);
    }
  }, [onFileChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileChange(file);
  }, [onFileChange]);

  const removeFile = useCallback(() => {
    onFileChange(null);
  }, [onFileChange]);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer",
          "bg-upload-area hover:bg-upload-hover",
          isDragOver ? "border-primary bg-upload-hover" : "border-upload-border",
          selectedFile ? "border-success" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {selectedFile ? (
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="text-success">{icon}</div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={removeFile}
                className="h-8 w-8 p-0"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mb-4 flex justify-center text-muted-foreground">
              {icon}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadArea;
