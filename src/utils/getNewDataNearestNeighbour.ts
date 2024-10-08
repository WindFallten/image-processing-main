const getNewDataNearestNeighbour = (imageData: ImageData, newWidth: number, newHeight: number) => {
    const newCanvas = document.createElement('canvas');
    newCanvas.width = newWidth;
    newCanvas.height = newHeight;
    const newCtx = newCanvas.getContext('2d');
    
    const srcData = imageData.data;
    const srcWidth = imageData.width;
    const srcHeight = imageData.height;
    
    const destData = new Uint8ClampedArray(newWidth * newHeight * 4);
    
    const scaleX = srcWidth / newWidth;
    const scaleY = srcHeight / newHeight;
    
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.floor(x * scaleX);
        const srcY = Math.floor(y * scaleY);
    
        const srcIndex = (srcY * srcWidth + srcX) * 4;
        const destIndex = (y * newWidth + x) * 4;
    
        destData[destIndex] = srcData[srcIndex]; 
        destData[destIndex + 1] = srcData[srcIndex + 1]; 
        destData[destIndex + 2] = srcData[srcIndex + 2]; 
        destData[destIndex + 3] = srcData[srcIndex + 3]; 
      }
    }
    
    const newImageData = new ImageData(destData, newWidth, newHeight);
    newCtx?.putImageData(newImageData, 0, 0);
    return newCanvas.toDataURL();
}

export default getNewDataNearestNeighbour;
