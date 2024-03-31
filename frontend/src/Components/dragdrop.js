import React from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;
const props = {
  name: 'file',
  multiple: true,
  action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
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
const dragdrop = () => (
  <div className="fixed bottom-0 left-0 w-full flex justify-center">
    <div className="bg-blue-50 p-2 rounded-lg h-96">
        {/* Your component content */}
          <Dragger {...props} className='h-lvh'>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from uploading company data or other
              banned files.
            </p>
          </Dragger>
       
      </div>
</div>
);
export default dragdrop;
// import React from 'react';
// import { InboxOutlined } from '@ant-design/icons';
// import { message, Upload } from 'antd';
// const { Dragger } = Upload;
// const props = {
//   name: 'file',
//   multiple: true,
//   action: 'https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188',
//   onChange(info) {
//     const { status } = info.file;
//     if (status !== 'uploading') {
//       console.log(info.file, info.fileList);
//     }
//     if (status === 'done') {
//       message.success(`${info.file.name} file uploaded successfully.`);
//     } else if (status === 'error') {
//       message.error(`${info.file.name} file upload failed.`);
//     }
//   },
//   onDrop(e) {
//     console.log('Dropped files', e.dataTransfer.files);
//   },
// };

// const dragdrop = () => (
//   <div className="fixed bottom-0 left-0 w-full flex justify-center">
//     <div className="bg-gray-200 p-8 rounded-lg">
//       <Dragger {...props}>
//         <p className="ant-upload-drag-icon">
//           <InboxOutlined />
//         </p>
//         <p className="ant-upload-text">Click or drag file to this area to upload</p>
//         <p className="ant-upload-hint">
//           Support for a single or bulk upload. Strictly prohibited from uploading company data or other
//           banned files.
//         </p>
//       </Dragger>
//     </div>
//   </div>
// );

// export default dragdrop;
