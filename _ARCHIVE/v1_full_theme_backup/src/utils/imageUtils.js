/**
 * Compresses and converts an image file to WebP format client-side.
 * @param {File} file - The original image file (JPEG, PNG, etc.)
 * @param {number} quality - Quality from 0 to 1 (default 0.8)
 * @param {number} maxWidth - Maximum width (default 1920px)
 * @returns {Promise<File>} - The compressed WebP file
 */
export const compressImage = (file, quality = 0.8, maxWidth = 1920) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if too large
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas is empty'));
                            return;
                        }
                        // Create a new file with .webp extension
                        const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
                        const compressedFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/webp',
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
};
/**
 * Utility to get cropped image from canvas as a Blob/File
 */
export const getCroppedImg = (imageSrc, pixelCrop, maxDimension = 1920) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = "anonymous"; // Essential for CORS images

        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Canvas context not found'));
                return;
            }

            // [NEW] Resolution Capping to avoid massive textures on Homepage
            let targetWidth = pixelCrop.width;
            let targetHeight = pixelCrop.height;

            if (targetWidth > maxDimension || targetHeight > maxDimension) {
                const ratio = Math.min(maxDimension / targetWidth, maxDimension / targetHeight);
                targetWidth = Math.round(targetWidth * ratio);
                targetHeight = Math.round(targetHeight * ratio);
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            // Optional: for smoother downscaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                targetWidth,
                targetHeight
            );

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'));
                        return;
                    }
                    resolve(blob);
                },
                'image/webp',
                0.85 // Reduced from 0.95 to better balance quality/weight
            );
        };

        image.onerror = (error) => reject(error);
    });
};
