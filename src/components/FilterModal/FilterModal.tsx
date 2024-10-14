import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, InputNumber, Select } from 'antd';
import './FilterModal.css';
import type { ImageData as CustomImageData } from '../../App';

export interface FilterModalProps {
  image: CustomImageData;
  onFilterChange: (data: string) => void;
  onReset: () => void; // Добавили onReset в пропсы
}

const FilterModal = ({
  image,
  onFilterChange,
  onReset, // Деструктурируем onReset
}: FilterModalProps) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [filterValues, setFilterValues] = useState<number[]>([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  const [isPreview, setIsPreview] = useState(false);
  const [filterPreset, setFilterPreset] = useState('base');

  useEffect(() => {
    if (isPreview) {
      renderPreview();
    }
  }, [isPreview, filterValues]);

  useEffect(() => {
    switch (filterPreset) {
      case 'base':
        setFilterValues([0, 0, 0, 0, 1, 0, 0, 0, 0]);
        break;
      case 'raise':
        setFilterValues([0, -1, 0, -1, 5, -1, 0, -1, 0]);
        break;
      case 'gauss':
        setFilterValues([1, 2, 1, 2, 4, 2, 1, 2, 1]);
        break;
      case 'rect':
        setFilterValues([1, 1, 1, 1, 1, 1, 1, 1, 1]);
        break;
      case 'edge-horizontal':
        setFilterValues([1, 1, 1, 0, 0, 0, -1, -1, -1]);
        break;
      case 'edge-vertical':
        setFilterValues([1, 0, -1, 1, 0, -1, 1, 0, -1]);
        break;
      default:
        break;
    }
  }, [filterPreset]);

  const filterOptions = [
    { value: 'base', label: 'Тождественное отображение' },
    { value: 'raise', label: 'Повышение резкости' },
    { value: 'gauss', label: 'Фильтр Гаусса' },
    { value: 'rect', label: 'Прямоугольное размытие' },
    { value: 'edge-horizontal', label: 'Горизонтальный детектор краёв' },
    { value: 'edge-vertical', label: 'Вертикальный детектор краёв' },
  ];

  const onFilterOptionsChange = (value: string) => {
    setFilterPreset(value);
  };

  const onFilterInputChange = (value: number | null, index: number) => {
    if (value === null) return;
    setFilterValues([
      ...filterValues.slice(0, index),
      value,
      ...filterValues.slice(index + 1),
    ]);
  };

  const arrayToMatrix = (array: number[]) => {
    const matrix = [
      [...array.slice(0, 3)], // Верхняя строка
      [...array.slice(3, 6)], // Средняя строка
      [...array.slice(6, 9)], // Нижняя строка
    ];

    // Нормализация ядра для сохранения яркости
    const sum = array.reduce((a, b) => a + b, 0);

    if (sum !== 0 && filterPreset !== 'edge-horizontal' && filterPreset !== 'edge-vertical') {
      // Для фильтров, отличных от детекторов краёв, нормализуем ядро
      return matrix.map((row) => row.map((value) => value / sum));
    }

    return matrix;
  };

  const makeFilteredData = () => {
    try {
      // Создаём временный canvas для работы с изображением
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return null;

      tempCtx.drawImage(image.imageElement, 0, 0);

      const canvasImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const srcData = canvasImageData.data;

      const newImageData = new Uint8ClampedArray(canvasImageData.width * canvasImageData.height * 4);

      const kernel = arrayToMatrix(filterValues);

      const height = canvasImageData.height;
      const width = canvasImageData.width;

      // Обрабатываем каждый пиксель
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let R = 0;
          let G = 0;
          let B = 0;

          // Применяем ядро
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const px = x + kx;
              const py = y + ky;

              // Обработка границ изображения
              const clampedX = Math.min(width - 1, Math.max(0, px));
              const clampedY = Math.min(height - 1, Math.max(0, py));

              const offset = (clampedY * width + clampedX) * 4;

              const weight = kernel[ky + 1][kx + 1];

              R += srcData[offset] * weight;
              G += srcData[offset + 1] * weight;
              B += srcData[offset + 2] * weight;
            }
          }

          const destOffset = (y * width + x) * 4;
          newImageData[destOffset] = Math.min(Math.max(R, 0), 255);
          newImageData[destOffset + 1] = Math.min(Math.max(G, 0), 255);
          newImageData[destOffset + 2] = Math.min(Math.max(B, 0), 255);
          newImageData[destOffset + 3] = srcData[destOffset + 3]; // Копируем альфа-канал
        }
      }

      return new ImageData(newImageData, canvasImageData.width, canvasImageData.height);
    } catch (error) {
      console.error('Ошибка в makeFilteredData:', error);
      return null;
    }
  };

  const renderPreview = () => {
    const tempImageData = makeFilteredData();
    if (!tempImageData) return;
    const previewCanvas = previewRef.current;
    if (!previewCanvas) return;
    const previewCtx = previewCanvas.getContext('2d');
    if (previewCtx) {
      previewCanvas.width = tempImageData.width;
      previewCanvas.height = tempImageData.height;
      previewCtx.putImageData(tempImageData, 0, 0);
    }
  };

  const applyFiltration = () => {
    const tempImageData = makeFilteredData();
    if (!tempImageData) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tempImageData.width;
    tempCanvas.height = tempImageData.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.putImageData(tempImageData, 0, 0);
    onFilterChange(tempCanvas.toDataURL());
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  const resetValues = () => {
    setFilterPreset('base');
    setFilterValues([0, 0, 0, 0, 1, 0, 0, 0, 0]);
    onReset(); // Вызываем onReset для сброса изображения на основном канвасе
    if (isPreview) {
      renderPreview(); // Обновляем предпросмотр
    }
  };

  return (
    <div className='filter-modal'>
      <Select
        className='filter-options'
        defaultValue='base'
        value={filterPreset}
        onChange={onFilterOptionsChange}
        options={filterOptions}
      />
      <div className="filter-inputs">
        {filterValues.map((value, index) => (
          <InputNumber
            key={index}
            value={value}
            onChange={(value) => onFilterInputChange(value, index)}
            className='filter-input'
          />
        ))}
      </div>
      <div
        className="preview-container"
        style={{ display: isPreview ? 'block' : 'none' }}
      >
        <canvas ref={previewRef} className='preview' />
      </div>
      <div className="filter-btns">
        <Button type='primary' onClick={applyFiltration}>Изменить</Button>
        <Checkbox checked={isPreview} onChange={handlePreview}>Предпросмотр</Checkbox>
        <Button onClick={resetValues}>Сбросить</Button>
      </div>
    </div>
  );
};

export default FilterModal;
