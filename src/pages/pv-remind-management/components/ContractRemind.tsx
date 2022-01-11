import moment from 'moment'
import React from 'react'
import { ModalName } from '..'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import utils from '../../../public/js/utils'
import { remind_management } from '../../constants'
import { makeConnect } from '../../umi.helper'
import { AdvanceTimeCycle } from '../contants'
import { getTagType, RemindManagementModal } from '../model'
import RemindCard, { TagType } from './RemindCard'
import styles from './styles/contract-remind.less'

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  onEdit: (record, type: ModalName) => void
}

const ContractRemind: React.FC<Props> = (props) => {
  const handleDelete = (record) => {
    props.action('deleteRemindInto', { id: record.id })
  }

  return (
    <div className="remind-container" style={{ marginRight: -15 }}>
      {props.contractList.map((item, index) => (
        <RemindCard
          key={item.id}
          onDelete={() => handleDelete(item)}
          onEdit={() => props.onEdit(item, ModalName.Contract)}
          title={item.title}
          style={{ marginRight: 15, marginBottom: 10, height: 'calc(100% - 10px)' }}
          contentList={[
            [`${utils.intl('remind.开始时间')}:`, item.startTime],
            [`${utils.intl('remind.结束时间')}:`, item.endTime],
            [`${utils.intl('remind.是否提醒')}:`, item.breakerStatus ? utils.intl(`remind.开启`) : utils.intl(`remind.关闭`)],
            [`${utils.intl('remind.提醒时间')}:`, item.breakerStatus ? advanceTimeCycleMap[item.advanceTimeCycle] : '-']
          ]}
          tagType={getTagType(item.advanceTimeCycle, item.endTime, item.breakerStatus)}
        />
      ))}
    </div>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
  }
}

export default makeConnect(remind_management, mapStateToProps)(ContractRemind)

export const advanceTimeCycleMap = {
  [AdvanceTimeCycle.Day]: utils.intl('remind.提前一天'),
  [AdvanceTimeCycle.Month]: utils.intl('remind.提前三十天'),
  [AdvanceTimeCycle.Week]: utils.intl('remind.提前七天'),
}
