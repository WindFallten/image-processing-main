import {useEffect, useRef, useState} from 'react';
import {Button, Checkbox, InputNumber, Select} from 'antd';
import getCanvasNCtx from '../../utils/getCanvasNCtx';
import './FilterModal.css';
import makeImageMatrix from '../../utils/makeImageMatrix';
import edgeMatrixPrepare from '../../utils/edgesMatrixPrepare';

export interface FilterModalProps {
  imageRef: React.RefObject<HTMLCanvasElement>
  onFilterChange: (data: string) => void;
}

const FilterModal = ({
  imageRef,
  onFilterChange,
}: FilterModalProps) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const [filterValues, setFilterValues] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [isPreview, setIsPreview] = useState(false);
  const [filterPreset, setFilterPreset] = useState('base');

  useEffect(() => {
    if (isPreview) {
      renderPreview();
    }
  }, [isPreview])
  
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
  ]

  const onFilterOptionsChange = (value: string) => {
    setFilterPreset(value);
  }

  const onFilterInputChange = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    setFilterValues([...filterValues.slice(0, index), value, ...filterValues.slice(index + 1)])
  }

  const arrayToMatrix = (array: number[]) => {
    let matrix = [
      [...array.slice(0, 3)],
      [...array.slice(3, 6)],
      [...array.slice(6, 9)],
    ]
    if (JSON.stringify(array) == JSON.stringify([1, 2, 1, 2, 4, 2, 1, 2, 1])) {
      matrix = matrix.map((el) => el.map((e) => e / 16)); 
    }
    if (JSON.stringify(array) == JSON.stringify([1, 1, 1, 1, 1, 1, 1, 1, 1])) {
      matrix = matrix.map((el) => el.map((e) => e / 9)); 
    }
    return matrix; 
  }

  const makeFilteredData = () => {
    const [canvas, ctx] = getCanvasNCtx(imageRef);
    const canvasImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const srcData = canvasImageData.data
    
    const [previewCanvas] = getCanvasNCtx(previewRef);
    
    previewCanvas.height = canvas.height;
    previewCanvas.width = canvas.width;

    const newImageData = new Uint8ClampedArray(canvasImageData.width * canvasImageData.height * 4);

    const kernel = arrayToMatrix(filterValues);
    
    const height = canvasImageData.height;
    const width = canvasImageData.width;

    let imageMatrix = makeImageMatrix(srcData, width);
    imageMatrix = edgeMatrixPrepare(imageMatrix, width, height);

    let pos = 0;
    for (let y = 2; y <= height + 1; y++) {
      for (let x = 8; x <= width * 4 + 4; x+=4) {
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
    return new ImageData(newImageData, canvas.width, canvas.height);
  }

  const renderPreview = () => {
    const [, previewCtx] = getCanvasNCtx(previewRef);
    const tempImageData = makeFilteredData();
    previewCtx.putImageData(tempImageData, 0, 0);
  }

  const applyFiltration = () => {
    const [previewCanvas] = getCanvasNCtx(previewRef);
    renderPreview();
    onFilterChange(previewCanvas.toDataURL());
  }

  const handlePreview = () => {
    setIsPreview(!isPreview);  
  }

  return (
    <div className='filter-modal'>
      <Select
        className='filter-options'
        defaultValue='base'
        value={ filterPreset }
        onChange={ (value) => onFilterOptionsChange(value) }
        options={ filterOptions } 
      />
      <div className="filter-inputs">
        <InputNumber 
          value={ filterValues[0] }
          onPressEnter={ (e) => onFilterInputChange(e, 0) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[1] }
          onPressEnter={ (e) => onFilterInputChange(e, 1) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[2] }
          onPressEnter={ (e) => onFilterInputChange(e, 2) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[3] }
          onPressEnter={ (e) => onFilterInputChange(e, 3) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[4] }
          onPressEnter={ (e) => onFilterInputChange(e, 4) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[5] }
          onPressEnter={ (e) => onFilterInputChange(e, 5) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[6] }
          onPressEnter={ (e) => onFilterInputChange(e, 6) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[7] }
          onPressEnter={ (e) => onFilterInputChange(e, 7) }
          className='filter-input'
        />
        <InputNumber 
          value={ filterValues[8] }
          onPressEnter={ (e) => onFilterInputChange(e, 8) }
          className='filter-input'
        />
      </div>
      <div className="preview-container">
        <canvas
          ref={ previewRef }
          className='preview'
          style={{
            height: ! isPreview ? 0 : ''
          }}
        />
      </div>
      <div className="filter-btns">
        <Button type='primary' onClick={ () => {
          applyFiltration();
        } }>Изменить</Button>
        <Checkbox checked={ isPreview } onClick={ handlePreview }>Предпросмотр</Checkbox>
        <Button onClick={ resetValues }>Сбросить</Button>
      </div>
    </div>
  )
};

export default FilterModal;
