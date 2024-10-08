export function pick(e, canvas, ctx) {
    const position = getMousePos(canvas, e);
    const pixelData = getPixelData(ctx, position.x, position.y);
    return {
        color: {red: pixelData[0], green: pixelData[1], blue: pixelData[2]},
        position: {x: position.x, y: position.y}
    }
}

export function clearCanvas(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

export function calculateImageScale(image, canvas) {
    if (image.width < canvas.width && image.height < canvas.height) {
        return {width: image.width, height: image.height }
    }

    let aspectRatioImage = image.width / image.height;


}

export function drawImageWithResizing(image, dWidth, dHeight, canvas, context) {
    let sx, sy, sWidth, sHeight, dx, dy;
    sWidth = image.width;
    sHeight = image.height;

    sx = 0;
    sy = 0;


    dx = (canvas.width - dWidth) / 2;
    dy = (canvas.height - dHeight) / 2;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, sy, sx, sWidth, sHeight, dx, dy, dWidth, dHeight);
}

export function getWidthAndHeightByScale(image, scale) {
    return [image.width * scale, image.height * scale]
}

export function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    let x =  Math.ceil((e.clientX - rect.left) / (rect.right - rect.left) * canvas.width)
    let y = Math.ceil((e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height)
    if (y < 0) y = 0
    if (x < 0) x = 0
    return {x, y}
}

export function getPixelData(ctx, x, y) {
    return ctx.getImageData(x, y, 1, 1).data;
}

export function loadImage(image) {
    const canvas = new OffscreenCanvas(image.width, image.height);
;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    return canvas

}

export function resizeByScale(image, canvas, scale) {
    const newWidth = image.width * scale;
    const newHeight = image.height * scale;
    const newImage = resize(image, newWidth, newHeight);
    return newImage
}

function resize(image, newWidth, newHeight) {

}

/*
целевой размер / исходный размер = коэф
положение известных пикселей += floor(коэф)
Суммирование с весовыми кофициэнтами
*/

/*
const oldWidth = image.width;
    const oldHeight = image.height;

    const canvas = new HTMLCanvasElement();
    const canvasImage = canvas.getContext('2d');
    canvasImage.drawImage(image, 0, 0, oldWidth, oldHeight, 0, 0, newWidth, newHeight);

    let newImage = new Image(newWidth, newHeight);

    let wScaleFactor = 0;
    if (newHeight !== 0) wScaleFactor = oldWidth / newWidth;

    let hScaleFactor = 0;
    if (newHeight !== 0) hScaleFactor = oldHeight / newHeight;

    for (let i = 0; i < newHeight; i++) {
        for (let j = 0; j < newWidth; j++) {
            const x = i * hScaleFactor;
            const xFloor = Math.floor(x);
            const xCeil = Math.min(oldHeight-1, Math.ceil(x))

            const y = j * wScaleFactor;
            const yFloor = Math.floor(y);
            const yCeil = Math.min(oldWidth-1, Math.ceil(y))

            const v1 = getPixelData(canvasImage, xFloor, yFloor);
            const v2 = getPixelData(canvasImage, xCeil, yFloor);
            const v3 = getPixelData(canvasImage, xFloor, yCeil);
            const v4 = getPixelData(canvasImage, xCeil, yCeil);

            const q1 = v1 * (xCeil - x) + v2 * (x - xFloor);
            const q2 = v3 * (xCeil - x) + v4 * (x - xFloor);
            const q = q1 * (yCeil - y) + q2 * (y - yFloor);

            newImage.data[i * newWidth + j] = q;
        }
        */