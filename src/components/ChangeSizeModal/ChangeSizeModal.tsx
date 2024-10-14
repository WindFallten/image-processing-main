import { Select, InputNumber, Space, Checkbox, Button } from 'antd';
import { useEffect, useState } from 'react';
import './ChangeSizeModal.css';

export interface ChangeSizeModalProps {
  width: number,
  height: number,
  onChangeSizeSubmit: (width: number, height: number) => void;
}

const ChangeSizeModal = ({
  width,
  height,
  onChangeSizeSubmit,
}: ChangeSizeModalProps) => {
  const [measure, setMeasure] = useState({
    type: 'pixels',
    proportionFix: false,
    width: width,
    height: height,
    pWidth: 100,
    pHeight: 100,
  });
  const [, setAlgorithm] = useState('closestNeighbour');

  // Новый стейт для хранения соотношения сторон
  const [aspectRatio, setAspectRatio] = useState<number>(width / height);

  useEffect(() => {
    setMeasure({ ...measure, width: width, height: height });
  }, [width, height]);

  const onHeightChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      return setMeasure({
        ...measure,
        height: value,
        width: Math.round(value * aspectRatio) || 1,
      });
    }
    return setMeasure({ ...measure, height: value });
  };

  const onWidthChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      return setMeasure({
        ...measure,
        width: value,
        height: Math.round(value / aspectRatio) || 1,
      });
    }
    return setMeasure({ ...measure, width: value });
  };

  const onPHeightChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      return setMeasure({
        ...measure,
        pHeight: value,
        pWidth: Math.round(value * aspectRatio) || 1,
      });
    }
    return setMeasure({ ...measure, pHeight: value });
  };

  const onPWidthChange = (value: number | null) => {
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      return setMeasure({
        ...measure,
        pWidth: value,
        pHeight: Math.round(value / aspectRatio) || 1,
      });
    }
    return setMeasure({ ...measure, pWidth: value });
  };

  const calcWidthHeight = () => {
    if (measure.type === 'pixels') {
      return [measure.width, measure.height];
    } else {
      return [
        Math.round((width * measure.pWidth) / 100),
        Math.round((height * measure.pHeight) / 100),
      ];
    }
  };

  const onProportionFixChange = () => {
    const newProportionFix = !measure.proportionFix;
    if (newProportionFix) {
      // Сохраняем текущее соотношение сторон
      const newAspectRatio = measure.width / measure.height;
      setAspectRatio(newAspectRatio);
    }
    setMeasure({ ...measure, proportionFix: newProportionFix });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'end' }}>
        <Space direction='vertical'>
          <Space>
            Высота
            {measure.type === 'pixels' ? (
              <InputNumber
                placeholder='height'
                min={1}
                maxLength={4}
                value={measure.height}
                onChange={onHeightChange}
              />
            ) : (
              <InputNumber
                placeholder='height'
                min={1}
                max={1000}
                value={measure.pHeight}
                onChange={onPHeightChange}
              />
            )}
          </Space>
          <Space>
            <Checkbox
              checked={measure.proportionFix}
              onChange={onProportionFixChange}
            >
              Сохранять пропорции
            </Checkbox>
          </Space>
          <Space>
            Ширина
            {measure.type === 'pixels' ? (
              <InputNumber
                placeholder='width'
                min={1}
                maxLength={4}
                value={measure.width}
                onChange={onWidthChange}
              />
            ) : (
              <InputNumber
                placeholder='width'
                min={1}
                max={1000}
                value={measure.pWidth}
                onChange={onPWidthChange}
              />
            )}
          </Space>
        </Space>
        <Select
          defaultValue="pixels"
          onChange={(value) => setMeasure({ ...measure, type: value })}
          options={[
            { value: 'pixels', label: 'px' },
            { value: 'percentage', label: '%' },
          ]}
        />
      </div>
      <Space>
        Алгоритм интерполяции
        <Select
          defaultValue="closestNeighbour"
          onChange={(value) => setAlgorithm(value)}
          options={[
            { value: 'closestNeighbour', label: 'Ближайший сосед' },
            { value: 'bilinear', label: 'Билинейный' },
            { value: 'bicubic', label: 'Бикубический' },
          ]}
        />
      </Space>
      <Space>
        <Button
          type='primary'
          onClick={() =>
            onChangeSizeSubmit(calcWidthHeight()[0], calcWidthHeight()[1])
          }
        >
          Изменить
        </Button>
      </Space>
    </div>
  );
};

export default ChangeSizeModal;
