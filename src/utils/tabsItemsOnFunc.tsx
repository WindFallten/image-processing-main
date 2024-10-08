import type { TabsProps } from 'antd';
import FileUpload from '../components/FileUpload/FileUpload';
import URLUpload from '../components/URLUpload/URLUpload';

const tabsItemsOnFunc = (func: Function) => {
  const tabsItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Загрузка по файлу',
      children: <FileUpload onSuccessUpload={ (file) => { func(file) }}/>,
    },
    {
      key: '2',
      label: 'Загрузка по URL',
      children: <URLUpload onSuccessUpload={ (file) => { func(file) }}/>,
    },
  ];
  return tabsItems;
}

export default tabsItemsOnFunc
