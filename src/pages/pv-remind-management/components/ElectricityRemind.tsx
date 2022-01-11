import moment from 'moment'
import React from 'react'
import { ModalName } from '..'
import AbsoluteBubble from '../../../components/AbsoluteBubble'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { remind_management } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { RemindManagementModal } from '../model'
import RemindCard, { TagType } from './RemindCard'
import styles from './styles/electricity-remind.less'

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  onEdit: (record, type: ModalName) => void
}

const ElectricityRemind: React.FC<Props> = (props) => {
  const handleDelete = (record) => {
    props.action('deleteRemindInto', { id: record.id })
  }

  const addUnit = (value) => {
    if (value === '' || value === null || value === undefined) return value
    return `${value}${utils.intl('AUD')}`
  }

  return (
    <div className="remind-container" style={{ marginRight: -15 }}>
      {props.electricityList.map((item, index) => (
        <RemindCard
          key={index}
          onDelete={() => handleDelete(item)}
          onEdit={() => props.onEdit(item, ModalName.Electricity)}
          title={item.title}
          style={{ marginRight: 15, marginBottom: 10, height: 'calc(100% - 10px)' }}
          contentList={[
            [`${utils.intl('remind.上限阈值')}:`, addUnit(item.upLimit)],
            [`${utils.intl('remind.下限阈值')}:`, addUnit(item.downLimit)],
            [`${utils.intl('remind.是否提醒')}:`, item.breakerStatus ? utils.intl('remind.开启') : utils.intl('remind.关闭')],
            [`${utils.intl('remind.提醒时间')}:`, item.breakerStatus ? formatTimeRange(item.timeRange) : '-']
          ]}
        />
      ))}
    </div>
  );
};

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
  }
}

export default makeConnect(remind_management, mapStateToProps)(ElectricityRemind)

function formatTimeRange(timeRange) {
  if (!timeRange) return timeRange
  return timeRange.split('-').map(str => moment(str, 'HH:mm:00').format('HH:mm')).join('-')
}