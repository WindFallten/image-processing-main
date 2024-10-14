import { Slider } from "antd";
import "./Footer.css";
import { ImageData } from "../../App";

interface FooterProps {
    imageData: ImageData | null;
    pixelInfo: {
        rgb: [number, number, number];
        x: number;
        y: number;
    };
    scale: number;
    onSliderChange: (value: number) => void;
    initialWidth: number;
    initialHeight: number;
}

export const Footer = ({
                           imageData,
                           pixelInfo,
                           scale,
                           onSliderChange,
                           initialWidth,
                           initialHeight,
                       }: FooterProps) => {
    return (
        <footer className="footer">
            <div className="footer__size">
                <div
                    className="footer__initial-size"
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <span>{`Initial width: ${initialWidth}px`}</span>
                    <span>{`Initial height: ${initialHeight}px`}</span>
                </div>
                <div
                    className="footer__actual-size"
                    style={{ display: "flex", flexDirection: "column" }}
                >
                    <span>{`Width: ${imageData?.width || 0}px`}</span>
                    <span>{`Height: ${imageData?.height || 0}px`}</span>
                </div>
            </div>
            <div className="footer__pixel">
                <div className="footer__color">
                    <div
                        style={{ background: `rgb(${pixelInfo.rgb.join(",")})` }}
                        className="footer__color-preview"
                    />
                    <span className="footer__color-value">{`RGB(${pixelInfo.rgb.join(
                        ", "
                    )})`}</span>
                </div>
                <div className="footer__cursor">
                    <span>{`X: ${pixelInfo.x}`}</span>
                    <span>{`Y: ${pixelInfo.y}`}</span>
                </div>
            </div>
            <Slider
                className="size-slider"
                min={12}
                max={300}
                defaultValue={100}
                value={scale}
                onChange={onSliderChange}
            />
        </footer>
    );
};
