import React, {useEffect, useState} from 'react'
import {Modal, Form, TextItem, NumberItem, FormContainer} from 'wanke-gui'
import {maxLengthRule} from '../../../util/ruleUtil'

import utils from '../../../public/js/utils'

interface Props {
  stationId: number
  visible: boolean
  detail?: any
  addVideoItem?: (param) => void
  updateVideoItem?: (param) => void
  onCancel: () => void
}

const EditVideoItem: React.FC<Props> = function (this: null, props) {
  let [form] = Form.useForm()
  const [title, setTitle] = useState('')
  const [urlAddress, setUrlAddress] = useState('')
  const [frequency, setFrequency] = useState(null)
  const [brand, setBrand] = useState('')

  const confirm = () => {
    form.validateFields().then(() => {
      if (props.detail) {
        props.updateVideoItem({
          id: props.detail.id,
          title: title,
          urlAddress: urlAddress,
          frequency: frequency,
          brand: brand,
        })
      } else {
        props.addVideoItem({
          stationId: props.stationId,
          title: title,
          urlAddress: urlAddress,
          frequency: frequency,
          brand: brand,
        })
      }
    })
  }

  useEffect(() => {
    if (props.detail) {
      setTitle(props.detail.title)
      setUrlAddress(props.detail.urlAddress)
      setFrequency(props.detail.frequency)
      setBrand(props.detail.brand)
    }
  }, [])

  return (
    <Modal
      centered
      bodyStyle={{color: 'white'}}
      width={480}
      title={props.detail == null ? utils.intl('添加监控设备') : utils.intl('编辑监控设备')}
      visible={props.visible}
      onOk={confirm}
      onCancel={props.onCancel}
      className="add-data-point-dialog add-video-form"
    >
      <FormContainer form={form} className="flex-wrap">

        <TextItem
          label={utils.intl('视频监控名称')}
          rules={[{required: true}, maxLengthRule(32)]}
          value={title}
          onChange={setTitle}
        />
        <TextItem
          label={utils.intl('URL地址')}
          rules={[{required: true}]}
          value={urlAddress}
          onChange={setUrlAddress}
        />
        <NumberItem
          label={utils.intl('数据频率')}
          placeholder={utils.intl('请输入')}
          value={frequency}
          onChange={setFrequency}
          precision={0}
          suffix={utils.intl('秒')}
        />
        <TextItem
          label={utils.intl('设备品牌')}
          rules={[maxLengthRule(32)]}
          value={brand}
          onChange={setBrand}
        />

      </FormContainer>

    </Modal>
  )
}

export default EditVideoItem
