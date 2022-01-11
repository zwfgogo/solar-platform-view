import React, {FC, useState} from 'react'
import {FullLoading, message, Modal, Upload} from 'wanke-gui'
import {ModalProps} from 'antd/lib/modal/Modal'
import XLSX from 'xlsx'
import classnames from 'classnames'

import {InboxOutlined} from 'wanke-icon'
import utils from '../public/js/utils'

const {Dragger} = Upload

export interface UploadCsvProps extends ModalProps {
  onImport: (list) => void
  loading?: boolean
  attrKeyMap?: {
    [key: string]: string
  }
}

const ImportExcelDialog: FC<UploadCsvProps> = function (props: UploadCsvProps) {
  const { attrKeyMap = {} } = props
  // 上传是否成功
  const [fileList, setFileList] = useState([])

  const newProps = {
    accept: '.csv,.xlsx,.xls',
    name: 'file',
    beforeUpload(file) {
      const fileReader = new FileReader()
      fileReader.onload = event => {
        const result = event.target.result
        const workbook = XLSX.read(result, {type: 'array'})
        let data = []
        for (const sheet in workbook.Sheets) {
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            data = data.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]))
            break
          }
        }
        let dataList = []
        for (let i = 0; i < data.length; i++) {
          let item = data[i]
          const keys = Object.keys(item)
          const result = {}
          keys.forEach(key => {
            const attr = attrKeyMap[key] ?? key
            result[attr] = item[key]
          })
          dataList.push(result)
        }
        props.onImport(dataList)
      }
      // 以二进制方式打开文件
      fileReader.readAsArrayBuffer(file)
      return false
    }
  }
  return (
    <Modal
      visible={props.visible}
      title={utils.intl('导入')}
      onCancel={props.onCancel}
      footer={null}
    >
      <div className={classnames('f-pr uploadcon')}>
        {props.loading ? <FullLoading /> : null}
        <Dragger {...newProps} fileList={fileList}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined/>
          </p>
          <p className="fontLighter">{utils.intl('excel.单击或拖动文件到此区域')}</p>
          <p className="fontLighter">{utils.intl('支持扩展名xls,xlsx,csv的文件')}</p>
        </Dragger>
      </div>
    </Modal>
  )
}

export default ImportExcelDialog
