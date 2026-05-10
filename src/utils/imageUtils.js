const HEIC_EXTENSION_RE = /\.(heic|heif)$/i;

const getFileBaseName = (name = 'image') => {
    const baseName = name.replace(/\.[^/.]+$/, '');
    return baseName || 'image';
};

const getExtensionForMime = (mimeType) => {
    if (mimeType === 'image/jpeg') return 'jpg';
    if (mimeType === 'image/png') return 'png';
    return 'webp';
};

const createImageFileError = (message, code) => {
    const error = new Error(message);
    error.code = code;
    return error;
};

export const isLikelyHeicImage = (file) => {
    const type = (file?.type || '').toLowerCase();
    return type === 'image/heic' || type === 'image/heif' || HEIC_EXTENSION_RE.test(file?.name || '');
};

const loadImageFromObjectUrl = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => resolve(image);
        image.onerror = () => reject(createImageFileError('Image decode failed', 'image-decode-failed'));
        image.src = url;
    });

const canvasToBlob = (canvas, mimeType, quality) =>
    new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), mimeType, quality);
    });

const withTimeout = (promise, timeoutMs, timeoutMessage, timeoutCode) => {
    let timeoutId;
    const timeout = new Promise((_, reject) => {
        timeoutId = window.setTimeout(() => {
            reject(createImageFileError(timeoutMessage, timeoutCode));
        }, timeoutMs);
    });

    return Promise.race([promise, timeout]).finally(() => {
        window.clearTimeout(timeoutId);
    });
};

const convertHeicToJpeg = async (file, quality) => {
    try {
        const { default: heic2any } = await import('heic2any');
        const converted = await withTimeout(
            heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality
            }),
            45000,
            'Conversion HEIC/HEIF trop longue.',
            'heic-conversion-timeout'
        );
        const blob = Array.isArray(converted) ? converted[0] : converted;

        if (!blob || blob.size === 0) {
            throw createImageFileError('HEIC conversion returned an empty file', 'heic-conversion-empty');
        }

        return new File([blob], `${getFileBaseName(file.name)}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
        });
    } catch (error) {
        if (error?.code) throw error;
        throw createImageFileError(
            'Conversion HEIC/HEIF impossible. Exportez la photo en JPEG ou desactivez le mode haute efficacite.',
            'heic-conversion-failed'
        );
    }
};

/**
 * Recreates an imported image through the browser decoder and a canvas export.
 * This strips fragile mobile metadata (HDR/gain maps/color profile surprises) and
 * produces the same kind of stable bitmap result as a manual screenshot, but with
 * controlled dimensions and quality.
 */
export const normalizeImageFile = async (
    file,
    {
        quality = 0.9,
        maxDimension = 1920,
        mimeType = 'image/webp',
        fallbackMimeType = 'image/jpeg',
        background = '#ffffff'
    } = {}
) => {
    if (!file) {
        throw createImageFileError('Missing image file', 'missing-file');
    }

    if (file.type && !file.type.startsWith('image/') && !isLikelyHeicImage(file)) {
        throw createImageFileError('Le fichier selectionne n est pas une image.', 'unsupported-type');
    }

    const sourceFile = isLikelyHeicImage(file)
        ? await convertHeicToJpeg(file, Math.min(quality + 0.02, 0.95))
        : file;

    const objectUrl = URL.createObjectURL(sourceFile);

    try {
        const img = await loadImageFromObjectUrl(objectUrl);
        const sourceWidth = img.naturalWidth || img.width;
        const sourceHeight = img.naturalHeight || img.height;

        if (!sourceWidth || !sourceHeight) {
            throw createImageFileError('Image sans dimensions lisibles.', 'missing-dimensions');
        }

        const ratio = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
        const targetWidth = Math.max(1, Math.round(sourceWidth * ratio));
        const targetHeight = Math.max(1, Math.round(sourceHeight * ratio));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
            throw createImageFileError('Canvas indisponible pour cette image.', 'canvas-unavailable');
        }

        ctx.fillStyle = background;
        ctx.fillRect(0, 0, targetWidth, targetHeight);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        let blob = await canvasToBlob(canvas, mimeType, quality);
        let finalMimeType = mimeType;

        if (!blob || blob.size === 0 || (blob.type && blob.type !== mimeType)) {
            blob = await canvasToBlob(canvas, fallbackMimeType, quality);
            finalMimeType = fallbackMimeType;
        }

        if (!blob || blob.size === 0) {
            throw createImageFileError('Impossible de convertir cette image.', 'canvas-export-failed');
        }

        const extension = getExtensionForMime(finalMimeType);
        const normalizedName = `${getFileBaseName(sourceFile.name)}.${extension}`;

        return new File([blob], normalizedName, {
            type: finalMimeType,
            lastModified: Date.now(),
        });
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
};

/**
 * Compresses and converts an image file client-side.
 * @param {File} file - The original image file (JPEG, PNG, etc.)
 * @param {number} quality - Quality from 0 to 1 (default 0.8)
 * @param {number} maxWidth - Maximum dimension (default 1920px)
 * @returns {Promise<File>} - The normalized WebP file, with JPEG fallback
 */
export const compressImage = (file, quality = 0.8, maxWidth = 1920) => (
    normalizeImageFile(file, {
        quality,
        maxDimension: maxWidth,
        mimeType: 'image/webp',
        fallbackMimeType: 'image/jpeg'
    })
);
const createImage = (url) =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });

function getRadianAngle(degreeValue) {
    return (degreeValue * Math.PI) / 180;
}

/**
 * Utility to get cropped image from canvas as a Blob/File
 * Supports rotation
 */
export const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0, maxDimension = 1920) => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    // set each dimensions to double largest dimension to allow for a safe area for the
    // image to rotate in without being clipped by canvas context
    canvas.width = safeArea;
    canvas.height = safeArea;

    // translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(rotation));
    ctx.translate(-safeArea / 2, -safeArea / 2);

    // draw rotated image and store data.
    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );
    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    // Check for maxDimension scaling
    let finalCanvas = canvas;
    if (canvas.width > maxDimension || canvas.height > maxDimension) {
        const ratio = Math.min(maxDimension / canvas.width, maxDimension / canvas.height);
        const targetWidth = Math.round(canvas.width * ratio);
        const targetHeight = Math.round(canvas.height * ratio);

        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = targetWidth;
        scaledCanvas.height = targetHeight;
        const scaledCtx = scaledCanvas.getContext('2d');
        scaledCtx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
        finalCanvas = scaledCanvas;
    }

    // Return as Blob
    return new Promise((resolve, reject) => {
        finalCanvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                resolve(blob);
            },
            'image/webp',
            0.85
        );
    });
};
