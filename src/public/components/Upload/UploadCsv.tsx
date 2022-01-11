import React, { FC, useState } from 'react'
import { Button, Modal, Upload, message, Table } from 'wanke-gui'
import { ModalProps } from 'antd/lib/modal/Modal'
import XLSX from 'xlsx'
import myAxios from '../../js/myAxios'
import classnames from 'classnames'
import utils from '../../js/utils'

import { InboxOutlined } from "wanke-icon";

const { Dragger } = Upload


export interface UploadCsvProps extends ModalProps {
  // 自定义文案
  children?: React.ReactElement,
  // 上传之前的数据校验与处理
  beforeUpload?: Function,
  // 请求 url
  url: string,
  // 上传成功回调
  callback?: Function,
  // 表格展示列
  columns: Array<any>,
  // 按钮文字
  btnLabel?: string
}

interface IuploadData {
  errorCode: number,
  results: any,
  errorMsg?: string
}

const UploadCsv: FC<UploadCsvProps> = function (props: UploadCsvProps) {
  const { children, title, columns, beforeUpload, url, callback, btnLabel } = props
  const newColumns = columns.filter((item) => {
    return (item.dataIndex !== 'action')
  })
  // 弹窗的显示和隐藏
  const [visible, setVisible] = useState(false)
  // 上传是否成功
  const [status, setStatus] = useState('')
  const [fileList, setFileList] = useState([])

  const [dataSource, setDataSource] = useState([])
  const uploadAjax = async (arr) => {
    // 请求接口
    try {
      await myAxios({ method: 'post', data: arr, url })
      // setStatus('success');
      Modal.success({
        title: utils.intl('上传成功')
      })
      setVisible(false)
      callback()
    } catch (res) {
      let result = res.errorMsg.split(';').map((o, i) => {
        return (
          <p style={{ marginBottom: '2px' }}>{res.errorMsg.split(';')[i]}</p>
        )
      })
      Modal.error({
        title: result
      })
      // 上传失败
      // setStatus('fail');
      // console.log(res)
      // setDataSource(res.results);
    }
  }

  const newProps = {
    accept: '.csv,.xlsx,.xls',
    name: 'file',
    // multiple: true,
    beforeUpload(file, fileList) {
      // 文件类型校验
      // 数据校验
      // 通过FileReader对象读取文件
      const fileReader = new FileReader()
      fileReader.onload = event => {
        // @ts-ignore
        const result = event.target.result
        // 以二进制流方式读取得到整份excel表格对象
        const workbook = XLSX.read(result, { type: 'array' })
        // 存储获取到的数据
        let data = []
        // 遍历每张工作表进行读取（这里默认只读取第一张表）
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // 利用 sheet_to_json 方法将 excel 转成 json 数据
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]))
            // 只取第一张表
            break
          }
        }
        const uploadData: IuploadData = beforeUpload(data)
        if (uploadData.errorCode === 0) {
          // 校验成功，走上传接口
          uploadAjax(uploadData.results)
        } else {
          // 提示校验失败信息
          utils.error(uploadData.errorMsg)
        }
      }
      // 以二进制方式打开文件
      fileReader.readAsArrayBuffer(file)
      return false
    }
  }
  return <>
    <Button type='primary' style={{ marginLeft: 16 }} onClick={() => setVisible(true)}>{btnLabel}</Button>
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
        <div className='e-mb10'>
          {children}
        </div>
        <Dragger {...newProps} fileList={fileList}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="fontLighter">{utils.intl("单击或拖动文件到此区域")}</p>
          <p className="fontLighter">{utils.intl("支持扩展名.xls,.xlsx,.csv的文件")}</p>
        </Dragger>

      </div>
      <div>
        {status == 'fail' && (
          <div className='boxshadow' style={{ paddingBottom: '50px' }}>
            <i
              className={classnames('iconfont boxclose p-pointer')}
              onClick={() => {
                // 删除块
                setStatus('')
              }}
            >
              &#xe64c;
            </i>
            <p>{utils.intl("以下数据导入失败, 请修改后重新导入")}</p>
            <Table columns={newColumns} dataSource={dataSource} pagination={false} rowKey='num' />
          </div>
        )}
      </div>
    </Modal>
  </>;
}

UploadCsv.defaultProps = {
  columns: [],
  title: utils.intl('导入'),
  btnLabel: utils.intl('导入')
}
export default UploadCsv