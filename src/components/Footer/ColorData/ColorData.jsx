import React from "react";
import './ColorData.css';

export function ColorData({color}) {
    if (color) {
        return (
            <div className='color-data'>
                <div
                    className='color-data__color-preview'
                    style={{
                        backgroundColor: `rgb(${color.red}, ${color.green}, ${color.blue})`
                    }}
                ></div>
                <div className="color-data__rgb">
                    <span className='color-data__item'>r: {color.red}</span>
                    <span className='color-data__item'>g: {color.green}</span>
                    <span className='color-data__item'>b: {color.blue}</span>
                </div>
            </div>
        )
    }
}