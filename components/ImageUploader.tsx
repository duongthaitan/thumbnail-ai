import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  images: string[];
  setImages: (images: string[] | ((prev: string[]) => string[])) => void;
  t: any;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, setImages, t }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const promises: Promise<string>[] = [];

      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onload = (e) => {
            if (e.target?.result) {
              resolve(e.target.result as string);
            } else {
              resolve("");
            }
          };
          reader.readAsDataURL(file);
        });
        promises.push(promise);
      });

      Promise.all(promises).then((newImages) => {
        const validImages = newImages.filter(img => img !== "");
        // Use functional update to ensure we don't lose previous images
        setImages((prev: string[]) => [...prev, ...validImages]);
      });
    }
  }, [setImages]);

  const removeImage = (index: number) => {
    setImages((prev: string[]) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
        {t.upload_label}
      </label>
      
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {images.map((img, idx) => (
          <div key={idx} className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 group shadow-sm">
            <img src={img} alt={`Ref ${idx}`} className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(idx)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
            <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1 rounded">
              {idx + 1}
            </div>
          </div>
        ))}

        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 transition-colors flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-800/50">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <Upload size={20} className="text-slate-400 mb-1" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Upload</span>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-500">
        {t.upload_desc} ({images.length} selected)
      </p>
    </div>
  );
};

export default ImageUploader;