import { Button } from 'antd'
import React, { useState } from 'react'
import { Modal, Form, Select, message } from 'wanke-gui'
import { isZh } from '../../../core/env'
import utils from '../../../public/js/utils'
import { getFormLayout } from '../../../util/utils'

const FormItem = Form.Item

interface Props {
  loading: boolean
  stationDataList: any[]
  onOk: (stationIds: any[]) => void
  onClose: () => void
}

const AlarmRulesExportModal: React.FC<Props> = (props) => {
  const [stationIds, setStationIds] = useState([])

  const handleOk = () => {
    if (stationIds.length) {
      props.onOk(stationIds)
    } else {
      message.error(utils.intl('common.请选择电站'))
    }
  }

  return (
    <Modal
      visible
      width={640}
      title={utils.intl('异常规则导出')}
      onOk={handleOk}
      onCancel={props.onClose}
      confirmLoading={props.loading}
      footer={(
        <Button type="primary" onClick={handleOk}>{utils.intl('导出')}</Button>
      )}
    >
      <Form layout={getFormLayout()} className="form-item-without-error">
        <FormItem label={utils.intl('选择导出电站')}>
          <Select
            dataSource={props.stationDataList}
            mode="multiple"
            style={{ width: 420 }}
            value={stationIds}
            maxTagCount='responsive'
            dropdownMatchSelectWidth={260}
            dropdownStyle={{
              width: 260,
              minWidth:260,
              maxWidth: 260
            }}
            allowClear
            onChange={setStationIds} />
        </FormItem>
      </Form>
    </Modal>
  )
}

export default AlarmRulesExportModal
