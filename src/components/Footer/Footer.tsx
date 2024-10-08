import {Slider}  from "antd";
import "./Footer.css"



interface FooterProps {
    loadedImage: {
        imageUri: string;
        imageOriginalWidth: number;
        imageOriginalHeight: number;
    };
    pixelInfo: {
        rgb: [number, number, number];
        x: number;
        y: number;
    };
    scale: number;
    onSliderChange: (value: number) => void;
}

export const Footer = ({ loadedImage, pixelInfo, scale, onSliderChange }: FooterProps) => {
    return (
        <footer className="footer">
            <div className="footer__size">
                <span>{`Width: ${loadedImage.imageOriginalWidth}px`}</span>
                <span>{`Height: ${loadedImage.imageOriginalHeight}px`}</span>
            </div>
            <div className="footer__pixel">
                <div className="footer__color">
                    <div style={{background: `rgb(${[...pixelInfo.rgb]})`}}
                         className='footer__color-preview'/>
                    <span className="footer__color-value">{`RGB(${pixelInfo.rgb.join(', ')})`}</span>
                </div>
                <div className="footer__cursor">
                    <span>{`X: ${pixelInfo.x}`}</span>
                    <span>{`Y: ${pixelInfo.y}`}</span>
                </div>
            </div>
            <Slider
                className='size-slider'
                min={12}
                max={300}
                defaultValue={100}
                value={scale}
                onChange={onSliderChange}
            />
        </footer>
    );
};