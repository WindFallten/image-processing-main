import React, {useEffect} from "react";
import "./Header.css";
import OpenButton from "./OpenButton/OpenButton";
import {ImageURLInput} from "./ImageURLInput/ImageURLInput";
import {ClearButton} from "./ClearButton/ClearButton";
import {EditButton} from "./EditButton/EditButton";

function Header({setSelectedImage, setOpenEditor, selectedImage}) {
    const [clear, setClear] = React.useState(false);
    const [showEditButton, setShowEditButton] = React.useState(false);

    useEffect(() => {
        if (selectedImage) {
            setShowEditButton(true);
        } else {
            setShowEditButton(false);
        }
    }, [selectedImage]);

    useEffect(() => {
        if (clear) {
            setClear(false);
        }
    }, [clear])
    return (
        <header className="header">
            <div className="header__container">
                <div className="header__load-image">
                    <OpenButton     setSelectedImage={setSelectedImage}/>
                    <ImageURLInput  setSelectedImage={setSelectedImage} clear={clear}/>
                    <ClearButton    setSelectedImage={setSelectedImage} setClear={setClear}/>
                </div>

                <EditButton setOpenEditor={setOpenEditor} show={showEditButton}></EditButton>
            </div>
        </header>
    )
}

export default Header;