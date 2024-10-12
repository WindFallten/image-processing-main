import React, {useEffect, useRef, useState} from 'react';
import { Tabs, Modal, Button } from 'antd';
import ChangeSizeModal from './components/ChangeSizeModal/ChangeSizeModal';
import tabsItemsOnFunc from './utils/tabsItemsOnFunc';
import getNewDataNearestNeighbour from './utils/getNewDataNearestNeighbour';
import SideMenu from './components/SideMenu/SideMenu';
import CurvesModal from './components/CurvesModal/CurvesModal';
import FilterModal from './components/FilterModal/FilterModal';
import getCanvasNCtx from './utils/getCanvasNCtx';
import './App.css'
import { Footer } from "./components/Footer/Footer.tsx";

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

  const offsetXRef = useRef(0);
  const offsetYRef = useRef(0);

  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const lastMouseYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        renderImage(); // Перерисовываем изображение после изменения размера
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);


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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(offsetXRef.current, offsetYRef.current);
      const scaleMultiplier = scale / 100;
      ctx.scale(scaleMultiplier, scaleMultiplier);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
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

    canvas.width = maxWidth;
    canvas.height = maxHeight;

    setImageScale(Math.floor(scale * 100));
    renderImage();
  }

  const changeImageScale = (scale: number) => {
    const [canvas,] = getCanvasNCtx(canvasRef);
    const ctx = canvas.getContext('2d');
    if (ctx == null) return;

    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((image) => {
      const scaleMultiplier = scale / 100;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Отрисовываем изображение с нужным масштабом
      ctx.drawImage(
          image,
          0, 0, // Координаты верхнего левого угла
          image.width * scaleMultiplier, // Ширина с масштабом
          image.height * scaleMultiplier // Высота с масштабом
      );
    });
  };



  const uploadImageToCanvas = (file: File) => {
    closeModal();
    setLoadedImage({
      ...loadedImage,
      imageUri: URL.createObjectURL(file),
    })
  }

  const getPixelInfo = (e: React.MouseEvent) => {
    const [, ctx] = getCanvasNCtx(canvasRef);
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleMultiplier = scale / 100;

    // Корректируем координаты с учётом смещения и масштаба
    const adjustedX = Math.ceil((mouseX - offsetXRef.current) / scaleMultiplier);
    const adjustedY = Math.ceil((mouseY - offsetYRef.current) / scaleMultiplier);

    const p = ctx.getImageData(adjustedX, adjustedY, 1, 1).data;
    return {
      p: p,
      x: adjustedX,
      y: adjustedY,
    };
  }

  const pixelInfoChange = (e: React.MouseEvent) => {
    const { p, x, y } = getPixelInfo(e);
    setPixelInfo({
      rgb: [p[0], p[1], p[2]],
      x: x,
      y: y,
    })
  }

  const colorChange = (e: React.MouseEvent) => {
    if (currentTool !== 1) return;
    const { p, x, y } = getPixelInfo(e);
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
    changeImageScale(scale);
  }

  const onCurrentToolChange = (id: number) => {
    setCurrentTool(id);
  }

  const resizeImage = (newWidth: number, newHeight: number) => {
    const [canvas, ctx] = getCanvasNCtx(canvasRef);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newData = getNewDataNearestNeighbour(imageData, newWidth, newHeight);
    setLoadedImage({ ...loadedImage, imageUri: newData })
  };

  const downloadImage = () => {
    const originalImageWidth = loadedImage.imageOriginalWidth;
    const originalImageHeight = loadedImage.imageOriginalHeight;

    // Создаем временный canvas с исходными размерами изображения
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalImageWidth;
    tempCanvas.height = originalImageHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) return;

    // Получаем изображение
    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((image) => {
      // Очищаем временный canvas
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Рисуем изображение в исходном размере на временный canvas
      tempCtx.drawImage(image, 0, 0, originalImageWidth, originalImageHeight);

      // Преобразуем содержимое canvas в data URL (с высоким качеством)
      const imageData = tempCanvas.toDataURL('image/png');

      // Создаем ссылку для скачивания изображения
      const aDownloadLink = document.createElement('a');
      aDownloadLink.download = 'canvas_image.png';
      aDownloadLink.href = imageData;
      aDownloadLink.click();
    });
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

  const onCanvasMouseDown = (e: React.MouseEvent) => {
    if (currentTool !== 0) return; // Проверяем, выбран ли инструмент "рука"

    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
    lastMouseYRef.current = e.clientY;
    canvasRef.current!.style.cursor = 'grabbing';
  };

  const onCanvasMouseMove = (e: React.MouseEvent) => {
    pixelInfoChange(e);
    if (!isDraggingRef.current || currentTool !== 0) return;

    const dx = e.clientX - lastMouseXRef.current;
    const dy = e.clientY - lastMouseYRef.current;

    offsetXRef.current += dx;
    offsetYRef.current += dy;

    lastMouseXRef.current = e.clientX;
    lastMouseYRef.current = e.clientY;

    renderImage(); // Перерисовываем изображение с новым смещением
  };

  const onCanvasMouseUp = () => {
    isDraggingRef.current = false;
    canvasRef.current!.style.cursor = 'default';
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
  }

  const changeLoadedImage = (data: string) => {
    setLoadedImage({ ...loadedImage, imageUri: data });
  };

  useEffect(() => {
    const imgPromise = imageUriToImgPromise(loadedImage.imageUri);
    imgPromise.then((img) => {
      renderImageFull(img);
      setLoadedImage({
            ...loadedImage,
            imageOriginalWidth: img.naturalWidth,
            imageOriginalHeight: img.naturalHeight
          }
      );
    })
  }, [loadedImage.imageUri])

  useEffect(() => {
    renderImage();
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
                <Tabs defaultActiveKey="1" items={tabsItemsOnFunc(uploadImageToCanvas)} />
            )}>
              Загрузить изображение
            </Button>
            <h1>Сигалев Г.Н. 211-323</h1>
          </header>

          <div className="work-panel">
            {currentTool === 0
                ?
                <div
                    ref={imgViewRef}
                    className="img-view"
                    onMouseMove={onCanvasMouseMove}
                    onMouseDown={onCanvasMouseDown}
                    onMouseUp={onCanvasMouseUp}
                    onMouseLeave={onCanvasMouseUp} // Чтобы обработать случай, когда мышь выходит из canvas
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
            initialHeight={loadedImage.imageOriginalHeight}
            initialWidth={loadedImage.imageOriginalWidth}
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

// З-я лаба, поправить работу руки (поработать с канвасом)