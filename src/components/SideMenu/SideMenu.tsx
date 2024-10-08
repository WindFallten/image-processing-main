import { PixelInfoI } from '../../App';
import IconButton from '../IconButton/IconButton';
import PickColorMenu from '../PickColorMenu/PickColorMenu';
import { Collapse } from 'antd';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { ReactComponent as HandSvg } from '../../assets/hand.svg';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { ReactComponent as PipetteSvg } from '../../assets/pipette.svg';
import './SideMenu.css';

export interface SideMenuProps {
  color1: PixelInfoI
  color2: PixelInfoI
  currentTool: number
  onCurrentToolChange: (id: number) => void
  children?: React.ReactNode
}

const SideMenu = ({
    color1,
    color2,
    currentTool,
    onCurrentToolChange,
    children,
  }: SideMenuProps) => {
  return (
    <>
      <div className="side-menu">

      {children}
      <div className="tools">
        <IconButton
          active={ currentTool === 0 }
          component={ HandSvg }
          hint="Инструмент для передвижения картинки"
          onIconButtonClick={ () => onCurrentToolChange(0) }
        />
        <IconButton
          active={ currentTool === 1 }
          component={ PipetteSvg }
          hint={`Пипетка для извлечения цвета из изображения
            Выбор первого цвета: ЛКМ
            Выбор второго цвета: Ctrl + ЛКМ
          `}
          onIconButtonClick={ () => onCurrentToolChange(1) }
        />
      </div>
      { currentTool === 1 &&
        <Collapse
          collapsible="header"
          bordered={ false }
          size='small'
          defaultActiveKey={['1']}
          items={[
            {
              key: '1',
              label: 'Пипетка',
              children: <PickColorMenu color1={ color1 } color2={ color2 }/>,
            },
          ]}
        />
      }
      </div>
    </>
  )
};

export default SideMenu;
