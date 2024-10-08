import React, {useEffect, useState} from 'react';
import './Footer.css';
import {SizeSlider} from "./ScaleSlider/SizeSlider";
import {CursorPosition} from "./CursorPosition/CursorPosition";
import {SizeData} from "./SizeData/SizeData";
import {ColorData} from "./ColorData/ColorData";

export default function Footer({pixelData, selectedImage, setImageScale, scale}) {
    const [color, setColor] = useState(null)
    const [position, setPosition] = useState(null);
    const [showSizeSlider, setShowSizeSlider] = useState(false);

    useEffect(() => {
        if (!pixelData) return;
        setColor(pixelData.color);

        setPosition(pixelData.position)
    }, [pixelData]);

    useEffect(() => {
        if (!selectedImage) {
            setShowSizeSlider(false)
            return;
        }
        setColor(null);
        setPosition(null);
        setShowSizeSlider(true);
    }, [selectedImage]);

    return (
        <footer className="footer">
            <SizeData className='footer__size' selectedImage={selectedImage}></SizeData>
            <div className='footer__pixel-data'>
                <CursorPosition className='footer__cursor-position' position={position}></CursorPosition>
                <ColorData className='footer__color-data' color={color}></ColorData>
            </div>
            <SizeSlider className='footer__size-slider' scale={scale} show={showSizeSlider} setImageScale={setImageScale}></SizeSlider>
        </footer>
    )
}