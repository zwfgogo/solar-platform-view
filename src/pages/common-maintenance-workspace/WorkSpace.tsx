import React, { useEffect } from 'react'
import Page from "../../components/Page"
import PageProps from "../../interfaces/PageProps"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import ListWorkspace from './ListWorkspace'
import { WorkSpaceListState } from './models/workspace-list'
import { makeConnect } from "../umi.helper"
import { globalNS, workspace_list } from "../constants"
import FullContainer from "../../components/layout/FullContainer"
import Label from "../../components/Label"
import { Button, RangePicker } from 'wanke-gui'
import AddBugDialog from './component/NewBug'
import SwitchWorkDialog from './SwitchWorkDialog'
import SwitchWorkDetailDialog from './SwitchWorkDetailDialog'
import { disabledDateAfterToday } from "../../util/dateUtil"
import SwitchWorkQrcodeDialog from './SwitchWorkQrcodeDialog'
import utils from "../../public/js/utils";
import { CrumbsPortal } from '../../frameset/Crumbs'
import FormLayout from '../../components/FormLayout'

const { FieldItem } = FormLayout

interface Props extends PageProps, MakeConnectProps<WorkSpaceListState>, WorkSpaceListState {
  currentUserName: string
  loading: boolean
  detailLoading: boolean
  confirmLoading: boolean
  switchWorkInitLoading: boolean
  qrcodeUniqueId: any
}

const WorkSpace: React.FC<Props> = function (this: null, props) {
  const addSwitchWork = () => {
    const { dispatch } = props;
    // props.action('shiftingDuty')
    dispatch({
      type: 'workspace_list/fetchQrcodeImg',
    }).then(res => {
      props.updateState({ showQrcodeModal: true })
    })
    // props.action('onAdd')
  }

  const showAddBug = () => {
    props.action('fetchStationList')
    props.updateState({
      showUpdateBug: true,
      bugStationId: null,
      bugDate: null,
      discoverer: JSON.parse(sessionStorage.getItem('userInfo')).title,
      bugContent: null
    })
  }

  const lookSwitchWork = (id) => {
    props.updateState({ showSwitchWorkDetail: true })
    props.action('fetchSwitchWorkDetail', { id })
  }

  const updateSwitchWork = (id) => {
    props.updateState({ curRecordId: id })
    props.action('onChangeWork', { switchWorkType: 'edit' })
  }

  const onDateChange = (v) => {
    props.updateQuery({ startDate: v[0], endDate: v[1] })
  }

  useEffect(() => {
    props.updateState({ pageMounted: true })
    props.action('fetchList')
    props.action('fetchUserList')
    return () => props.action('resetModal')
  }, [])

  const onSearch = () => {
    props.action('fetchList')
  }

  const onReset = () => {
    const newState = new WorkSpaceListState()
    props.updateQuery({ startDate: newState.query.startDate, endDate: newState.query.endDate })
  }

  const { totalCount, list, query, switchWorkInitLoading, switchWorkType } = props
  return (
    <Page pageId={props.pageId} style={{ background: 'transparent', display: 'flex', flexDirection: 'column' }}>
      {
        props.showUpdateBug && (
          <AddBugDialog
            bugDate={props.bugDate}
            discoverer={props.discoverer}
            bugStationId={props.bugStationId}
            bugContent={props.bugContent}

            addBug={() => props.action('addBug')}
            updateState={props.updateState}
            visible={props.showUpdateBug}
            onExited={() => props.updateState({
              showUpdateBug: false
            })}
            confirmLoading={props.newLoading}
          />
        )
      }

      {
        props.showSwitchWork && (
          <SwitchWorkDialog
            type={switchWorkType}
            loading={switchWorkInitLoading}
            centered={true}
            number={props.number}
            date={props.date}
            dutyTitle={props.dutyTitle}
            runningModel={props.runningModel}
            runningStatus={props.runningStatus}
            shiftDate={props.shiftDate}
            shiftId={props.shiftId}
            shiftTitle={props.shiftTitle}
            shiftTime={props.shiftTime}
            time={props.time}
            systemAlarmProcess={props.systemAlarmProcess}
            systemAlarmSituation={props.systemAlarmSituation}
            systemControll={props.systemControll}
            taskCompletion={props.taskCompletion}

            userList={props.userList}
            action={props.action}
            updateState={props.updateState}
            visible={props.showSwitchWork}
            confirmLoading={props.confirmLoading}
            onExited={() => props.updateState({ showSwitchWork: false })}
          />
        )
      }

      {
        props.showSwitchWorkDetail && (
          <SwitchWorkDetailDialog
            detail={props.detail}
            loading={props.detailLoading}
            userList={props.userList}

            visible={props.showSwitchWorkDetail}
            onExited={() => props.updateState({ showSwitchWorkDetail: false })}
          />
        )
      }

      {
        props.showQrcodeModal && (
          <SwitchWorkQrcodeDialog
            dispatch={props.dispatch}
            closeModal={() => props.action('closeQrcodeModal')}
            qrcodeUniqueId={props.qrcodeUniqueId}
          />
        )
      }
      <CrumbsPortal>
        <Button type="primary" style={{ marginLeft: 8 }} onClick={showAddBug}>{utils.intl('记录缺陷')}</Button>
        <Button style={{ marginLeft: 8 }} type="primary" onClick={addSwitchWork}>{utils.intl('交接班')}</Button>
        <Button style={{ marginLeft: 8 }} type="primary" onClick={() => props.action('onExport')}>{utils.intl('导出')}</Button>
      </CrumbsPortal>
      <FormLayout onSearch={onSearch} onReset={onReset}>
        <FieldItem label={utils.intl('日期')}>
          <RangePicker
            value={[query.startDate, query.endDate]}
            onChange={onDateChange}
            disabledDate={current => disabledDateAfterToday(current)}
          />
        </FieldItem>
      </FormLayout>
      <div className="flex1 workspace-container">
        <ListWorkspace
          loading={props.loading}
          lookSwitchWork={lookSwitchWork}
          updateSwitchWork={updateSwitchWork}
          total={totalCount} page={query.page} size={query.size} onPageChange={props.onPageChange('fetchList')}
          dataSource={list}
        />
      </div>
        {/* <Tools>
          <Export onExport={() => props.action('onExport')}/>
        </Tools> */}
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    loading: getLoading('fetchList'),
    detailLoading: getLoading('fetchSwitchWorkDetail'),
    confirmLoading: getLoading('addSwitchWork') || getLoading('editSwitchWork'),
    switchWorkInitLoading: getLoading('onChangeWork'),
    currentUserName: state[globalNS].showName,
    newLoading: getLoading('addBug'),
  }
}

export default makeConnect(workspace_list, mapStateToProps)(WorkSpace)
