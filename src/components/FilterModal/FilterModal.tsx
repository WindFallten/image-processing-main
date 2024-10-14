import { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, InputNumber, Select } from 'antd';
import './FilterModal.css';
import makeImageMatrix from '../../utils/makeImageMatrix';
import edgeMatrixPrepare from '../../utils/edgesMatrixPrepare';
import type { ImageData as CustomImageData } from '../../App'; // Скорректируйте путь при необходимости

export interface FilterModalProps {
  image: CustomImageData;
  onFilterChange: (data: string) => void;
}

const FilterModal = ({
  image,
  onFilterChange,
}: FilterModalProps) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [filterValues, setFilterValues] = useState<number[]>([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  const [isPreview, setIsPreview] = useState(false);
  const [filterPreset, setFilterPreset] = useState('base');

  useEffect(() => {
    if (isPreview) {
      renderPreview();
    }
  }, [isPreview]);

  useEffect(() => {
    if (isPreview) {
      renderPreview();
    }
  }, [filterValues]);

  useEffect(() => {
    if (filterPreset === 'base') setFilterValues([0, 0, 0, 0, 1, 0, 0, 0, 0]);
    if (filterPreset === 'raise') setFilterValues([0, -1, 0, -1, 5, -1, 0, -1, 0]);
    if (filterPreset === 'gauss') setFilterValues([1, 2, 1, 2, 4, 2, 1, 2, 1]);
    if (filterPreset === 'rect') setFilterValues([1, 1, 1, 1, 1, 1, 1, 1, 1]);
  }, [filterPreset]);

  const resetValues = () => {
    setFilterPreset('base');
    setFilterValues([0, 0, 0, 0, 1, 0, 0, 0, 0]);
  };

  const filterOptions = [
    { value: 'base', label: 'Тождественное отображение' },
    { value: 'raise', label: 'Повышение резкости' },
    { value: 'gauss', label: 'Фильтр Гаусса' },
    { value: 'rect', label: 'Прямоугольное размытие' },
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
    let matrix = [
      [...array.slice(0, 3)],
      [...array.slice(3, 6)],
      [...array.slice(6, 9)],
    ];
    if (JSON.stringify(array) === JSON.stringify([1, 2, 1, 2, 4, 2, 1, 2, 1])) {
      matrix = matrix.map((el) => el.map((e) => e / 16));
    }
    if (JSON.stringify(array) === JSON.stringify([1, 1, 1, 1, 1, 1, 1, 1, 1])) {
      matrix = matrix.map((el) => el.map((e) => e / 9));
    }
    return matrix;
  };

  const makeFilteredData = () => {
    // Создаём временный canvas для работы с изображением
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = image.width;
    tempCanvas.height = image.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return null;

    tempCtx.drawImage(image.imageElement, 0, 0);

    const canvasImageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const srcData = canvasImageData.data;

    const previewCanvas = previewRef.current;
    if (!previewCanvas) return null;
    const previewCtx = previewCanvas.getContext('2d');
    if (!previewCtx) return null;

    previewCanvas.width = tempCanvas.width;
    previewCanvas.height = tempCanvas.height;

    const newImageData = new Uint8ClampedArray(canvasImageData.width * canvasImageData.height * 4);

    const kernel = arrayToMatrix(filterValues);

    const height = canvasImageData.height;
    const width = canvasImageData.width;

    let imageMatrix = makeImageMatrix(srcData, width);
    imageMatrix = edgeMatrixPrepare(imageMatrix, width, height);

    let pos = 0;
    for (let y = 2; y <= height + 1; y++) {
      for (let x = 8; x <= width * 4 + 4; x += 4) {
        let R = 0;
        let G = 0;
        let B = 0;
        for (let s = -1; s <= 1; s++) {
          for (let t = -1; t <= 1; t++) {
            R += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 3 + s * 4];
            G += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 2 + s * 4];
            B += kernel[s + 1][t + 1] * imageMatrix[y + t][x - 1 + s * 4];
          }
        }
        newImageData[pos] = R;
        newImageData[pos + 1] = G;
        newImageData[pos + 2] = B;
        newImageData[pos + 3] = 255;
        pos += 4;
      }
    }
    return new ImageData(newImageData, canvasImageData.width, canvasImageData.height);
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
