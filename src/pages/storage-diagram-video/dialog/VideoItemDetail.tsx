import React, {useEffect, useState} from 'react'
import {Modal, Form, TextItem, NumberItem, FormContainer, Button} from 'wanke-gui'
import {maxLengthRule} from '../../../util/ruleUtil'

import utils from '../../../public/js/utils'
import DetailFormItem from '../../../components/DetailFormItem'

interface Props {
  detail: any
  onEdit: () => void
  onCancel: () => void
}

const VideoItemDetail: React.FC<Props> = function (this: null, props) {
  const { detail } = props

  return (
    <Modal
      centered
      width={480}
      title={utils.intl('详情')}
      visible={true}
      onCancel={props.onCancel}
      footer={[<Button onClick={props.onEdit} type="primary">{utils.intl('编辑')}</Button>]}
      className="add-data-point-dialog add-video-form"
    >
      <div>
        <DetailFormItem label={utils.intl('视频监控名称')} value={detail.title} />
        <DetailFormItem label={utils.intl('URL地址')} value={detail.urlAddress} />
        <DetailFormItem label={utils.intl('数据频率')} value={detail.frequency} suffix={utils.intl('秒')} />
        <DetailFormItem label={utils.intl('设备品牌')} value={detail.brand} />
      </div>
    </Modal>
  )
}

export default VideoItemDetail
