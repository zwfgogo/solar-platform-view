import React, { FC, useState } from 'react'
import { Button, Modal, Upload, message, Table } from 'wanke-gui'
import { ModalProps } from 'antd/lib/modal/Modal'
import XLSX from 'xlsx'
import classnames from 'classnames'

import { InboxOutlined } from "wanke-icon";
import utils from '../public/js/utils'

const { Dragger } = Upload


export interface UploadCsvProps extends ModalProps {
  // 按钮文字
  btnLabel?: string
  title?: string
  onImport: (data) => void
}

interface IuploadData {
  errorCode: number,
  results: any,
  errorMsg?: string
}

const UploadCsv: FC<UploadCsvProps> = function (props: UploadCsvProps) {
  const { title, btnLabel } = props
  // 弹窗的显示和隐藏
  const [visible, setVisible] = useState(false)

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
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { raw: false }))
            // 只取第一张表
            break
          }
        }
        props.onImport(data)
        setVisible(false)
      }
      // 以二进制方式打开文件
      fileReader.readAsArrayBuffer(file)
      return false
    }
  }
  return <>
    <Button type='primary' style={{ marginLeft: 20 }} onClick={() => setVisible(true)}>{btnLabel}</Button>
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
        <Dragger {...newProps} fileList={[]}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="fontLighter">{utils.intl("单击或拖动文件到此区域")}</p>
          <p className="fontLighter">{utils.intl("支持扩展名.xls,.xlsx,.csv的文件")}</p>
        </Dragger>
      </div>
    </Modal>
  </>;
}

UploadCsv.defaultProps = {
  title: utils.intl('导入'),
  btnLabel: utils.intl('导入')
}
export default UploadCsv
