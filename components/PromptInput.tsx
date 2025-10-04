import React, { useRef } from 'react';

export interface ReferenceImage {
    url: string;
    file: File;
}

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
  imageSize: string;
  setImageSize: (size: string) => void;
  referenceImage: ReferenceImage | null;
  setReferenceImage: (image: ReferenceImage | null) => void;
}

const MagicWandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69a.75.75 0 01.981.981A10.501 10.501 0 0118 16.5a10.5 10.5 0 11-10.5-10.5c.75 0 1.45.101 2.12.282a.75.75 0 01.819.162z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M11.472 10.472a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06L11.472 11.53a.75.75 0 010-1.06z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.24 12.24a.75.75 0 011.06 0l1.5 1.5a.75.75 0 01-1.06 1.06l-1.5-1.5a.75.75 0 010-1.06zM13.75 8a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V8zm-3.328 5.75a.75.75 0 010 1.06l-1.5 1.5a.75.75 0 11-1.06-1.06l1.5-1.5a.75.75 0 011.06 0zM15 5.25a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V5.25zM18 9.75a.75.75 0 00-1.5 0v1.5a.75.75 0 001.5 0V9.75z" clipRule="evenodd" />
    </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
    </svg>
);

const XMarkIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
    </svg>
);

const ASPECT_RATIOS = ['9:16', '16:9', '1:1', '4:3', '3:4'];

const AspectRatioSelector: React.FC<{
  selectedRatio: string;
  onSelect: (ratio: string) => void;
  disabled: boolean;
}> = ({ selectedRatio, onSelect, disabled }) => (
  <div className={disabled ? 'opacity-50 cursor-not-allowed' : ''}>
    <label className="text-base font-semibold text-gray-300 mb-3 block">
      Aspect Ratio
    </label>
    <div className="grid grid-cols-5 gap-2">
      {ASPECT_RATIOS.map((ratio) => (
        <button
          key={ratio}
          onClick={() => onSelect(ratio)}
          disabled={disabled}
          aria-pressed={selectedRatio === ratio}
          className={`px-2 py-2 text-sm font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
            ${selectedRatio === ratio
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
            }`}
        >
          {ratio}
        </button>
      ))}
    </div>
     {disabled && <p className="text-xs text-gray-400 mt-2">Disabled when a reference image is used.</p>}
  </div>
);

const IMAGE_SIZES = ['2K', '4K'];

const ImageSizeSelector: React.FC<{
  selectedSize: string;
  onSelect: (size: string) => void;
  disabled: boolean;
}> = ({ selectedSize, onSelect, disabled }) => (
  <div className={disabled ? 'opacity-50 cursor-not-allowed' : ''}>
    <label className="text-base font-semibold text-gray-300 mb-3 block">
      Image Size
    </label>
    <div className="grid grid-cols-2 gap-2">
      {IMAGE_SIZES.map((size) => (
        <button
          key={size}
          onClick={() => onSelect(size)}
          disabled={disabled}
          aria-pressed={selectedSize === size}
          className={`px-2 py-2 text-sm font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
            ${selectedSize === size
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
            }`}
        >
          {size}
        </button>
      ))}
    </div>
    {disabled && <p className="text-xs text-gray-400 mt-2">Disabled when a reference image is used.</p>}
  </div>
);


export const PromptInput: React.FC<PromptInputProps> = ({ prompt, setPrompt, onSubmit, isLoading, aspectRatio, setAspectRatio, imageSize, setImageSize, referenceImage, setReferenceImage }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading) {
        onSubmit();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (referenceImage) {
        URL.revokeObjectURL(referenceImage.url);
      }
      setReferenceImage({
        file: file,
        url: URL.createObjectURL(file)
      });
    }
  };

  const handleClearReferenceImage = () => {
    if (referenceImage) {
        URL.revokeObjectURL(referenceImage.url);
    }
    setReferenceImage(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col space-y-4">
      <label htmlFor="prompt" className="text-lg font-semibold text-gray-200">
        Enter your prompt
      </label>
      <textarea
        id="prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g., A robot holding a red skateboard."
        className="flex-grow w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
        rows={6}
        disabled={isLoading}
      />

      <div>
        <label className="text-base font-semibold text-gray-300 mb-3 block">
          Reference Image (Optional)
        </label>
        {referenceImage ? (
          <div className="relative w-full p-2 border border-gray-600 rounded-lg flex items-center gap-3">
            <img src={referenceImage.url} alt="Reference preview" className="w-16 h-16 rounded-md object-cover"/>
            <div className="flex-grow overflow-hidden">
                <p className="text-sm text-gray-200 truncate">{referenceImage.file.name}</p>
                <p className="text-xs text-gray-400">{Math.round(referenceImage.file.size / 1024)} KB</p>
            </div>
            <button
                onClick={handleClearReferenceImage}
                className="p-1.5 rounded-full bg-gray-700 hover:bg-red-500/80 text-gray-300 hover:text-white transition-colors"
                aria-label="Clear reference image"
            >
                <XMarkIcon className="w-5 h-5"/>
            </button>
          </div>
        ) : (
          <>
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
              disabled={isLoading}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-500 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700/60 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <UploadIcon className="w-5 h-5 mr-2" />
              Upload Reference Image
            </button>
          </>
        )}
      </div>
      
      <AspectRatioSelector
        selectedRatio={aspectRatio}
        onSelect={setAspectRatio}
        disabled={isLoading || !!referenceImage}
      />

      <ImageSizeSelector
        selectedSize={imageSize}
        onSelect={setImageSize}
        disabled={isLoading || !!referenceImage}
      />

      <button
        onClick={onSubmit}
        disabled={isLoading || !prompt.trim()}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-500 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition duration-200"
      >
        {isLoading ? (
          'Generating...'
        ) : (
          <>
            <MagicWandIcon className="w-5 h-5 mr-2"/>
            Generate Image
          </>
        )}
      </button>
    </div>
  );
};