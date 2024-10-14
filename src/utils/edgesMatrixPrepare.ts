export default function edgeMatrixPrepare(imageMatrix: number[][], width: number, height: number) {
    const newImageMatrix: number[][] = [];
  
    // Create new matrix with padding
    for (let y = 0; y < height + 2; y++) {
      newImageMatrix[y] = [];
      for (let x = 0; x < width * 4 + 8; x++) {
        newImageMatrix[y][x] = 0;
      }
    }
  
    // Copy original data into the center of the new matrix
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width * 4; x++) {
        newImageMatrix[y + 1][x + 4] = imageMatrix[y][x];
      }
    }
  
    // Mirror edges (or replicate)
    // Top and bottom rows
    for (let x = 0; x < width * 4 + 8; x++) {
      newImageMatrix[0][x] = newImageMatrix[1][x];
      newImageMatrix[height + 1][x] = newImageMatrix[height][x];
    }
  
    // Left and right columns
    for (let y = 0; y < height + 2; y++) {
      for (let c = 0; c < 4; c++) { // For RGBA channels
        newImageMatrix[y][c] = newImageMatrix[y][c + 4];
        newImageMatrix[y][width * 4 + 4 + c] = newImageMatrix[y][width * 4 + c];
      }
    }
  
    return newImageMatrix;
  }
  