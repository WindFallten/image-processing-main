import { Input, Form, Button } from 'antd';
import axios from 'axios';
import './URLUpload.css'

export interface URLUploadProps {
  onSuccessUpload: (file: File) => void
}

type FieldType = {
  url: string;
};

const URLUpload = ({
  onSuccessUpload,
}: URLUploadProps) => {
  return (
    <Form
      className='url-form' 
      name='urlUpload'
      onFinish={(values) => {
        axios
          .get(values.url, {
            responseType: 'blob'
          })
          .then(res => onSuccessUpload(new File(
            [res.data], 
            values.url.slice(
              values.url.lastIndexOf('/') + 1, 
              values.url.indexOf('.'), 
              { type: res.headers['content-type'] }
            ))))
          .catch(err => console.log(err))
      }}
    >
      <Form.Item<FieldType>
        className='url-input'
        name="url"  
      >
        <Input placeholder="Введите URL" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default URLUpload
