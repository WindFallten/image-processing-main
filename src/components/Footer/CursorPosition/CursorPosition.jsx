import React from "react";

export function CursorPosition({position}) {
    if (position) {
        return (
            <div className='cursor-position'>
                <span>x: {position.x}</span>
                <span>y: {position.y}</span>
            </div>
        )
    }
}