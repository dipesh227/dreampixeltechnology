export const addWatermark = (base64Image: string, watermarkText: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error('Could not get canvas context'));
            }

            // Draw the original image
            ctx.drawImage(image, 0, 0);

            // Set watermark style
            const fontSize = Math.max(18, image.width / 60); // Dynamic font size based on image width
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            
            // Add a subtle shadow for better readability on complex backgrounds
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 5;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            // Draw text in the bottom right corner
            const padding = fontSize;
            ctx.fillText(watermarkText, canvas.width - padding, canvas.height - padding);

            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = (error) => reject(error);
        // The browser needs the full data URL to load the image from the base64 string
        image.src = `data:image/png;base64,${base64Image}`;
    });
};
