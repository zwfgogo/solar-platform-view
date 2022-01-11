import React, { FC, useState } from 'react'
import { Button, Modal, Upload, message } from 'wanke-gui'
import { ModalProps } from 'antd/lib/modal/Modal'
import myAxios from '../../js/myAxios'
import classnames from 'classnames'
import { FullLoading } from "wanke-gui"
import { InboxOutlined } from "wanke-icon";
import utils from '../../../public/js/utils'
const { Dragger } = Upload

export interface UploadJsonProps extends ModalProps {
  // 自定义文案
  children?: React.ReactElement,
  beforeUpload?: (data, file: File) => any
  // 请求 url
  url: string,
  // 上传成功回调
  callback?: Function,
  // 按钮文字
  btnLabel?: string
}

interface IuploadData {
  errorCode: number,
  results: any,
  errorMsg?: string
}

const UploadJson: FC<UploadJsonProps> = function (props: UploadJsonProps) {
  const { children, title, beforeUpload, url, callback, btnLabel } = props
  // 弹窗的显示和隐藏
  const [visible, setVisible] = useState(false)
  // 上传是否成功
  const [status, setStatus] = useState('')
  const [fileList, setFileList] = useState([])
  const [loading, setLoading] = useState(false)
  const uploadAjax = async (data) => {
    // 请求接口
    try {
      setLoading(true);
      await myAxios({ method: 'post', data, url })
      // setStatus('success');
      Modal.success({
        title: utils.intl('上传成功')
      })
      setVisible(false)
      setLoading(false);
      callback()
    } catch (res) {
      setLoading(false);
      // let result = res.errorMsg.split(';').map((o, i) => {
      //   return (
      //     <p style={{marginBottom: '2px'}}>{i + 1}、{res.errorMsg.split(';')[i]}</p>
      //   )
      // })
      // Modal.error({
      //   content: <div>原因：{result}</div>,
      //   title: utils.intl('上传失败')
      // })
      // 上传失败
      // setStatus('fail');
      // console.log(res)
      // setDataSource(res.results);
    }
  }

  const newProps = {
    accept: '.json',
    name: 'file',
    // multiple: true,
    beforeUpload(file, fileList) {
      // 文件类型校验
      // 数据校验
      // 通过FileReader对象读取文件
      const fileReader = new FileReader()
      fileReader.onload = event => {
        // @ts-ignore
        try {
          const result = JSON.parse(event.target.result as string);
          const { result: uploadData, errorCode, errorMsg } = beforeUpload(result, file);
          if (errorCode !== 0) {
            message.error(errorMsg);
            return;
          }
          uploadAjax(uploadData);
        } catch (error) {
          message.error(utils.intl('文件不合法'));
        }
      }
      // 以二进制方式打开文件
      fileReader.readAsText(file)
      return false
    }
  }
  return <>
    <Button type='primary' className='e-mr10' onClick={() => setVisible(true)}>{btnLabel}</Button>
    <Modal
      visible={visible}
      title={title}
      onOk={() => {
        message.success(utils.intl('导入数据成功'))
        setVisible(false)
      }}
      onCancel={() => setVisible(false)}
      footer={null}
    >
      <div className={classnames('e-mb20 f-pr uploadcon', { 'f-dn': !(status !== 'fail') })}>
        {loading ? <FullLoading tip={utils.intl('导入中')} /> : ""}
        {children && (
          <div className='e-mb10'>
            {children}
          </div>
        )}
        <Dragger {...newProps} fileList={fileList}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="fontLighter">{utils.intl('单击或拖动文件到此区域')}</p>
          <p className="fontLighter">{utils.intl('支持扩展名.json的文件')}</p>
        </Dragger>
      </div>
    </Modal>
  </>;
}

UploadJson.defaultProps = {
  title: utils.intl('导入'),
  btnLabel: utils.intl('导入')
}
export default UploadJson