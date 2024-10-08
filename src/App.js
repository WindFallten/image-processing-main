import React, {useState} from 'react';
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Workspace from "./components/Workspace/Workspace";
import './App.css';
import 'normalize.css';

export default function App() {
    const [selectedImage, setImage] = useState(null);
    const [pixelData, setPixelData] = useState(null);
    const [openEditor, setOpenEditor] = useState(false);
    const [scale, setScale] = useState(1);
  return (
    <div className='app'>
        <Header setSelectedImage={setImage} selectedImage={selectedImage} setOpenEditor={setOpenEditor}/>
        <Workspace selectedImage={selectedImage}
                   setPixelData={setPixelData}
                   scale={scale}
                   openEditor={openEditor}
                   setOpenEdit={setOpenEditor}
                   setScale={setScale}
        />
        <Footer scale={scale} pixelData={pixelData} selectedImage={selectedImage} setImageScale={setScale}/>
    </div>
  );
}
