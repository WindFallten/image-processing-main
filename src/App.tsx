import React, { useEffect, useRef, useState } from 'react';
import { Tabs, Modal, Button } from 'antd';
import ChangeSizeModal from './components/ChangeSizeModal/ChangeSizeModal';
import tabsItemsOnFunc from './utils/tabsItemsOnFunc';
import getNewDataNearestNeighbour from './utils/getNewDataNearestNeighbour';
import SideMenu from './components/SideMenu/SideMenu';
import CurvesModal from './components/CurvesModal/CurvesModal';
import FilterModal from './components/FilterModal/FilterModal';
import getCanvasNCtx from './utils/getCanvasNCtx';
import './App.css'
import {Footer} from "./components/Footer/Footer.tsx";

export interface LoadedImageI {
  imageUri: string
  imageOriginalWidth: number
  imageOriginalHeight: number
}

export interface PixelInfoI {
  rgb: [number, number, number]
  x: number
  y: number
}

interface ModalI {
  show: boolean
  title: string
  content: React.ReactNode
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgViewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    drag: false,
    startX: 0,
    startY: 0,
    scrollX: 0,
    scrollY: 0,
  })
  const [loadedImage, setLoadedImage] = useState<LoadedImageI>({
    imageUri: '',
    imageOriginalWidth: 0,
    imageOriginalHeight: 0
  });

  const [scale, setImageScale] = useState(100);
  const [pixelInfo, setPixelInfo] = useState<PixelInfoI>({
    rgb: [0, 0, 0],
    x: 0,
    y: 0,
  })
  const [modal, setModal] = useState<ModalI>({
    show: false,
    title: '',
    content: null,
  });
  const [currentTool, setCurrentTool] = useState(0);
  const [color1, setColor1] = useState<PixelInfoI>({
    rgb: [0, 0, 0],
    x: 0,
    y: 0
  });
  const [color2, setColor2] = useState<PixelInfoI>({
    rgb: [0, 0, 0],
    x: 0,
    y: 0
  });


  const imageUriToImgPromise = (uri: string): Promise<HTMLImageElement> => {
    return new Promise(function (resolve) {
      const img = new Image()
      img.src = uri;
      img.onload = () => {
        resolve(img);
      };
    });
  };

  const renderImage = () => {
    const [canvas, ctx] = getCanvasNCtx(canvasRef);
    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((img) => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    });
  }

  const renderImageFull = (img: HTMLImageElement) => {
    const [canvas] = getCanvasNCtx(canvasRef);

    const maxWidth = canvas.parentElement!.clientWidth;
    const maxHeight = canvas.parentElement!.clientHeight;

    const scale = Math.min(
        maxWidth / img.width,
        maxHeight / img.height
    );

    canvas.width = img.width * scale;
    canvas.height = img.height * scale;

    setImageScale(Math.floor(scale * 100));
    renderImage();
  }

  const changeImageScale = (scale: number) => {
    const [canvas,] = getCanvasNCtx(canvasRef);

    const scaleMultiplier = scale / 100;

    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((img) => {
      canvas.width = img.width * scaleMultiplier;
      canvas.height = img.height * scaleMultiplier;
      renderImage();
    })
  }

  const uploadImageToCanvas = (file: File) => {
    closeModal();
    setLoadedImage({
      ...loadedImage,
      imageUri: URL.createObjectURL(file),
    })
  }

  const getPixelInfo = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const [, ctx] = getCanvasNCtx(canvasRef);
    const mouseX = e.nativeEvent.offsetX;
    const mouseY = e.nativeEvent.offsetY;
    const p = ctx.getImageData(mouseX, mouseY, 1, 1).data;
    return {
      p: p,
      x: mouseX,
      y: mouseY,
    }
  }

  const pixelInfoChange = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const {p, x, y} = getPixelInfo(e);
    setPixelInfo({
      rgb: [p[0], p[1], p[2]],
      x: x,
      y: y,
    })
  }

  const colorChange = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 1) return;
    const {p, x, y} = getPixelInfo(e);
    if (e.shiftKey) {
      return setColor2({
        rgb: [p[0], p[1], p[2]],
        x: x,
        y: y,
      })
    }
    return setColor1({
      rgb: [p[0], p[1], p[2]],
      x: x,
      y: y,
    })
  }

  const onSliderChange = (scale: number) => {
    setImageScale(scale);
  }

  const onCurrentToolChange = (id: number) => {
    setCurrentTool(id);
  }

  const resizeImage =(newWidth: number, newHeight: number) => {
    const [canvas, ctx] = getCanvasNCtx(canvasRef);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newData = getNewDataNearestNeighbour(imageData, newWidth, newHeight);
    setLoadedImage({...loadedImage, imageUri: newData})
  };

  const downloadImage = () => {
    const [canvas] = getCanvasNCtx(canvasRef);
    changeImageScale(100);
    const image = canvas.toDataURL();
    const aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'canvas_image.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
  };

  const openModal = (
      title: string,
      content: React.ReactNode
  ) => {
    return setModal({
      ...modal,
      show: true,
      title: title,
      content: content
    })
  };

  const onImgViewMouseDown = (e: React.MouseEvent) => {
    const imgView = e.target as HTMLDivElement;
    dragRef.current = {
      ...dragRef.current,
      drag: true,
      startX: e.pageX - imgView.offsetLeft,
      startY: e.pageY - imgView.offsetTop,
    };
    imgViewRef.current!.style.cursor = "grabbing";
  };

  const onImgViewMouseUp = () => {
    dragRef.current.drag = false;
    imgViewRef.current!.style.cursor = "auto";
  }

  const onImgViewMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!dragRef.current.drag || !imgViewRef.current ) return;

    const maxScrollLeft = imgViewRef.current.scrollWidth - imgViewRef.current.clientWidth;
    const maxScrollTop = imgViewRef.current.scrollHeight - imgViewRef.current.clientHeight;

    const imgView = e.target as HTMLDivElement;
    const x = e.pageX - imgView.offsetLeft;
    const y = e.pageY - imgView.offsetTop;
    const walkX = (x - dragRef.current.startX);
    const walkY = (y - dragRef.current.startY);

    if ((imgViewRef.current.scrollLeft - walkX >= maxScrollLeft && maxScrollLeft !== 0) || (imgViewRef.current.scrollLeft - walkX < 0 && maxScrollLeft !== 0)) return
    if ((imgViewRef.current.scrollTop - walkY >= maxScrollTop && maxScrollTop !== 0) || (imgViewRef.current.scrollTop - walkY < 0  && maxScrollTop !== 0)) return

    imgViewRef.current.scrollLeft = dragRef.current.scrollX - walkX;
    dragRef.current.scrollX = dragRef.current.scrollX - walkX;
    dragRef.current.startX = x;

    imgViewRef.current.scrollTop = dragRef.current.scrollY - walkY;
    dragRef.current.scrollY = dragRef.current.scrollY - walkY;
    dragRef.current.startY = y;
  }

  const closeModal = () => {
    setModal({...modal, show: false});
  }

  const changeLoadedImage = (data: string) => {
    setLoadedImage({...loadedImage, imageUri: data});
  };

  useEffect(() => {
    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((img) => {
      renderImageFull(img);
      setLoadedImage({
          ...loadedImage,
          imageOriginalWidth: img.naturalWidth,
          imageOriginalHeight: img.naturalHeight}
      );
    })
  }, [loadedImage.imageUri])

  useEffect(() => {
    changeImageScale(scale);
  }, [scale])


  return (
      <>
        <div className="app">
            <header className="header">
              <Button className="download" type="primary" onClick={downloadImage}>
                Сохранить
              </Button>
              <Button className="upload" type="primary" onClick={() => openModal(
                  "Загрузить изображение",
                  <Tabs defaultActiveKey="1" items={tabsItemsOnFunc(uploadImageToCanvas)}/>
              )}>
                Загрузить изображение
              </Button>
            </header>

            <div className="work-panel">
              {currentTool === 0
                  ?
                  <div
                      ref={imgViewRef}
                      className="img-view"
                      onMouseDown={onImgViewMouseDown}
                      onMouseMove={onImgViewMouseMove}
                      onMouseUp={onImgViewMouseUp}
                  >
                    <canvas
                        ref={canvasRef}
                        className='canvas'
                        onMouseMove={pixelInfoChange}
                        onClick={colorChange}
                    />
                  </div>
                  :
                  <div
                      ref={imgViewRef}
                      className="img-view"
                  >
                    <canvas
                        ref={canvasRef}
                        className='canvas'
                        onMouseMove={pixelInfoChange}
                        onClick={colorChange}
                    />
                  </div>
              }
              <SideMenu
                  color1={color1}
                  color2={color2}
                  currentTool={currentTool}
                  onCurrentToolChange={onCurrentToolChange}
              >
                <Button className="change-size" type="primary" onClick={() => openModal(
                    "Изменение размера",
                    <ChangeSizeModal
                        width={loadedImage.imageOriginalWidth}
                        height={loadedImage.imageOriginalHeight}
                        onChangeSizeSubmit={(width, height) => {
                          resizeImage(width, height);
                          closeModal();
                        }}
                    />
                )}>
                  Изменить размер
                </Button>
                <Button className="curves" type="primary" onClick={() => {
                  setImageScale(100);
                  openModal(
                      "Коррекция градиента",
                      <CurvesModal
                          imageRef={canvasRef}
                          onGammaCorrectionChange={(data) => {
                            changeLoadedImage(data);
                            closeModal();
                          }}
                      />
                  )
                }}>
                  Кривые
                </Button>
                <Button className="filtration" type="primary" onClick={() => {
                  setImageScale(100);
                  openModal(
                      "Фильтрация",
                      <FilterModal
                          imageRef={canvasRef}
                          onFilterChange={(data) => {
                            changeLoadedImage(data);
                            closeModal();
                          }}

                      />
                  )
                }}>
                  Фильтры
                </Button>
              </SideMenu>
            </div>
          </div>
          <Footer
              loadedImage={loadedImage}
              pixelInfo={pixelInfo}
              scale={scale}
              onSliderChange={onSliderChange}
          />
        <Modal
            title={modal.title}
            open={modal.show}
            onCancel={closeModal}
            onOk={closeModal}
            footer={[]}
        >
          {modal.content}
        </Modal>
      </>
  )
}

export default App
