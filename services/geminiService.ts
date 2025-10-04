import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Generates an image based on a text prompt using the Gemini API.
 * @param prompt The text prompt to generate an image from.
 * @param aspectRatio The desired aspect ratio for the image.
 * @param imageSize The desired size for the image (e.g., '2K', '4K').
 * @returns A promise that resolves to the base64 encoded image string.
 */
export const generateImageFromPrompt = async (prompt: string, aspectRatio: string, imageSize: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: aspectRatio,
        imageSize: imageSize,
      },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      throw new Error("No images were generated. The prompt may have been rejected.");
    }

    const firstImage = response.generatedImages[0];
    if (!firstImage?.image?.imageBytes) {
      throw new Error("The API response did not contain valid image data.");
    }
    
    return firstImage.image.imageBytes;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unexpected error occurred while generating the image.");
  }
};

const fileToGenerativePart = (file: File) => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                return reject(new Error("Failed to read file as base64 string."));
            }
            // Remove the data URI prefix
            resolve(reader.result.split(',')[1]);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
    });
};

/**
 * Edits an image based on a text prompt and a reference image file.
 * @param prompt The text prompt describing the desired edits.
 * @param imageFile The reference image file to edit.
 * @returns A promise that resolves to the base64 encoded string of the edited image.
 */
export const editImageFromPrompt = async (prompt: string, imageFile: File): Promise<string> => {
    try {
        const base64ImageData = await fileToGenerativePart(imageFile);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: imageFile.type,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (!imagePart || !imagePart.inlineData?.data) {
            throw new Error("The API response did not contain valid edited image data.");
        }

        return imagePart.inlineData.data;

    } catch (error) {
        console.error("Error calling Gemini API for image editing:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while editing the image.");
    }
};

/**
 * Upscales an image to a higher resolution by a given factor.
 * @param base64ImageData The base64 encoded string of the image to upscale.
 * @param mimeType The MIME type of the image.
 * @param factor The upscaling factor (e.g., 2 or 4).
 * @returns A promise that resolves to the base64 encoded string of the upscaled image.
 */
export const upscaleImage = async (base64ImageData: string, mimeType: string, factor: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: `Upscale this image by a factor of ${factor}x, significantly increasing its resolution and enhancing details and clarity without changing the original content or style.`,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
        if (!imagePart || !imagePart.inlineData?.data) {
            throw new Error("The API response did not contain valid upscaled image data.");
        }

        return imagePart.inlineData.data;

    } catch (error) {
        console.error("Error calling Gemini API for image upscaling:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while upscaling the image.");
    }
}