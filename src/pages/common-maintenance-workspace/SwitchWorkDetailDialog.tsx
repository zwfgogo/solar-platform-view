import React from 'react'
import BasicDialog, { DialogBasicProps } from "../../components/BasicDialog"
import { WorkSpaceListState } from './models/workspace-list'
import styles from './styles/SwitchWorkDetailDialog.less'
import moment from 'moment'
import DetailItem from "../../components/layout/DetailItem"
import { FullLoading } from "wanke-gui"
import utils from "../../public/js/utils";

type ModelKey =
  'userList'

/**
 *
 */
interface Props extends DialogBasicProps, Pick<WorkSpaceListState, ModelKey> {
  loading: boolean
  detail: any
}

class SwitchWorkDetailDialog extends BasicDialog<Props> {
  getTitle(): string {
    return utils.intl('交接班详情')
  }

  getWidth(): number {
    return 800
  }

  onOk() {
    this.props.onExited()
  }

  getFooter(): any {
    return null
  }

  renderBody() {
    const {
      number, date, time, dutyTitle, runningModel, runningStatus, shiftDate, shiftTime, shiftTitle,
      systemAlarmSituation, systemAlarmProcess, systemControll, taskCompletion
    } = this.props.detail

    return (
      <div className="switch-work-detail-dialog" style={{height: document.body.clientHeight - 300, overflow: 'auto'}}>
        {
          this.props.loading && (<FullLoading/>)
        }
        <div>
          <DetailItem label={utils.intl('值班日期')} txt={date ? moment(`${date} ${time}`).format('YYYY-MM-DD HH:mm') : ''}/>
          <DetailItem label={utils.intl('值班人')} txt={dutyTitle}/>
        </div>

        <div style={{marginTop: 10}}>
          <DetailItem label={utils.intl('交班时间')} txt={shiftDate ? moment(`${shiftDate} ${shiftTime}`).format('YYYY-MM-DD HH:mm') : ''}/>
          <DetailItem label={utils.intl('接班人')} txt={shiftTitle}/>
        </div>

        <div style={{marginTop: 10}}>
          <DetailItem label={utils.intl('编号')} txt={number}/>
        </div>

        <div className={styles['station-detail-title']} style={{padding: 15}}>{utils.intl('电站运行方式')}</div>
        <div className="station-detail">
          {runningModel.map((item, index) => {
            return (
              <DetailItem style={{padding: '3px 0'}} key={index} label={item.stationTitle} txt={item.detail}/>
            )
          })}
        </div>

        <div className={styles['station-detail-title']} style={{padding: 15}}>{utils.intl('电站状态')}</div>
        <div className="station-detail">
          {runningStatus.map((item, index) => {
            return (<DetailItem style={{padding: '3px 0'}} key={index} label={item.stationTitle} txt={item.detail}/>)
          })}
        </div>

        <div style={{marginTop: 15}}>
          <DetailItem style={{width: '95%'}} label={utils.intl('系统操作情况')} txt={systemAlarmSituation}/>
        </div>

        <div style={{marginTop: 10}}>
          <DetailItem style={{width: '95%'}} label={utils.intl('系统异常警告')} txt={systemAlarmProcess}/>
        </div>

        <div style={{marginTop: 10}}>
          <DetailItem style={{width: '95%'}} label={utils.intl('异常警告处理')} txt={systemControll}/>
        </div>

        <div style={{marginTop: 10}}>
          <DetailItem style={{width: '95%'}} label={utils.intl('领导交代事项')} txt={taskCompletion}/>
        </div>
      </div>
    )
  }
}

export default SwitchWorkDetailDialog
