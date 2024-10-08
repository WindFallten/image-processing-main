const getCanvasNCtx = (ref: React.RefObject<HTMLCanvasElement>): [HTMLCanvasElement, CanvasRenderingContext2D] => {
  const canvas = ref.current!;
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true
  })!;
  return [canvas, ctx]
}

export default getCanvasNCtx;
