import "./Workspace.css";
import {Canvas} from "./Canvas/Canvas";
import {EditModal} from "./EditModal/EditModal";
import {useEffect, useState} from "react";

function Workspace({selectedImage, setPixelData, openEditor, setOpenEdit, scale, setScale}) {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    return (
        <main className='main'>
            <div className="workspace">
                <Canvas
                    selectedImage={selectedImage}
                    setPixelData={setPixelData}
                    scale={scale}
                    width={width}
                    height={height}
                    setScale={setScale}
                ></Canvas>
            </div>
            <EditModal
                openEditor={openEditor}
                setOpenEdit={setOpenEdit}
                setWidth={setWidth}
                setHeight={setHeight}
            />
        </main>
    )
}
    export default Workspace;