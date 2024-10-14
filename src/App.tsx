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
import { Footer } from "./components/Footer/Footer.tsx";

export interface ImageData {
  uri: string; // Data URL или путь к изображению
  width: number;
  height: number;
  imageElement: HTMLImageElement;
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

  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [canvasImage, setCanvasImage] = useState<ImageData | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Инициализация размеров canvas
  // Инициализация размеров canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }
  }, []);


  useEffect(() => {
    const canvas = canvasRef.current;
    const imgView = canvas?.parentElement;

    if (canvas && imgView) {
      const resizeObserver = new ResizeObserver(() => {
        canvas.width = imgView.clientWidth;
        canvas.height = imgView.clientHeight;

        if (canvasImage) {
          // Обновляем масштаб и смещения
          const scaleX = canvas.width / canvasImage.width;
          const scaleY = canvas.height / canvasImage.height;
          const newScale = Math.min(scaleX, scaleY) * 100; // В процентах

          setImageScale(newScale);

          offsetXRef.current = (canvas.width - canvasImage.width * (newScale / 100)) / 2;
          offsetYRef.current = (canvas.height - canvasImage.height * (newScale / 100)) / 2;

          renderCanvasImage();
        }
      });

      resizeObserver.observe(imgView);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [canvasImage]);



  const renderCanvasImage = () => {
    if (!canvasImage) return;
    const [canvas, ctx] = getCanvasNCtx(canvasRef);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(offsetXRef.current, offsetYRef.current);
    const scaleMultiplier = scale / 100;
    ctx.scale(scaleMultiplier, scaleMultiplier);
    ctx.drawImage(
      canvasImage.imageElement,
      0, 0,
      canvasImage.width,
      canvasImage.height
    );
    ctx.restore();
  };

  const uploadImageToCanvas = (file: File) => {
    closeModal();
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const imageData: ImageData = {
          uri: event.target?.result as string,
          width: img.width,
          height: img.height,
          imageElement: img,
        };
        setOriginalImage(imageData);
        setCanvasImage({ ...imageData });

        // Рассчитываем масштаб и смещения для вписывания изображения
        const canvas = canvasRef.current;
        if (canvas) {
          const canvasWidth = canvas.width;
          const canvasHeight = canvas.height;

          const scaleX = canvasWidth / img.width;
          const scaleY = canvasHeight / img.height;
          const newScale = Math.min(scaleX, scaleY) * 100; // В процентах

          setImageScale(newScale);

          offsetXRef.current = (canvasWidth - img.width * (newScale / 100)) / 2;
          offsetYRef.current = (canvasHeight - img.height * (newScale / 100)) / 2;
        }

        renderCanvasImage();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };


  const getPixelInfo = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasImage) return;
    const [, ctx] = getCanvasNCtx(canvasRef);
    const rect = canvasRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const scaleMultiplier = scale / 100;

    // Корректируем координаты с учётом смещения и масштаба
    const adjustedX = Math.floor((mouseX - offsetXRef.current) / scaleMultiplier);
    const adjustedY = Math.floor((mouseY - offsetYRef.current) / scaleMultiplier);

    const p = ctx.getImageData(mouseX, mouseY, 1, 1).data;
    return {
      p: p,
      x: adjustedX,
      y: adjustedY,
    };
  }

  const pixelInfoChange = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasImage) return;
    const pixelData = getPixelInfo(e);
    if (pixelData) {
      const { p, x, y } = pixelData;
      setPixelInfo({
        rgb: [p[0], p[1], p[2]],
        x: x,
        y: y,
      });
    }
  }

  const colorChange = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 1 || !canvasImage) return;
    const pixelData = getPixelInfo(e);
    if (pixelData) {
      const { p, x, y } = pixelData;
      if (e.shiftKey) {
        return setColor2({
          rgb: [p[0], p[1], p[2]],
          x: x,
          y: y,
        });
      }
      return setColor1({
        rgb: [p[0], p[1], p[2]],
        x: x,
        y: y,
      });
    }
  }

  const onSliderChange = (newScale: number) => {
    setImageScale(newScale);

    if (canvasImage && canvasRef.current) {
      const canvasWidth = canvasRef.current.width;
      const canvasHeight = canvasRef.current.height;

      // Обновляем смещения для центрирования изображения при новом масштабе
      offsetXRef.current = (canvasWidth - canvasImage.width * (newScale / 100)) / 2;
      offsetYRef.current = (canvasHeight - canvasImage.height * (newScale / 100)) / 2;

      renderCanvasImage();
    }
  };


  const onCurrentToolChange = (id: number) => {
    setCurrentTool(id);
  }

  const resizeImage = (newWidth: number, newHeight: number) => {
    if (!canvasImage) return;
    // Создаем временный canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasImage.width;
    tempCanvas.height = canvasImage.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Рисуем текущее изображение на временный canvas
    tempCtx.drawImage(canvasImage.imageElement, 0, 0);

    // Получаем данные изображения
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);

    // Изменяем размер данных изображения
    const newDataUrl = getNewDataNearestNeighbour(imageData, newWidth, newHeight);

    // Обновляем canvasImage
    changeCanvasImage(newDataUrl);

    // После изменения размера пересчитываем масштаб и смещения
    const canvas = canvasRef.current;
    if (canvas) {
      const scaleX = canvas.width / newWidth;
      const scaleY = canvas.height / newHeight;
      const newScale = Math.min(scaleX, scaleY) * 100; // В процентах

      setImageScale(newScale);

      offsetXRef.current = (canvas.width - newWidth * (newScale / 100)) / 2;
      offsetYRef.current = (canvas.height - newHeight * (newScale / 100)) / 2;

      renderCanvasImage();
    }
  };


  const changeCanvasImage = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const newCanvasImage: ImageData = {
        uri: dataUrl,
        width: img.width,
        height: img.height,
        imageElement: img,
      };
      setCanvasImage(newCanvasImage);
      renderCanvasImage();
    };
    img.src = dataUrl;
  };
  


  const downloadImage = () => {
    if (!canvasImage || !canvasRef.current) return;

    // Создаем временный canvas с размерами изображения
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvasImage.width;
    tempCanvas.height = canvasImage.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Если вы применяли фильтры, нужно применить их к tempCtx
    // Например:
    // tempCtx.filter = mainCtx.filter;

    // Рисуем изображение на временный canvas без смещения и масштабирования
    tempCtx.drawImage(
      canvasImage.imageElement,
      0, 0,
      canvasImage.width,
      canvasImage.height
    );

    // Если вы применяли какие-либо изменения к пикселям (например, через getImageData/putImageData), нужно повторить их на tempCtx
    // Например, если у вас есть функция applyFilters, которая принимает контекст
    // applyFilters(tempCtx);

    // Преобразуем содержимое временного canvas в data URL
    const imageDataUrl = tempCanvas.toDataURL('image/png');

    // Создаем ссылку для скачивания изображения
    const aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'canvas_image.png';
    aDownloadLink.href = imageDataUrl;
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

  const onCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool !== 0) return; // Проверяем, выбран ли инструмент "рука"

    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
    lastMouseYRef.current = e.clientY;
    canvasRef.current!.style.cursor = 'grabbing';
  };

  const onCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentTool === 0 && isDraggingRef.current) {
      const dx = e.clientX - lastMouseXRef.current;
      const dy = e.clientY - lastMouseYRef.current;

      offsetXRef.current += dx;
      offsetYRef.current += dy;

      lastMouseXRef.current = e.clientX;
      lastMouseYRef.current = e.clientY;

      if (canvasImage) {
        renderCanvasImage(); // Перерисовываем изображение с новым смещением
      }
    } else {
      pixelInfoChange(e);
    }
  };

  const onCanvasMouseUp = () => {
    isDraggingRef.current = false;
    canvasRef.current!.style.cursor = currentTool === 0 ? 'grab' : 'default';
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
  }

  useEffect(() => {
    if (canvasImage) {
      renderCanvasImage();
    }
  }, [canvasImage, scale]);

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
          <SideMenu
            color1={color1}
            color2={color2}
            currentTool={currentTool}
            onCurrentToolChange={onCurrentToolChange}
          >
            <Button className="change-size" type="primary" onClick={() => openModal(
              "Изменение размера",
              <ChangeSizeModal
                width={canvasImage?.width || 0}
                height={canvasImage?.height || 0}
                onChangeSizeSubmit={(width, height) => {
                  resizeImage(width, height);
                  closeModal();
                }}
              />
            )}>
              Изменить размер
            </Button>
            <Button className="curves" type="primary" onClick={() => {
              // setImageScale(100);
              openModal(
                "Коррекция градиента",
                <CurvesModal
                  image={canvasImage!}
                  onGammaCorrectionChange={(data) => {
                    changeCanvasImage(data);
                    closeModal();
                  }}
                />
              )
            }}>
              Кривые
            </Button>

            <Button className="filtration" type="primary" onClick={() => {
              // setImageScale(100);
              openModal(
                "Фильтрация",
                <FilterModal
                  image={canvasImage!}
                  onFilterChange={(data) => {
                    changeCanvasImage(data);
                    closeModal();
                  }}
                />
              )
            }}>
              Фильтры
            </Button>

          </SideMenu>
          <div className="img-view">
            <canvas
              ref={canvasRef}
              className='canvas'
              onMouseDown={onCanvasMouseDown}
              onMouseMove={onCanvasMouseMove}
              onMouseUp={onCanvasMouseUp}
              onMouseLeave={onCanvasMouseUp}
              onClick={colorChange}
              style={{ cursor: currentTool === 0 ? 'grab' : 'default' }}
            />
          </div>
        </div>

      </div>
      <Footer
        imageData={canvasImage}
        pixelInfo={pixelInfo}
        scale={scale}
        onSliderChange={onSliderChange}
        initialWidth={originalImage?.width || 0}
        initialHeight={originalImage?.height || 0}
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
