import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export const getCroppedImg = (imageSrc, pixelCrop, rotation = 0) => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            const rotRad = rotation * Math.PI / 180;

            // Set canvas size to match the cropped area
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            // Translate to canvas center, rotate, then translate back
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotRad);
            ctx.translate(-canvas.width / 2, -canvas.height / 2);

            // Draw the image
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );

            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        image.onerror = (error) => reject(error);
    });
};