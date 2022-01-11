import moment from 'moment'
import { Moment } from 'moment'
import React, { useEffect } from 'react'
import { FullLoading, Modal, Table, Table1 } from 'wanke-gui'
import AbsoluteFullDiv from '../../../components/AbsoluteFullDiv'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { battery_operation } from '../../constants'
import { formatValue } from '../../page.helper'
import { makeConnect } from '../../umi.helper'
import { BatteryOperationModel } from '../models'

interface Props extends MakeConnectProps<BatteryOperationModel>, BatteryOperationModel {
  time: Moment[]
  selectedEnergyUnitId: number
  closeModal: () => void
  fetchRecordListLoading?: boolean
}

const OperationRecordModal: React.FC<Props> = (props) => {
  const { time = [] } = props

  const handleCancel = () => {
    props.closeModal()
  }

  const columns: any = [
    {
      title: utils.intl('序号'),
      dataIndex: 'num'
    },
    {
      title: utils.intl('设备对象'),
      dataIndex: 'title'
    },
    {
      title: utils.intl('运维内容'),
      dataIndex: 'typeTitle'
    },
    {
      title: utils.intl('更换前容量'),
      dataIndex: 'beforeValue',
      render: (text) => formatValue(text)
    },
    {
      title: utils.intl('更换后容量'),
      dataIndex: 'afterValue',
      render: (text) => formatValue(text)
    },
    {
      title: utils.intl('备注'),
      dataIndex: 'remarks'
    }
  ];

  const fetchList = () => {
    let tList = time.slice()
    if (tList.length === 1) {
      tList[1] = moment(tList[0]).endOf('days')
    }

    props.action('fetchRecordList', {
      energyUnitId: props.selectedEnergyUnitId,
      dtime: tList.map(item => item.format('YYYY-MM-DD HH:mm:ss')).join(',')
    })
  }

  useEffect(() => {
    fetchList()
    return () => {
      props.updateState({
        recordList: []
      })
    }
  }, [])

  return (
    <Modal
      title={utils.intl('运维记录')}
      width={1200}
      visible={true}
      onCancel={handleCancel}
      destroyOnClose={true}
      footer={null}
    >
      <section>
        <header>
          <span style={{ marginRight: 8 }}>{time.map(item => item.format("YYYY-MM-DD")).join(' ~ ')}</span>
          <span>{utils.intl('运维记录')}</span>
        </header>
        <footer style={{ position: 'relative', marginTop: 16 }}>
          {props.fetchRecordListLoading && <FullLoading />}
          <Table
            pagination={false}
            columns={columns}
            dataSource={props.recordList}
            scroll={{ y: 400 }}
          />
        </footer>
      </section>
    </Modal>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    fetchRecordListLoading: getLoading('fetchRecordList'),
  }
}

export default makeConnect(battery_operation, mapStateToProps)(OperationRecordModal)
