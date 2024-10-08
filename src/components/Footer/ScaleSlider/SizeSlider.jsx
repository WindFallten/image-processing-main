import {useEffect, useState} from "react";
import './SizeSlider.css';

export function SizeSlider({show, setImageScale, scale}) {
    const [value, setValue] = useState(100);

    useEffect(() => {
        if (!show) {
            setValue(scale*100);
        }
    }, [show, scale])

    useEffect(() => {
        setImageScale(value/100);
    }, [value, setImageScale]);

    const handleSizeChange = (e) => {
        setValue(e.target.value);
    }

    if (show) {
        return (
            <>
                <div className='size-slider'>
                    <label htmlFor="size-slider__input">{value}%</label>
                    <input
                        type="range"
                        min="1"
                        max="200"
                        value={value}
                        className="size-slider__input"
                        onChange={handleSizeChange}
                    />
                </div>
            </>
        )
    }
}