import React, { useEffect, useRef, useState } from 'react'
import { Button, message } from 'wanke-gui'
import AddDataPointDialog from './AddDataPointDialog'
import { DEVICE_TYPE, Mode, stationDataPointNS } from '../../constants'
import UploadCsv from '../../../public/components/Upload/UploadCsv'
import { makeConnect } from '../../umi.helper'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import ListDataPoint from './ListDataPoint'
import { DataPointState } from '../models/station-data-point'
import FullContainer from '../../../components/layout/FullContainer'
import usePageSize from '../../../hooks/usePageSize'
import utils from '../../../public/js/utils'
import { importColumns } from '../station.helper'
import ListDataPointDraft from './ListDataPointDraft'
import { isZh } from '../../../core/env'
import Header from '../../../components/Header'
import PageProps from '../../../interfaces/PageProps'
import Page from '../../../components/Page'
import { CrumbsPortal } from '../../../frameset/Crumbs'

//数据采集信息右侧
interface Props extends MakeConnectProps<DataPointState>, DataPointState, PageProps {
  editable: boolean
  stationId: number
  deviceId: number
  type: string
  deviceTypeId: number
  title: string
  editMode: boolean
  setEditMode: (value: boolean) => void
  setShowConfirmCancelEdit: (value: boolean) => void
  forward: (name, data) => void
  // end 外部属性

  listLoading: boolean
  fetchDraftVersionLoading: boolean
  draftListLoading: boolean
  addDataPointSuccess: boolean
  fetchTypeListSuccess: boolean
  updateDataPointSuccess: boolean
  deleteDataPointSuccess: boolean
  deployVersionSuccess: boolean
  fetchSignalNameSuccess: boolean
  back: any
}

const DataPoint: React.FC<Props> = function (this: null, props) {
  const [mode, setMode] = useState(null) // 新增、编辑
  const [pageSize, setPageSize] = usePageSize({})
  const [draftPageSize, setDraftPageSize] = usePageSize({})
  const [modalVisible, setModalVisible] = useState(false)

  const currentItem = useRef<any>()

  const toEditDraft = () => {
    setDraftPageSize(1, draftPageSize.size)
    props.setEditMode(true)
    props.action('fetchDraftVersion', {
      stationId: props.stationId,
      deviceId: props.deviceId,
      page: 1,
      size: 20
    })
  }

  const handleUpdate = record => {
    setModalVisible(true)
    setMode(Mode.update)
    currentItem.current = record
  }

  const handleDelete = id => {
    props.action('deleteDataPoint', { id, deviceId: props.deviceId })
    props.parentPageNeedUpdate('updateDataPoint')
  }

  const beforeAdd = () => {
    setMode(Mode.add)
    currentItem.current = null
    fetchTypeList()
  }

  const deployVersion = () => {
    props.action('deployVersion', {
      deviceId: props.deviceId,
      versionId: props.versionId
    })
  }

  const onUpdate = (record) => {
    currentItem.current = record
    setModalVisible(true)
    setMode(Mode.update)
    fetchTypeList()
  }

  const onSubmit = values => {
    if (mode == Mode.add) {
      props.action('addDataPoint', {
        versionId: props.versionId,
        deviceId: props.deviceId,
        pointNumber: values.pointID,
        terminalId: values.terminalId,
        title: values.title,
        typeId: values.typeId,
        signalTitle: values.signalTitle
      })
    } else {
      props.action('updateDataPoint', {
        versionId: props.versionId,
        id: currentItem.current.id,
        deviceId: props.deviceId,
        pointNumber: values.pointID,
        terminalId: values.terminalId,
        title: values.title,
        typeId: values.typeId,
        signalTitle: values.signalTitle
      })
    }
  }

  const fetchList = () => {
    props.action('fetchList', { stationId: props.stationId, deviceId: props.deviceId, page: pageSize.page, size: pageSize.size })
  }

  const fetchDraftList = () => {
    props.action('fetchDraftList', {
      stationId: props.stationId,
      deviceId: props.deviceId,
      versionId: props.versionId,
      page: draftPageSize.page,
      size: draftPageSize.size
    })
  }

  const fetchTypeList = () => {
    props.action('fetchTypeList', { deviceId: props.deviceId, deviceTypeId: props.deviceTypeId, record: currentItem.current })
  }

  useEffect(() => {
    props.action('fetchInputOutputTypes', { resource: 'terminalTypes', deviceTypeId: props.deviceTypeId })
  }, [props.deviceTypeId])

  useEffect(() => {
    if (pageSize.page) {
      fetchList()
    }
  }, [pageSize])

  useEffect(() => {
    if (draftPageSize.page && props.versionId) {
      fetchDraftList()
    }
  }, [draftPageSize])

  useEffect(() => {
    if (type === DEVICE_TYPE.pcs || type === DEVICE_TYPE.transformer) {
      props.action('fetchTerminalTypes', { deviceTypeId: props.deviceTypeId })
    }
    props.setEditMode(false)
    setPageSize(1, pageSize.size)
  }, [props.deviceId])

  useEffect(() => {
    if (props.addDataPointSuccess) {
      setModalVisible(false)
      fetchDraftList()
    }
    if (props.updateDataPointSuccess) {
      setModalVisible(false)
      fetchDraftList()
    }
  }, [props.addDataPointSuccess, props.updateDataPointSuccess])

  useEffect(() => {
    if (props.deleteDataPointSuccess) {
      fetchDraftList()
    }
  }, [props.deleteDataPointSuccess])

  useEffect(() => {
    if (props.deployVersionSuccess) {
      props.setEditMode(false)
      setPageSize(1, pageSize.size)
      message.success(utils.intl("发布成功"))
    }
  }, [props.deployVersionSuccess])

  useEffect(() => {
    if (props.fetchTypeListSuccess && mode == Mode.add) {
      if (props.list.length == 0 && props.typeList.length == 0) {
        utils.error(utils.intl('该设备暂未维护采集参数，请在“业务模型配置→设备模型”中维护'))
      } else if (props.typeList.length === 0) {
        utils.error(utils.intl(utils.intl("设备参数已维护完毕，暂不需要新增参数")))
      } else {
        setModalVisible(true)
        setMode(Mode.add)
      }
    }
  }, [props.fetchTypeListSuccess])

  let { type, terminalTypes, title, total } = props
  console.log(props)
  return (
    <Page style={{ margin: 0, padding: '0 16px 16px 16px' }}>
      <FullContainer style={{ overflow: 'visible' }}>
        {
          modalVisible && (
            <AddDataPointDialog
              mode={mode}
              type={type}
              terminalTypes={terminalTypes}
              detail={currentItem.current}
              typeList={props.typeList}
              inputOutputOptions={props.inputOutputOptions}
              fetchSignalName={signalName => props.action('fetchSignalName', { stationId: props.stationId, pointId: signalName })}
              fetchSignalNameSuccess={props.fetchSignalNameSuccess}
              newSignalName={props.newSignalName}
              visible={modalVisible}
              onConfirm={onSubmit}
              onCancel={() => setModalVisible(false)}
            />
          )
        }
        <CrumbsPortal pageName="dataPoint">
          {props.editMode ? (
            <>
              <Button type="default" style={{ marginLeft: 16 }} onClick={() => props.setShowConfirmCancelEdit(true)}>
                {utils.intl("取消")}
              </Button>
              <Button type="primary" style={{ marginLeft: 16 }} onClick={deployVersion}>
                {utils.intl("发布")}
              </Button>
              <UploadCsv
                url="/basic-data-management/equipment-ledger/analogs-temp/batch"
                title={utils.intl("数据采集配置导入")}
                columns={importColumns}
                callback={fetchDraftList}
                beforeUpload={data => {
                  let arr = []
                  for (let i = 0; i < data.length; i++) {
                    arr.push({
                      signalTitle: data[i][utils.intl("信号名称")],
                      pointNumber: data[i]['PointID'],
                      terminalTitle: data[i][utils.intl('输入/输出端名称')],
                      typeTitle: data[i][utils.intl("数据项业务名称")],
                    })
                  }
                  let result = {
                    deviceTypeId: props.deviceTypeId,
                    versionId: props.versionId,
                    deviceId: props.deviceId,
                    analogs: arr
                  }
                  return {
                    errorCode: 0,
                    results: result
                  }
                }}
              >
                <div>
                  {utils.intl("模板于 2020-05-25 12:00 更新，请")}
                  <a href={isZh() ? require('./template.xlsx') : require('./template-en.xlsx')} download={utils.intl("模板xlsx")}>
                    {utils.intl("下载最新Excel模版")}
                  </a>
                </div>
              </UploadCsv>
              <Button type="primary" onClick={beforeAdd} style={{ marginLeft: 16 }}>
                {utils.intl("新增")}
              </Button>
            </>
          ): (
            <>
              <Button type="default" style={{ marginLeft: 16 }} onClick={() => props.back()}>
                {utils.intl("返回")}
              </Button>
              <Button style={{ marginLeft: 16 }} onClick={() => props.action('onExport', { stationId: props.stationId, deviceId: props.deviceId })}>{utils.intl("导出")}</Button>
              {props.editable ? (
                <Button style={{ marginLeft: 16 }} type="primary" onClick={toEditDraft}>{utils.intl("编辑")}</Button>
              ): ''}
            </>
          )}
        </CrumbsPortal>
        <Header borderBottom title={`${title} ${utils.intl(`数据采集配置`)}`} style={{ margin: '0 -16px', padding: '16px 0 16px 0' }}>
        </Header>
        <div className="flex1 f-pr" style={{ paddingTop: 16 }}>
          {
            !props.editMode && (
              <ListDataPoint
                loading={props.listLoading}
                dataSource={props.list}
                total={total}
                page={pageSize.page} size={pageSize.size}
                onPageChange={setPageSize}
                lookHistory={(typeId, typeTitle, terminalTitle) => props.forward('dataPointHistory', { deviceId: props.deviceId, typeId, typeTitle, terminalTitle, title })}
              />
            )
          }
          {
            props.editMode && (
              <ListDataPointDraft
                loading={props.fetchDraftVersionLoading || props.draftListLoading}
                dataSource={props.draftList}
                total={props.draftTotal}
                page={draftPageSize.page} size={draftPageSize.size}
                onPageChange={setDraftPageSize}
                onUpdate={onUpdate}
                onDelete={handleDelete}
              />
            )
          }
        </div>
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    listLoading: getLoading('fetchList'),
    draftListLoading: getLoading('fetchDraftList'),
    fetchDraftVersionLoading: getLoading('fetchDraftVersion'),
    fetchTypeListSuccess: isSuccess('fetchTypeList'),
    addDataPointSuccess: isSuccess('addDataPoint'),
    deleteDataPointSuccess: isSuccess('deleteDataPoint'),
    updateDataPointSuccess: isSuccess('updateDataPoint'),
    deployVersionSuccess: isSuccess('deployVersion'),
    fetchSignalNameSuccess: isSuccess('fetchSignalName')
  }
}

export default makeConnect(stationDataPointNS, mapStateToProps)(DataPoint)
