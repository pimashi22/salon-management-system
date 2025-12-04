import React from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

interface DropZoneProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onDrop"> {
  onDrop: (acceptedFiles: File[]) => void;
  currentImage?: string | null;
}

export function DropZone({
  onDrop,
  currentImage,
  className,
  ...props
}: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50",
        className
      )}
      {...props}
    >
      <input {...getInputProps()} />
      {currentImage ? (
        <div className="relative aspect-video w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Preview"
            className="rounded object-cover w-full h-full"
          />
        </div>
      ) : (
        <div className="space-y-2 p-4">
          <div className="text-muted-foreground">
            {isDragActive ? (
              <p>Drop the image here ...</p>
            ) : (
              <p>Drag & drop an image here, or click to select one</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            PNG, JPG or GIF up to 10MB
          </p>
        </div>
      )}
    </div>
  );
}
