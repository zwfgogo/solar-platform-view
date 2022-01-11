import moment from 'moment';
import React from 'react';
import { ModalName } from '..';
import MakeConnectProps from '../../../interfaces/MakeConnectProps';
import utils from '../../../public/js/utils';
import { remind_management } from '../../constants';
import { makeConnect } from '../../umi.helper';
import { ReportTimeCycle } from '../contants';
import { RemindManagementModal } from '../model';
import RemindCard, { TagType } from './RemindCard';

interface Props extends MakeConnectProps<RemindManagementModal>, RemindManagementModal {
  onEdit: (record, type: ModalName) => void
}

const ReportRemind: React.FC<Props> = (props) => {
  const handleDelete = (record) => {
    props.action('deleteRemindInto', { id: record.id })
  }

  function getTimeCycle(timeCycle) {
    const list = timeCycle.split(',') 
    return list.map(item => reportTimeCycleMap[item]).join(',')
  }

  return (
    <div className="remind-container" style={{ marginRight: -15 }}>
      {props.reportList.map((item, index) => {
        let pushTime = item.pushTime ? moment(item.pushTime, 'HH:mm:ss').format('HH:mm') : item.pushTime

        return (
          <RemindCard
            key={index}
            onDelete={() => handleDelete(item)}
            onEdit={() => props.onEdit(item, ModalName.Report)}
            title={item.title}
            style={{ marginRight: 15, marginBottom: 10, height: 'calc(100% - 10px)' }}
            contentList={[
              [`${utils.intl('remind.是否提醒')}:`, item.breakerStatus ? utils.intl('remind.开启') : utils.intl('remind.关闭')],
              [`${utils.intl('remind.推送周期')}:`, item.breakerStatus ? getTimeCycle(item.timeCycle) : '-'],
              [`${utils.intl('remind.推送时段')}:`, item.breakerStatus ? pushTime : '-']
            ]}
          />
        )
      })}
    </div>
  );
};

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
  }
}

export default makeConnect(remind_management, mapStateToProps)(ReportRemind)

const reportTimeCycleMap = {
  [ReportTimeCycle.Day]: utils.intl('remind.每天'),
  [ReportTimeCycle.Week]: utils.intl('remind.每周周一'),
  [ReportTimeCycle.Month]: utils.intl('remind.每月1日'),
}
