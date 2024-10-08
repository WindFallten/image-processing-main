import {useEffect,createRef, useState} from "react";
import './Canvas.css';
import {pick, clearCanvas, getWidthAndHeightByScale, drawImageWithResizing, calculateImageScale} from "./utils/utils";

export function Canvas({selectedImage, setPixelData, scale, setScale, width, height }) {
    const [canvas, setCanvas] = useState(null);
    const [context, setContext] = useState(null);
    const canvasRef = createRef();


    useEffect(() => {
        const cnv = document.getElementById("canvas");
        const ctx = cnv.getContext('2d', {willReadFrequently: true});

        if (selectedImage) {
            setScale(calculateImageScale(selectedImage, canvas.width, canvas.height));
            drawImageWithResizing(selectedImage, selectedImage.width, selectedImage.height, cnv, ctx)
        } else {
            clearCanvas(cnv, ctx)
        }

        setCanvas(cnv);
        setContext(ctx);
    }, [selectedImage, canvas, context, setScale]);

    useEffect(() => {
        if (!selectedImage) return;
        const [width, height] = getWidthAndHeightByScale(selectedImage, scale);
        drawImageWithResizing(selectedImage, width, height, canvas, context)
    }, [scale, selectedImage, canvas, context]);

    useEffect(() => {
        canvasRef.current = canvas;
    }, [canvas, canvasRef]);

    const handleMouseMove = (e) => {
        if (!selectedImage) return;
        const pixelData = pick(e, canvas, context);
        setPixelData(pixelData);
    }

    return (
        <div className="canvas__container">
            <canvas className='canvas'
                    id='canvas'
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() =>  setPixelData({color: null, position: null})}
            >
            </canvas>
        </div>
    )
}