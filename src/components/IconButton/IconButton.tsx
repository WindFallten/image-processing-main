import { Button, Tooltip } from 'antd';
import Icon from '@ant-design/icons/lib/components/Icon';
import { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import './IconButton.css';

interface IconButtonProps {
  active: boolean
  component: React.ComponentType<CustomIconComponentProps | React.SVGProps<SVGSVGElement>> | React.ForwardRefExoticComponent<CustomIconComponentProps> | undefined
  hint: string
  onIconButtonClick: () => void
}

const IconButton = ({
  active,
  component,
  hint='Нет подсказки',
  onIconButtonClick,
}: IconButtonProps) => {
  return (
    <Tooltip overlayStyle={{ whiteSpace: 'pre-line' }} placement='bottom' title={ hint }>
      { active
        ?
        <Button type='primary' className='icon-btn' onClick={ onIconButtonClick }>
          <Icon style={{ fontSize: '24px' }} component={ component } />
        </Button>
        :
        <Button className='icon-btn' onClick={ onIconButtonClick }>
          <Icon style={{ fontSize: '24px' }} component={ component } />
        </Button>
      }
    </Tooltip>
  )
};

export default IconButton;
