import React, {useState} from 'react'
import {Button, Modal, Popover, Select} from 'wanke-gui'
import Label from '../../../components/Label'

import utils from '../../../public/js/utils'

interface Props {
  options: any[]
  visible: boolean
  onCancel: () => void
  onConfirm: (value: number) => void
}

const SelectCopyEnergyUnitDialog: React.FC<Props> = function (this: null, props) {
  const [value, setValue] = useState(null)
  const [showConfirm, setShowConfirm] = useState(null)

  const tip = (
    <div>{utils.intl('该操作会覆盖当前储能单元的策略指令内容，请确认是否继续？')}
      <div style={{marginTop: 5, textAlign: 'right'}}>
        <Button size={'small'} onClick={() => setShowConfirm(false)}>{utils.intl('取消')}</Button>
        <Button style={{marginLeft: 5}} size={'small'} type="primary"
                onClick={() => props.onConfirm(value)}>{utils.intl('确定')}</Button>
      </div>
    </div>
  )

  return (
    <Modal
      centered
      width={'500px'}
      title={utils.intl('复制对象')}
      visible={props.visible}
      className="copy-energy-dialog"
      footer={<div>
        <Button onClick={props.onCancel}>{utils.intl('取消')}</Button>
        <Popover title={utils.intl('提示')} trigger={'click'} content={tip} visible={showConfirm}
                 onVisibleChange={(v) => v == false && setShowConfirm(v)}>
          <Button type="primary" disabled={!value || showConfirm}
                  onClick={() => setShowConfirm(true)}>{utils.intl('复制')}</Button>
        </Popover>
      </div>}
    >
      <div className="vh-center">
        <div>
          <Label>{utils.intl('请选择复制对象')}</Label>
          <Select style={{width: 300}} dataSource={props.options} onChange={setValue}></Select>
        </div>
      </div>
    </Modal>
  )
}

export default SelectCopyEnergyUnitDialog
