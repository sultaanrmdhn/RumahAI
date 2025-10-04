import React, { useState, useCallback, useEffect } from 'react';
import { PromptInput, ReferenceImage } from './components/PromptInput';
import { ImageDisplay } from './components/ImageDisplay';
import { generateImageFromPrompt, editImageFromPrompt, upscaleImage } from './services/geminiService';
import { HistoryPanel } from './components/HistoryPanel';

interface ImageHistoryItem {
  id: string;
  prompt: string;
  aspectRatio: string;
  imageSize: string;
  imageUrl: string;
}

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('9:16');
  const [imageSize, setImageSize] = useState<string>('2K');
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const [referenceImage, setReferenceImage] = useState<ReferenceImage | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('imagen-4-history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem('imagen-4-history');
    }

    // Clean up object URLs on unmount
    return () => {
        if (referenceImage) {
            URL.revokeObjectURL(referenceImage.url);
        }
    }
  }, []);


  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      let base64Image: string;
      if (referenceImage) {
        base64Image = await editImageFromPrompt(prompt, referenceImage.file);
      } else {
        base64Image = await generateImageFromPrompt(prompt, aspectRatio, imageSize);
      }
      
      const dataUrl = `data:image/jpeg;base64,${base64Image}`;
      setImageUrl(dataUrl);

      const newItem: ImageHistoryItem = {
        id: new Date().toISOString(),
        prompt,
        aspectRatio,
        imageSize,
        imageUrl: dataUrl,
      };

      setHistory(prevHistory => {
        const updatedHistory = [newItem, ...prevHistory].slice(0, 12); // Limit to 12 items
        localStorage.setItem('imagen-4-history', JSON.stringify(updatedHistory));
        return updatedHistory;
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, aspectRatio, imageSize, referenceImage]);

  const handleUpscale = useCallback(async (factor: number) => {
    if (!imageUrl || isLoading || isUpscaling) return;
    
    setIsUpscaling(true);
    setError(null);

    try {
        const base64Data = imageUrl.split(',')[1];
        if(!base64Data) {
            throw new Error("Invalid image data URL.");
        }
        const upscaledBase64 = await upscaleImage(base64Data, 'image/jpeg', factor);
        const dataUrl = `data:image/jpeg;base64,${upscaledBase64}`;
        setImageUrl(dataUrl);
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to upscale image: ${errorMessage}`);
        console.error(err);
    } finally {
        setIsUpscaling(false);
    }
  }, [imageUrl, isLoading, isUpscaling]);

  const handleSelectFromHistory = (item: ImageHistoryItem) => {
    setImageUrl(item.imageUrl);
    setPrompt(item.prompt);
    setAspectRatio(item.aspectRatio);
    setImageSize(item.imageSize);
    setError(null);
    setIsLoading(false);
    if (referenceImage) {
        URL.revokeObjectURL(referenceImage.url);
        setReferenceImage(null);
    }
  };


  const aspectRatioClasses: { [key: string]: string } = {
    '9:16': 'aspect-[9/16]',
    '16:9': 'aspect-[16/9]',
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '3:4': 'aspect-[3/4]',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 animation-gradient-bg text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                Imagen 4.0 AI Generator
            </h1>
            <p className="mt-2 text-lg text-gray-400">
                Turn your creative ideas into stunning visuals.
            </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 flex flex-col gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
                  <PromptInput
                      prompt={prompt}
                      setPrompt={setPrompt}
                      onSubmit={handleGenerate}
                      isLoading={isLoading}
                      aspectRatio={aspectRatio}
                      setAspectRatio={setAspectRatio}
                      imageSize={imageSize}
                      setImageSize={setImageSize}
                      referenceImage={referenceImage}
                      setReferenceImage={setReferenceImage}
                  />
              </div>
              <HistoryPanel history={history} onSelect={handleSelectFromHistory} />
          </div>

          <div className="lg:w-2/3">
              <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 p-4 flex items-center justify-center transition-all duration-300 ${aspectRatioClasses[aspectRatio] || 'aspect-[9/16]'}`}>
                  <ImageDisplay
                      imageUrl={imageUrl}
                      isLoading={isLoading}
                      isUpscaling={isUpscaling}
                      error={error}
                      onUpscale={handleUpscale}
                  />
              </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;