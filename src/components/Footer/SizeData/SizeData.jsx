import React from "react";

export function SizeData({selectedImage}) {
    if (selectedImage) {
        return (
            <div className='size-data'>
                <span className='footer__resolution'>size: {selectedImage.width} x {selectedImage.height}</span>
            </div>
        )
    }
}