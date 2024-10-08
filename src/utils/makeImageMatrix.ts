export default function makeImageMatrix(srcData: Uint8ClampedArray, width: number) {
  const imageMatrix: number[][] = [];

  for (let y = 1; y <= srcData.length / (width * 4); y++) {
    imageMatrix[y] = [];
    let x = 1;
    for (let i = width * 4 * (y - 1); i < width * 4 * y; i++) {
      imageMatrix[y][x] = srcData[i];
      x += 1;
    }
  }
  
  return imageMatrix;
}