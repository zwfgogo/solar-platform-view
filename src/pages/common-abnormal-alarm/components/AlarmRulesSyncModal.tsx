import React, { useState } from 'react'
import { Button, Form, message, Modal, Select, Table } from 'wanke-gui'
import AbsoluteBubble from '../../../components/AbsoluteBubble'
import utils from '../../../public/js/utils'
import './alarm-rules-sync-modal.less'
const FormItem = Form.Item

interface Props {
  loading: boolean
  stationDataList: any[]
  results: any[]
  onSync: (stationIds) => void
  onOk: () => void
  onClose: () => void
}

const AlarmRulesSyncModal: React.FC<Props> = (props) => {
  const [stationIds, setStationIds] = useState([])
  const handleSync = () => {
    if (stationIds.length) {
      props.onSync(stationIds)
    } else {
      message.error(utils.intl('common.请选择电站'))
    }
  }

  const columns = [
    {
      title: utils.intl('电站'),
      dataIndex: 'title',
      render: (text) => <AbsoluteBubble>{text}</AbsoluteBubble>
    },
    {
      title: utils.intl('同步时间'),
      dataIndex: 'time',
      width: 170,
    },
    {
      title: utils.intl('DPU'),
      dataIndex: 'beeIds',
      width: 200,
      render: (text) => {
        return (
          <div>
            {(text || []).map(item => (
              <div>{item};</div>
            ))}
          </div>
        )
      }
    },
    {
      title: utils.intl('是否成功'),
      dataIndex: 'success',
      width: 110,
      render: (text) => {
        return (
          <div>
            {(text || []).map(item => (
              <div>{item ? utils.intl('是') : utils.intl('否')}</div>
            ))}
          </div>
        )
      }
    }
  ]

  return (
    <Modal
      visible
      width={800}
      title={utils.intl('异常规则同步')}
      onOk={props.onClose}
      onCancel={props.onClose}
      footer={(
        <Button type="primary" onClick={props.onClose}>{utils.intl('确定')}</Button>
      )}
    >
      <section className="alarm-rules-sync-modal">
        <div className="sync-modal-filter form-item-without-error">
          <FormItem label={utils.intl('选择导出电站')} style={{ flexGrow: 1 }}>
            <Select
              dataSource={props.stationDataList}
              mode="multiple"
              style={{ width: '100%' }}
              value={stationIds}
              maxTagCount='responsive'
              allowClear
              onChange={setStationIds} />
          </FormItem>
          <Button
            type="primary"
            onClick={handleSync}
            style={{ flexShrink: 0, marginLeft: 16 }}
            loading={props.loading}
          >{utils.intl('同步')}</Button>
        </div>
        <div style={{ marginBottom: 8 }}>{utils.intl('同步结果')}:</div>
        <div>
          <Table
            className="small-spacing-table"
            scroll={{ y: 300 }}
            pagination={false}
            columns={columns}
            dataSource={props.results}
          />
        </div>
      </section>
    </Modal>
  )
}

export default AlarmRulesSyncModal
