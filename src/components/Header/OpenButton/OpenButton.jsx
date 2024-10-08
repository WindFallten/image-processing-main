import React, { useRef } from 'react';
import './OpenButton.css';

function OpenButton(props) {
    const inputRef = useRef(null);
    const handleClick = () => {
        inputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        const image = new Image();
        image.src = URL.createObjectURL(file)
        image.onload = () => {
            props.setSelectedImage(image)
        }
    }

    return (
        <div>
            <input className="input"
                ref={inputRef}
                type="file"
                onChange={handleFileChange}
            />
            <button className="button" onClick={handleClick}>Select file</button>
        </div>
    )
}

export default OpenButton;