import React, { useEffect, useState } from 'react'
import {Form, FormContainer, Modal, SelectItem} from 'wanke-gui'
import { ValueName } from '../../../interfaces/CommonInterface'
import utils from '../../../public/js/utils'

//新增电站弹窗
interface Props {
  visible: boolean
  onExited: () => void
  onConfirm: (stationType: number) => void
  fetchStationTypes: () => void
  stationTypes: ValueName[]
}

const AddStationDialog: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.fetchStationTypes()
  }, [])

  const [form] = Form.useForm()
  const [stationType, setStationType] = useState(null)

  const handleSubmit = () => {
    form.validateFields().then(() => {
      props.onConfirm(stationType)
    })
  }

  return (
    <Modal
      title={utils.intl("新增电站")}
      visible={props.visible}
      onCancel={props.onExited}
      onOk={handleSubmit}
    >
      <FormContainer form={form}>
        <SelectItem label={utils.intl("电站类型")} dataSource={props.stationTypes}
          value={stationType} onChange={v => setStationType(v)} rules={[{ required: true }]}
        />
      </FormContainer>
    </Modal>
  )
}

export default AddStationDialog
