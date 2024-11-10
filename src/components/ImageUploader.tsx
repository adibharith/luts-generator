import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-xl aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 cursor-pointer hover:border-teal-500 transition-colors"
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className="w-full h-full flex flex-col items-center justify-center cursor-pointer"
      >
        <Upload className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg font-medium text-gray-700">Drop your image here</p>
        <p className="text-sm text-gray-500 mt-2">or click to browse</p>
      </label>
    </div>
  );
};