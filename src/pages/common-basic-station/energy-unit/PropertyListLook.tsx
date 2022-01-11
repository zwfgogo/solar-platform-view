import React, { useEffect, useState } from 'react'
import { Button, FullLoading, message, Modal, Table, Table1 } from "wanke-gui"
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import TypeManagerLook from '../station-update/input-type/TypeManagerLook'
import { handleModelDetail } from '../station.helper'
import FullContainer from '../../../components/layout/FullContainer'
import DetailItem2 from '../../../components/layout/DetailItem2'
import { DEVICE_TYPE, stationUpdateNS } from '../../constants'
import utils from '../../../public/js/utils'
import BorderHeader from '../../../components/BorderHeader'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import { WankeCircleRightOutlined } from 'wanke-icon'
import Forward from '../../../public/components/Forward'
import RecordModal from './RecordModal'
import ListItemDelete from '../../../components/ListItemDelete'
import TabPriceNew from '../station-update/TabPriceNew'
import AcquisitionModal from './AcquisitionModal'
import { makeConnect } from '../../umi.helper'
import { extractByKey } from '../../page.helper'
import { before } from 'lodash'
import { isZh } from '../../../core/env'

interface Props extends ActionProp {
  editAuthority: boolean
  deviceId: number
  deviceType: number
  detail: any
  deviceModels: any[]
  toEdit: () => void

  stationId: any
  forward: any
  back: any
  dataPointTotal: any
  dispatch: any
  listLoading: boolean
  deleteRecordSuccess: boolean
  postRecordSuccess: boolean
  putRecordSuccess: boolean

  bindCollectDevices: any
  list: any
  allCollectDevices: any
  postCollectDevicesSuccess: any
  acquisitionLoading: any
  time: any
  theme: any
}

const PropertyListLook: React.FC<Props> = function (this: null, props) {
  const [recordModal, setRecordModal] = useState(false)
  const [recordDetail, setRecordDetail] = useState({})
  const [acquisitionModal, setAcquisitionModal] = useState(false)
  const [deviceCategories, setDeviceCategories] = useState('')

  if (!props.detail) {
    return <FullLoading />
  }
  useEffect(() => {
    if (props.deviceId) {
      //多了次请求 暂时注释
      // props.action('fetchDeviceDetail', { deviceId: props.deviceId })
      props.action('fetchDeviceModel', { modelTypeId: props.deviceType, modId: props.deviceId })
      props.action('getList', { deviceId: props.deviceId })
      props.action('getCollectDevicesByDevices', { id: props.deviceId })
      props.action('fetchList', { stationId: props.stationId, deviceId: props.deviceId })
    }
  }, [props.deviceId])

  useEffect(() => {
    if (props.deviceId) {
      props.dispatch({
        type: 'stationRecordModel/getDeviceCategoriesByDeviceId', payload: { deviceId: props.deviceId }
      }).then(res => {
        setDeviceCategories(res?.name)
      });
    }
  }, [props.deviceId])

  useEffect(() => {
    if (props.deleteRecordSuccess) {
      message.success(utils.intl('删除成功'))
      props.action('getList', { deviceId: props.deviceId })
    }
  }, [props.deleteRecordSuccess])

  useEffect(() => {
    if (props.postRecordSuccess) {
      setRecordModal(false);
      setRecordDetail({})
      message.success(utils.intl('新增成功'))
      props.action('getList', { deviceId: props.deviceId })
    }
  }, [props.postRecordSuccess])

  useEffect(() => {
    if (props.putRecordSuccess) {
      setRecordModal(false);
      setRecordDetail({})
      message.success(utils.intl('更新成功'))
      props.action('getList', { deviceId: props.deviceId })
    }
  }, [props.putRecordSuccess])


  useEffect(() => {
    if (props.postCollectDevicesSuccess) {
      message.success(utils.intl('更新成功'))
      setAcquisitionModal(false)
      props.action('getCollectDevicesByDevices', { id: props.deviceId })
    }
  }, [props.postCollectDevicesSuccess])

  const recordDelete = (id) => {
    props.action('deleteRecord', { deviceId: id })
  }

  const deviceType = props.detail?.deviceType?.name
  let detail = handleModelDetail(props.deviceModels, props.detail)
  let unit = '';
  let beforeTitle = '';
  let afterTitle = '';

  if (deviceCategories === 'ConverterInverter') {
    unit = "kW"
    beforeTitle = utils.intl('更换前额定功率')
    afterTitle = utils.intl('更换前额定功率')
  } else if (deviceCategories === 'Transformer') {
    unit = "kVA"
    beforeTitle = utils.intl('更换前容量')
    afterTitle = utils.intl('更换后容量')
  } else if (deviceCategories === 'LithiumIonBattery' || deviceCategories === 'LeadCarbonBattery') {
    unit = "Ah"
    beforeTitle = utils.intl('更换前容量')
    afterTitle = utils.intl('更换后容量')
  }
  const columns: any = [
    {
      title: utils.intl('序号'), dataIndex: 'num', width: 80
    },
    {
      title: utils.intl('运维时间'), dataIndex: 'dtime', key: 'sbxz',
    },
    {
      title: utils.intl('运维内容'), dataIndex: 'typeTitle', width: 120
    },
    {
      title: beforeTitle, dataIndex: 'beforeValue', width: beforeTitle === '' ? 0 : (isZh() ? 180 : 250),
      render: (text, record, index) => {
        return (
          <span>
            {text ? text + unit : ''}
          </span>
        )
      }
    },
    {
      title: afterTitle, dataIndex: 'afterValue', width: afterTitle === '' ? 0 : (isZh() ? 180 : 250),
      render: (text, record, index) => {
        return (
          <span>
            {text ? text + unit : ''}
          </span>
        )
      }
    },
    {
      title: utils.intl('备注'), dataIndex: 'remarks',
    },
    {
      title: utils.intl('操作'), width: 220,
      render: (text, record, index) => {
        return (
          <span>
            <a onClick={() => { setRecordModal(true); setRecordDetail(record) }}>{utils.intl('编辑')}</a>
            <ListItemDelete onConfirm={recordDelete.bind(this, record.id)}>
              <a style={{ marginLeft: '10px' }}>{utils.intl('删除')}</a>
            </ListItemDelete>
          </span>
        )
      }
    },
  ]

  const getStackUnitByStack = (stackId:number, treeList: any[] = []) => {
    let obj = null;
    for(let i = 0; i<treeList.length; i++){
      const item = treeList[i];
      if(item.children && item.children.find(ci => ci.id === stackId && ci.type === 'Stack')){
        console.log(111)
        obj = item;
        break;
      }else {
        obj = getStackUnitByStack(stackId, item.children)
        if(obj) break;
      }
    }
    return obj
  } 


  // console.log('getStackUnitByStack(props.detail?.id, props.treeList)', getStackUnitByStack(props.detail?.id, props.treeList))

  return (
    <FullContainer>
      {/* <CrumbsPortal pageName='stationUpdate'>
        <Button
          type="primary"
          onClick={props.toEdit}
          style={{ marginLeft: '16px' }}
        >
          {utils.intl("编辑")}
        </Button>
      </CrumbsPortal> */}
      <div className="flex1" style={{ overflowY: 'auto' }}>
        {recordModal ?
          <RecordModal
            cancel={() => { setRecordModal(false); setRecordDetail({}) }}
            visible={recordModal}
            recordDetail={recordDetail}
            detail={props.detail}
            dispatch={props.dispatch}
            action={props.action}
            time={props.time}
          /> : ''}
        {acquisitionModal ?
          <AcquisitionModal
            cancel={() => { setAcquisitionModal(false) }}
            visible={acquisitionModal}
            bindCollectDevices={extractByKey(props.bindCollectDevices || [], 'id', 'Array')}
            detail={props.detail}
            action={props.action}
            dispatch={props.dispatch}
            allCollectDevices={props.allCollectDevices}
            acquisitionLoading={props.acquisitionLoading}
            stationId={props.stationId}
            theme={props.theme}
          /> : ''}
        <BorderHeader title={utils.intl('基本信息')} btnsStyle={{ marginLeft: 8 }}>
          <Button
            type="primary"
            onClick={props.toEdit}
            style={{ position: 'absolute', right: 16, top: 20, fontSize: 12 }}
            size="small"
          >
            {utils.intl("编辑")}
          </Button>
          {
            props.deviceModels.map(model => {
              const name = model.name
              if (name == 'parentDevice') {
                return (
                  <>
                    <DetailItem2 className="style2" label={utils.intl(props.detail?.type === 'Stack' ? '所属液流单元' : "所属电池单元")}>{
                    props.detail?.type === 'Stack' ? getStackUnitByStack(props.detail?.id, props.treeList)?.title : 
                    props.detail?.batteryUnit?.title}</DetailItem2>
                    {
                      (deviceType == DEVICE_TYPE.batteryPackage || deviceType == DEVICE_TYPE.singleBattery) && (
                        <DetailItem2 className="style2" label={utils.intl("所属电池簇")}>{props.detail?.batteryCluster?.title}</DetailItem2>
                      )
                    }
                    {
                      (props.detail?.pack) && (
                        <DetailItem2 className="style2" label={utils.intl("所属电池包")}>{props.detail?.pack?.title}</DetailItem2>
                      )
                    }
                  </>
                )
              }
              return (
                <TypeManagerLook
                  key={model.id}
                  model={model}
                  detail={detail}
                />
              )
            })
          }
        </BorderHeader>
        <BorderHeader title={utils.intl('台账运维记录')} btnsStyle={{ paddingRight: 11 }} style={{ marginTop: '16px' }}>
          <Button
            style={{ color: '#356edf', borderColor: '#3D7EFF', position: 'absolute', right: 16, top: 20, fontSize: 12 }}
            size="small"
            onClick={() => setRecordModal(true)}
          >
            {utils.intl("新增")}
          </Button>
          <div className="flex1 f-pr">
            {/* {deviceCategories === '' &&
              <FullLoading/>
            } */}
            {(
              <Table
                scroll={{ x: isZh() ? undefined : 1300 }}
                dataSource={props.list}
                columns={columns}
                loading={props.listLoading}
                rowKey="id"
                pagination={false}
              />
            )}
          </div>
        </BorderHeader>
        {/* <BorderHeader title={utils.intl('采集设备')} style={{ marginTop: '16px' }}>
          <Button
            style={{ color: '#356edf', borderColor: '#3D7EFF', position: 'absolute', right: 16, top: 20, fontSize: 12 }}
            size="small"
            onClick={() => setAcquisitionModal(true)}
          >
            {utils.intl("编辑")}
          </Button>
          <div style={{ marginLeft: 8 }}>{extractByKey(props.bindCollectDevices || [], 'name')}</div>
        </BorderHeader>
        <BorderHeader title={utils.intl('采集信号')} style={{ marginTop: '16px' }}>
          <div style={{ marginLeft: 8 }}>{utils.intl('共')}
            <span style={{ fontSize: 24, color: '#3D7EFF', padding: '0 4px' }}>
              {props.dataPointTotal}
            </span>{utils.intl('个')}
            <Forward to="dataPoint"
              data={{
                editable: props.editAuthority,
                deviceId: props.deviceId,
                action: props.action,
                forward: props.forward,
                back: props.back,
                detail: props.detail,
                stationId: props.stationId,
                deviceType: props.deviceType
              }}
              title={'数据采集配置'}
            >
              <WankeCircleRightOutlined style={{ marginLeft: 10, color: '#3D7EFF' }} />
            </Forward>
          </div>
        </BorderHeader> */}
      </div>
    </FullContainer >
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    theme: state.global.theme,
    time: state.global.time,
    postCollectDevicesSuccess: isSuccess('postCollectDevices'),
    postRecordSuccess: isSuccess('postRecord'),
    deleteRecordSuccess: isSuccess('deleteRecord'),
    putRecordSuccess: isSuccess('putRecord'),
    listLoading: getLoading('getList'),
    acquisitionLoading: getLoading('getCollectDevicesByStation')
  }
}

export default makeConnect(stationUpdateNS, mapStateToProps)(PropertyListLook)