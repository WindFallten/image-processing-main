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
      <p className="ant-upload-text">Click or drag file to this area to upload</p>
      <p className="ant-upload-hint">
        Support for a single upload. Strictly prohibited from uploading company data or other
        banned files.
      </p>
    </Dragger>
  )
};

export default FileUpload;