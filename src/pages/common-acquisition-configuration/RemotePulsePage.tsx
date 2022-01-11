/**
 * 摇脉换表页面
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GlobalState } from 'umi'
import { Button, message, Modal, Table1 } from 'wanke-gui'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { globalNS } from '../constants'
import { makeConnect } from '../umi.helper'
import { modelNamespace, AcquisitionManagement } from './model'
import "./index.less"
import utils from '../../public/js/utils'
import RemotePulseForm from './components/RemotePulseForm'
import moment, { Moment } from 'moment'
import { InfoCircleFilled } from 'wanke-icon'

interface Props extends PageProps, GlobalState, MakeConnectProps<AcquisitionManagement>, AcquisitionManagement {
  deviceId: number;
  pointNumber: number;
  loading: boolean;
  typeTitle: string;
  device?: any;
  terminalId: number
  saveRemotePulseLoading: boolean
}

const RemotePulsePage: React.FC<Props> = (props) => {
  const { pageId, deviceId, pointNumber, remotePulseList, loading, startVal, endVal, device } = props

  const [visible, setVisible] = useState(false);
  const [nowRecord, setNowRecord] = useState({})

  useEffect(() => {
    props.action('getRemotePulse', { deviceId, pointNumber })
  }, [deviceId, pointNumber])

  const openModal = useCallback(
    (record?: any) => {
      setVisible(true);
      setNowRecord(record);
    }, []);

  // modal 关闭
  const onCancel = useCallback(
    () => {
      props.action('updateState', { endVal: null, startVal: null });
      setVisible(false);
    }, []);

  // 点击确定,验证，保存
  const onOk = useCallback(
    (form) => {
      form.validateFields().then((value) => {
        if(nowRecord){
          props.action('updateRemotePulse', { deviceId, pointNumber, value: measureFormDataToService({ ...nowRecord, ...value, pointNumber, deviceId }) })
          .then(errorCode => {
            if(errorCode === 0){
              message.success(utils.intl('保存成功'));
              props.action('updateState', { endVal: null, startVal: null });
              setVisible(false);
            }
          })
        }else{
          props.action('addRemotePulse', { deviceId, pointNumber, value: measureFormDataToService({...value, deviceId, pointNumber, originalPid: endVal?.pointNumber ?? pointNumber, currentPid: startVal?.pointNumber ?? pointNumber }) })
          .then(errorCode => {
            if(errorCode === 0){
              message.success(utils.intl('保存成功'));
              props.action('updateState', { endVal: null, startVal: null });
              setVisible(false);
            }
          })
        }
      })
    }, [deviceId, pointNumber, JSON.stringify(nowRecord), JSON.stringify(endVal), JSON.stringify(startVal)]);

  // 初始化form
  const initForm = useCallback((form) => {
    if(nowRecord) {
      form.setFieldsValue(measureServiceToFormData(nowRecord));
      props.action('getEndMeasure', { pointNumber, endTime: nowRecord.stopTime });
      props.action('getStartMeasure', { pointNumber, startTime: nowRecord.startTime });
    }
  }, [JSON.stringify(nowRecord), pointNumber]);

  // 测量点表单数据从服务端转前端
  const measureServiceToFormData = useCallback((sData: any = {}) => {
    const serviceData = _.cloneDeep(sData);
    if (serviceData.stopTime) serviceData.stopTime = moment(serviceData.stopTime);
    if (serviceData.startTime) serviceData.startTime = moment(serviceData.startTime);
    return serviceData;
  }, []);

  // 测量点表单数据从前端转服务端
  const measureFormDataToService = useCallback((fData: any = {}) => {
    const formData = _.cloneDeep(fData);
    formData.stopTime = formData.stopTime.format('YYYY-MM-DD HH:mm:ss');
    formData.startTime = formData.startTime.format('YYYY-MM-DD HH:mm:ss');
    return formData;
  }, []);


  const handleStopTimeChange = useCallback((date: Moment) => {
    props.action('getEndMeasure', { pointNumber, endTime: date.format('YYYY-MM-DD HH:mm:ss') })
  }, [pointNumber]);

  const handleStartTimeChange = useCallback((date: Moment) => {
    props.action('getStartMeasure', { pointNumber, startTime: date.format('YYYY-MM-DD HH:mm:ss') })
  }, [pointNumber]);

  // 打开删除modal 
  const openDeleteModal = (record?: any) => {
    const modal = Modal.warn({
      title: utils.intl('是否删除{0}', '换表记录'),
      className: "acq-receiver-delete-modal",
      content: (
        <>
          <p>{utils.intl('删除后将不可恢复，请谨慎操作，你还要继续吗')}?</p>
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => modal.destroy()} style={{ marginRight: 8 }}>{utils.intl('取消')}</Button>
            <Button type="primary" onClick={() => {
              props.action('deleteRemotePulse', { deviceId: device?.id, pointNumber, id: record.id }).then(errorCode => {
                if (errorCode === 0) {
                  message.success(utils.intl('删除成功'))
                }
              })
              modal.destroy()
            }}>{utils.intl('确定')}</Button>
          </div>
        </>
      ),
      icon: <InfoCircleFilled color="rgba(250,173,20,0.85)" />,
      okButtonProps: {
        style: {
          display: "none"
        }
      },
      cancelText: utils.intl('取消'),
      okText: utils.intl('确定'),
    });
  }

  const columns = [
    { title: utils.intl('序号'), dataIndex: 'num', key: 'num', width: 65, render: (text, record, index) => index + 1 },
    { title: utils.intl('原点号'), dataIndex: 'originalPid', key: 'originalPid' },
    { title: utils.intl('原点号停用时间'), dataIndex: 'stopTime', key: 'stopTime', width: 180 },
    { title: utils.intl('原点号结束示值'), dataIndex: 'stopValue', key: 'stopValue' },
    { title: utils.intl('新点号'), dataIndex: 'currentPid', key: 'currentPid' },
    { title: utils.intl('新点号启用时间'), dataIndex: 'startTime', key: 'startTime', width: 180 },
    { title: utils.intl('新点号起始示值'), dataIndex: 'startValue', key: 'startValue' },
    {
      title: utils.intl('操作'), dataIndex: 'operation', key: 'operation', align: "right", render: (text, record) => (
        <div className="table-btns">
          <div onClick={() => openModal(record)}>{utils.intl('编辑')}</div>
          { record.type === 1 ? <div onClick={() => openDeleteModal(record)}>{utils.intl('删除')}</div> : null }
        </div>
      )
    },
  ];

  const measurePoint = useMemo(() => {
    return (props.measurePointList ?? []).find(i => i.terminal?.id === props.terminalId)
  }, [JSON.stringify(props.measurePointList), props.terminalId, pointNumber])

  return (
    <Page pageId={pageId} className="acq-page" pageTitle={utils.intl('遥脉信号更换记录')}>
      <header className="no-before border-header">
        <span className="label" style={{ marginLeft: 16 }}>{utils.intl('设备名称')}</span>
        <span className="value">{device?.title}</span>
        <span className="label">{utils.intl('测量点')}</span>
        <span className="value">{measurePoint?.title ?? utils.intl('公共测量点')}</span>
        <span className="label">{utils.intl('数据项名称')}</span>
        <span className="value">{props.typeTitle}</span>
        <div className="btn-group" style={{ top: 12, right: 16 }}>
          <Button type="primary" size="small" onClick={() => openModal(null)}>{utils.intl('示数重置')}</Button>
          <Button size="small" onClick={() => props.action("onRemotePulseExport", { deviceId: device?.id, pointNumber })}>{utils.intl('导出')}</Button>
        </div>
      </header>
      <div className="table-box" style={{ padding: 16, height: 'calc(100% - 51px)' }}>
        <Table1
          columns={columns}
          dataSource={remotePulseList}
          loading={loading}
        />
      </div>
      <Modal
        visible={visible}
        title={nowRecord ? utils.intl('编辑换表记录') : utils.intl('新增换表记录')}
        wrapClassName="acq-modal-box"
        width={480}
        footer={null}
        onCancel={onCancel}
      >
        <RemotePulseForm
          startValue={startVal}
          stopValue={endVal}
          handleStopTimeChange={handleStopTimeChange}
          handleStartTimeChange={handleStartTimeChange}
          loading={props.saveRemotePulseLoading}
          onCancel={onCancel}
          onOk={onOk}
          initForm={initForm}
        />
        {/* {
           modalType === 1 || modalType === 2 ?
             <MeasurePointsForm
               terminalDataSource={[]}
               secondaryDataSource={[]}
               onCancel={onCancel}
               onOk={onOk}
               initForm={initForm}
             /> :
             modalType === 3 || modalType === 4 ?
               <PointForm
                 unitDataSource={unitList}
                 accuracyDataSource={accuracyList}
                 onCancel={onCancel}
                 onOk={onOk}
                 initForm={initForm}
               />
               :
               modalType === 5 || modalType === 6 ?
                 <DataItemForm
                   onCancel={onCancel}
                   onOk={onOk}
                   initForm={initForm}
                 /> : null
         } */}
      </Modal>
    </Page>
  )
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    theme: state[globalNS].theme,
    stationList: state[globalNS].stationList,
    selectedStationId: state[globalNS].selectedStationId,
    userId: state[globalNS].userId,
    loading: getLoading("getRemotePulse"),
    saveRemotePulseLoading: getLoading('addRemotePulse') || getLoading('updateRemotePulse'),
  }
}

export default makeConnect(modelNamespace, mapStateToProps)(RemotePulsePage);