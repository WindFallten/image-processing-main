import { Select, InputNumber, Space, Checkbox, Flex, Button } from 'antd';
import { useEffect, useState, KeyboardEvent } from 'react';
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

  useEffect(() => {
    setMeasure({...measure, width: width, height: height});
  }, [width, height])

  const onHeightChange = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      const proportion = value / measure.height;
      return setMeasure({...measure, height: value, width: Math.round(measure.width * proportion) || 1 });
    }
    return setMeasure({...measure, height: value})
  }

  const onWidthChange = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (value === null) {
      return;
    }
    if (measure.proportionFix) {
      const proportion = value / measure.width;
      return setMeasure({...measure, width: value, height: Math.round(measure.height * proportion) || 1 });
    }
    return setMeasure({...measure, width: value})
  }

  const onPHeightChange = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (value === null) {
      return;
    }
    const proportion = value / measure.pHeight;
    if (measure.proportionFix) {
      return setMeasure({...measure, pHeight: value, pWidth: Math.round(measure.pWidth * proportion) || 1});
    }
    return setMeasure({...measure, pHeight: value})
  }

  const onPWidthChange = (e: KeyboardEvent<HTMLInputElement>) => {
    const value = parseInt((e.target as HTMLInputElement).value);
    if (value === null) {
      return;
    }
    const proportion = value / measure.pWidth;
    if (measure.proportionFix) {
      return setMeasure({...measure, pWidth: value, pHeight: Math.round(measure.pHeight * proportion) || 1});
    }
    return setMeasure({...measure, pWidth: value})
  }

  const calcWidthHeight = () => {
    if (measure.type === 'pixels') {
      return [measure.width, measure.height]
    } else {
      return [Math.round(measure.width * measure.pWidth / 100), Math.round(measure.height * measure.pHeight / 100)]
    }
  }

  return (
      <Flex vertical gap="large">
        <Flex gap='middle' align='end'>
          <Space direction='vertical'>
            <Space>
              Высота
              { measure.type === 'pixels'
                  ?
                  <InputNumber
                      placeholder='height'
                      min={ 1 }
                      maxLength={ 4 }
                      value={ measure.height }
                      onPressEnter={ onHeightChange }
                  />
                  :
                  <InputNumber
                      placeholder='height'
                      min={ 1 }
                      max={ 1000 }
                      value={ measure.pHeight }
                      onPressEnter={ onPHeightChange }
                  />
              }
            </Space>
            <Space>
              <Checkbox
                  onClick={ () => setMeasure({...measure, proportionFix: !measure.proportionFix}) }
              >
                Сохранять пропорции
              </Checkbox>
            </Space>
            <Space>
              Ширина
              { measure.type === 'pixels'
                  ?
                  <InputNumber
                      placeholder='width'
                      min={ 1 }
                      maxLength={ 4 }
                      value={ measure.width }
                      onPressEnter={ onWidthChange }
                  />
                  :
                  <InputNumber
                      placeholder='width'
                      min={ 1 }
                      max={ 1000 }
                      value={ measure.pWidth }
                      onPressEnter={ onPWidthChange }
                  />
              }
            </Space>
          </Space>
          <Select
              defaultValue="pixels"
              onChange={ (value) => setMeasure({...measure, type: value}) }
              options={[
                { value: 'pixels', label: 'px' },
                { value: 'percentage', label: '%' },
              ]}
          />
        </Flex>
        <Space>
          Алгоритм интерполяции
          <Select
              defaultValue="closestNeighbour"
              onChange={ (value) => setAlgorithm(value) }
              options={[
                { value: 'closestNeighbour', label: 'Ближайший сосед'},
                { value: 'bilinear', label: 'Билинейный'},
                { value: 'bicubic', label: 'Бикубический'},
              ]}
          />
        </Space>
        <Space>
          <Button type='primary' onClick={ () => onChangeSizeSubmit(calcWidthHeight()[0], calcWidthHeight()[1]) }>
            Изменить
          </Button>
        </Space>
      </Flex>
  )
}

export default ChangeSizeModal;