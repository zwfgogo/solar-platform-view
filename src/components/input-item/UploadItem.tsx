import React, { useState } from 'react';
import { Upload } from 'wanke-gui';
import { UploadFile, UploadProps } from 'antd/lib/upload/interface';

interface Props extends Omit<UploadProps, 'onChange'> {
  isOneFileUpload?: boolean;
  onChange?: (val: UploadFile[]) => void;
  value?: UploadFile[];
  hideFileList?: boolean;
}

const UploadItem: React.FC<Props> = ({ onChange, children, isOneFileUpload, hideFileList, value = [], ...restProps }) => {
  // const [fileList, setFileList] = useState([]);

  const uploadProps = {
    onRemove: file => {
      if(isOneFileUpload) {
        triggerChange([]);
      } else {
        const index = value.indexOf(file);
        const newFileList = value.slice();
        newFileList.splice(index, 1);
        triggerChange(newFileList);
      }
    },
    beforeUpload: file => {
      const newFileList = isOneFileUpload ? [file] : [...value, file];
      triggerChange(newFileList);
      return false;
    },
    fileList: value,
    showUploadList: !hideFileList
  };

  const triggerChange = changedValue => {
    if (onChange) {
      onChange(changedValue);
    }
  };

  return (
    <Upload {...uploadProps} {...restProps}>
      {children}
    </Upload>
  );
};

export default UploadItem;