import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { UploadRequestOption } from 'rc-upload/lib/interface';
import { message, Upload } from 'antd';
import './FileUpload.css';

const { Dragger } = Upload;

const props: UploadProps = {
  name: 'file',
  multiple: true,
  action: '',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
  onDrop(e) {
    console.log('Dropped files', e.dataTransfer.files);
  },
};

export interface FileUploadProps {
  onSuccessUpload: (file: unknown) => void
}

const FileUpload = ({
  onSuccessUpload,
}: FileUploadProps) => {
  const handleUpload = (options: UploadRequestOption) => {
    onSuccessUpload(options.file)
  }

  return (
    <Dragger 
      accept="image/*"
      showUploadList={ false }
      customRequest={ (options) => handleUpload(options) } 
      maxCount={ 1 } {...props}
    >
      <p className="ant-upload-drag-icon">
        <InboxOutlined />
      </p>
      <p className="ant-upload-text">Нажмите на эту область или перетяните сюда файл</p>
      <p className="ant-upload-hint">
        Поддерживает загрузку только одного элемента
      </p>
    </Dragger>
  )
};

export default FileUpload;