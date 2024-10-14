export default function makeImageMatrix(srcData: Uint8ClampedArray, width: number) {
  const imageMatrix: number[][] = [];
  const height = srcData.length / (width * 4);

  for (let y = 0; y < height; y++) {
    imageMatrix[y] = [];
    for (let x = 0; x < width * 4; x++) {
      imageMatrix[y][x] = srcData[y * width * 4 + x];
    }
  }

  return imageMatrix;
}
