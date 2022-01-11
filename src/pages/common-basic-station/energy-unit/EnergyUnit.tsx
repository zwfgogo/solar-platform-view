import React, { FC, useEffect, useRef, useState } from 'react'
import { Button, Empty, message } from 'wanke-gui'
import classnames from 'classnames'
import LeftTree from './LeftTree'
import PropertyList from './PropertyList'
import PropertyEnergyUnit from './PropertyEnergyUnit'
import PropertyListLook from './PropertyListLook'
import Footer from '../../../public/components/Footer'
import DeleteConfirmPopover from '../../../public/components/ListItemDelete'
import AddObjectDialog from './AddObjectDialog'
import Header from '../../../public/components/Header'
import Center from '../../../public/components/Center'
import FullContainer from '../../../components/layout/FullContainer'
import Page from '../../../components/Page'
import { makeConnect } from '../../umi.helper'
import { Mode, OBJECT_TYPE, stationUpdateNS, Tree_Type } from '../../constants'
import { filterTree, findTreeItem, findTreeParents, traverseTree } from '../../page.helper'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { FullLoading } from "wanke-gui"
import { EnergyUnitState } from '../models/station-update'
import { identity } from '../station.helper'
import PropertyEnergyUnitLook from './PropertyEnergyUnitLook'
import utils from '../../../public/js/utils';

// 设备信息 点击能量单元出来的页面
interface Props extends EnergyUnitState, PageProps, MakeConnectProps<EnergyUnitState> {
  stationId: number
  stationTypeId: number
  // 选中能量单元id
  selectEnergyUnitId: number
  //新增能量单元
  newEnergyUnitTypeId: number
  // 是否可编辑
  editable: boolean
  // end 父组件属性
  updateLoading: boolean
  treeLoading: boolean
  fetchTreeSuccess: boolean
  addDeviceSuccess: boolean
  updateDeviceSuccess: boolean
  deleteDeviceSuccess: boolean
  batchUpdateDeviceSuccess: boolean
  addEnergyUnitSuccess: boolean
  updateEnergyUnitSuccess: boolean
  deleteEnergyUnitSuccess: boolean
  energyUnitDetailSuccess: boolean
  deviceParentSuccess: boolean
  fetchDeviceDetailSuccess: boolean
  fetchDeviceNameSuccess: boolean
  basicInfo: any
}

interface AddInfoType {
  objectType?: string
  energyUnitType?: number
  energyUnitId?: number
  addType?: number
  // 手动、sn码
  sn?: string
  deviceTypeId?: number
  deviceCount?: number
}

enum FetchTreeType {
  first, addEnergyUnit, updateEnergyUnit, deleteEnergyUnit, addDevice, updateDevice, deleteDevice
}

const EnergyUnit: FC<Props> = function (this: null, props) {
  const [mode, setMode] = useState(null)
  const [energyUnitType, setEnergyUnitType] = useState(props.newEnergyUnitTypeId)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [treeType, setTreeType] = useState(null)
  const [checkedKeys, setCheckedKeys] = useState([])
  const [title, setTitle] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [treeList, setTreeList] = useState(props.treeList)
  const fetchTreeType = useRef<FetchTreeType>(FetchTreeType.first)
  const addInfo = useRef<AddInfoType>()
  const timeZone = props.basicInfo?.timeZone

  const onAddFirst = (info: { treeType: any, values: AddInfoType, title: string }) => {
    if (info.values.addType == 2) {
      // sn模式直接添加设备
      props.action('addDevice', {
        stationId: props.stationId,
        energyUnitId: info.values.energyUnitId,
        name: info.values.sn
      })
    } else {
      addInfo.current = info.values
      // 新增、编辑状态 => 新增
      setMode(null)
      setTimeout(() => {
        setMode(Mode.add)
      }, 0)
      setShowAddDialog(false)
      setTreeType(info.treeType)
      if (info.values.objectType == OBJECT_TYPE.energyUnit) {
        setEnergyUnitType(info.values.energyUnitType)
      }
      handleTitle(Mode.add, info.title)
      setSelectedKeys([])
      setCheckedKeys([])
      const init = new EnergyUnitState()
      props.updateState({ detail: init.detail, newDeviceInfo: init.newDeviceInfo })
    }
  }

  const toMapSelect = (latitude, longitude, onSuccess: ({ lat, lng }) => void) => {
    props.forward('selectMap', {
      latitude,
      longitude,
      onSelect: onSuccess
    })
  }

  const onSubmit = (values) => {
    if (treeType == Tree_Type.energyUnit) {
      props.parentPageNeedUpdate('energyUnit', { stationId: props.stationId })
    }
    if (selectedKeys.length == 0 && checkedKeys.length == 0) {
      //新增
      const { energyUnitId, deviceTypeId, deviceCount } = addInfo.current
      if (treeType == Tree_Type.energyUnit) {
        props.action('addEnergyUnit', { stationId: props.stationId, ...values })
      } else {
        props.action('addDevice', {
          stationId: props.stationId,
          energyUnitId: energyUnitId,
          deviceCount: deviceCount,
          deviceTypeId: deviceTypeId,
          device: {
            ...values,
            deviceType: { id: deviceTypeId }
          }
        })
      }
    } else if (checkedKeys.length != 0) {
      // 批量修改
      const ids = getSelectItems(treeList, checkedKeys)?.map(item => item.id)
      props.action('batchUpdateDevice', { checkedKeys: ids, device: values })
    } else {
      let selectItem = getSelectItem(treeList, selectedKeys[0])
      // 修改
      if (treeType == Tree_Type.energyUnit) {
        props.action('updateEnergyUnit', { id: selectItem?.id, ...values })
      } else {
        props.action('updateDevice', { id: selectItem?.id, ...values })
      }
    }
  }

  const getSelectItem = (treeList, key) => {
    return traverseTree(treeList, item => identity(item) == key ? item : null)
  }

  const getSelectItems = (treeList, keys) => {
    return keys.map(key => getSelectItem(treeList, key) ?? JSON.parse(sessionStorage.getItem("treeList")).find(item => item.key === key)).filter(item => item.type === Tree_Type.singleBattery)
    // return traverseTree(treeList, item => keys.indexOf(identity(item)) > -1 ? item : null)
  }

  const deleteTreeItem = () => {
    if (treeType == Tree_Type.energyUnit) {
      props.parentPageNeedUpdate('energyUnit', { stationId: props.stationId })
      props.action('deleteEnergyUnit', { id: getSelectItem(treeList, selectedKeys[0])?.id })
    } else {
      props.action('deleteDevice', { deviceId: getSelectItem(treeList, selectedKeys[0])?.id })
    }
  }

  const cancelUpdate = () => {
    const { back, treeList, detail } = props
    if (treeList.length === 0) {
      back()
    } else {
      setMode(Mode.look)
      props.action('updateTitle', { title: detail.title })
    }
  }

  const isDeleteAvailable = () => {
    const node = getSelectItem(treeList, selectedKeys[0])
    return node && node.eleteAvailable === undefined || !!node?.deleteAvailable
  }

  const handleAdd = () => {
    setShowAddDialog(true)
    props.action('fetchEnergyUnitForDevice', { stationId: props.stationId })
  }

  const handleTitle = (mode, title) => {
    let newTitle = ''
    switch (mode) {
      case Mode.look:
        newTitle = utils.intl('{0}详情', title)
        break
      case Mode.update:
        newTitle = utils.intl('编辑{0}', title)
        break
      case Mode.add:
        newTitle = utils.intl('新增{0}', title)
        break
      default:
        break
    }
    setTitle(newTitle)
  }

  const findParentEnergyUnitId = () => {
    let parents = findTreeParents(treeList, item => {
      if (identity(item) == selectedKeys[0]) {
        return true
      }
    })
    for (let parent of parents) {
      if (parent.type == Tree_Type.energyUnit) {
        return parent.id
      }
    }
    return null
  }

  useEffect(() => {
    console.log(1)
    props.action('fetchEnergyUnitTree', { stationId: props.stationId })
    if (props.newEnergyUnitTypeId) {
      setMode(Mode.add)
      setTreeType(Tree_Type.energyUnit)
      handleTitle(Mode.add, utils.intl('能量单元'))
      addInfo.current = {}
    }
    return () => {
      // 清楚detail缓存
      props.updateState({ detail: new EnergyUnitState().detail })
    }
  }, [])

  useEffect(() => {
    console.log(2)
    if (props.fetchTreeSuccess) {
      if (!props.newEnergyUnitTypeId && fetchTreeType.current == FetchTreeType.first) {
        fetchTreeType.current = null
        if (props.selectEnergyUnitId) { // 电站详情或编辑，能量单元列表页跳转到对应的能量单元
          let treeType
          setMode(Mode.look)
          let item = traverseTree(treeList, item => item.id == props.selectEnergyUnitId ? item : null)
          if (item) {
            setSelectedKeys([identity(item)])
          }
          setTreeType(Tree_Type.energyUnit)
          props.action('fetchEnergyUnitDetail', { id: props.selectEnergyUnitId })
        } else {
          let first = treeList[0]
          if (first && first.type == Tree_Type.energyUnit) {
            setMode(Mode.look)
            setSelectedKeys([identity(first)])
            setTreeType(Tree_Type.energyUnit)
            props.action('fetchEnergyUnitDetail', { id: first.id })
          }
        }
        if (treeList.length == 0 && !props.newEnergyUnitTypeId) {
          setMode(Mode.add)
          setSelectedKeys([])
          setTreeType(Tree_Type.energyUnit)
          handleTitle(Mode.add, utils.intl('能量单元'))
          addInfo.current = {}
        }
      }
      if (fetchTreeType.current == FetchTreeType.deleteEnergyUnit) {
        // 1、节点还在(有效性 utils.intl('是') 变成了 utils.intl('否')),2、或者节点被删除
        let current = getSelectItem(treeList, selectedKeys[0])
        if (current) {
          setMode(Mode.look)
          props.action('fetchEnergyUnitDetail', { id: current.id })
        } else {
          setTreeType(null)
          setMode(null)
          setSelectedKeys([])
        }
      }
      if (fetchTreeType.current == FetchTreeType.deleteDevice) {
        let current = getSelectItem(treeList, selectedKeys[0])
        if (current) {
          setMode(Mode.look)
          props.action('fetchDeviceDetail', { deviceId: current.id })
        } else {
          setTreeType(null)
          setMode(null)
          setSelectedKeys([])
        }
      }
      if (fetchTreeType.current == FetchTreeType.addEnergyUnit) {
        let current = traverseTree(treeList, item => item.id == props.newEnergyUnitId ? item : null)
        setSelectedKeys([identity(current)])
      }
      if (fetchTreeType.current == FetchTreeType.addDevice) {
        let current = traverseTree(treeList, item => item.id == props.newDeviceId ? item : null)
        current && setSelectedKeys([identity(current)])
      }
    }
  }, [props.fetchTreeSuccess])

  useEffect(() => {
    console.log(3)
    if (props.addEnergyUnitSuccess) {
      message.success(utils.intl('添加能量单元成功'))
      fetchTreeType.current = FetchTreeType.addEnergyUnit
      props.action('fetchEnergyUnitTree', { stationId: props.stationId })
      props.action('fetchEnergyUnitDetail', { id: props.newEnergyUnitId })
      setMode(Mode.look)
      setTreeType(Tree_Type.energyUnit)
    }
  }, [props.addEnergyUnitSuccess])

  useEffect(() => {
    console.log(4)
    if (props.updateEnergyUnitSuccess) {
      message.success(utils.intl('更新成功'))
      setMode(Mode.look)
      fetchTreeType.current = FetchTreeType.updateEnergyUnit
      props.action('fetchEnergyUnitTree', { stationId: props.stationId })
      props.action('fetchEnergyUnitDetail', { id: getSelectItem(treeList, selectedKeys[0]).id })
    }
  }, [props.updateEnergyUnitSuccess])

  useEffect(() => {
    console.log(5)
    if (props.deleteEnergyUnitSuccess) {
      fetchTreeType.current = FetchTreeType.deleteEnergyUnit
      props.action('fetchEnergyUnitTree', { stationId: props.stationId })
      message.success(utils.intl('删除成功'))
    }
  }, [props.deleteEnergyUnitSuccess])

  useEffect(() => {
    console.log(6)
    if (props.energyUnitDetailSuccess) {
      setEnergyUnitType(props.detail?.energyUnitType.id)
      handleTitle(Mode.look, props.detail.title)
    }
    if (props.fetchDeviceDetailSuccess) {
      handleTitle(Mode.look, props.detail.title)
    }
  }, [props.energyUnitDetailSuccess, props.fetchDeviceDetailSuccess])

  useEffect(() => {
    console.log(7)
    if (props.addDeviceSuccess) {
      message.success(utils.intl('添加设备成功'))
      setShowAddDialog(false)
      fetchTreeType.current = FetchTreeType.addDevice
      props.action('fetchEnergyUnitTree', { stationId: props.stationId })
      props.action('fetchDeviceDetail', { deviceId: props.newDeviceId })
      setMode(Mode.look)
    }
  }, [props.addDeviceSuccess])

  useEffect(() => {
    console.log(8)
    if (props.updateDeviceSuccess) {
      message.success(utils.intl('更新设备成功'))
      fetchTreeType.current = FetchTreeType.updateDevice
      setMode(Mode.look)
      props.action('fetchEnergyUnitTree', { stationId: props.stationId })
    }
  }, [props.updateDeviceSuccess])

  useEffect(() => {
    console.log(9)
    if (props.batchUpdateDeviceSuccess) {
      setMode(Mode.look)
      fetchTreeType.current = FetchTreeType.updateDevice
      props.action('fetchEnergyUnitTree', { stationId: props.stationId })
      let type = findTreeItem(treeList, item => identity(item) == checkedKeys[0])?.type
      if (type !== Tree_Type.singleBattery) {
        props.action('fetchDeviceDetail', { deviceId: checkedKeys[1] })
      } else {
        props.action('fetchDeviceDetail', { deviceId: checkedKeys[0] })
      }
    }
  }, [props.batchUpdateDeviceSuccess])

  useEffect(() => {
    console.log(10)
    if (props.deleteDeviceSuccess) {
      message.success(utils.intl('删除设备成功'))
      fetchTreeType.current = FetchTreeType.deleteDevice
      props.action('fetchEnergyUnitTree', { stationId: props.stationId })
    }
  }, [props.deleteDeviceSuccess])

  useEffect(() => {
    console.log(11)
    setTreeList(props.treeList)
  }, [JSON.stringify(props.treeList)])

  let isDeviceType = treeType && treeType != Tree_Type.energyUnit && treeType != Tree_Type.virtualNode

  const selectItem = getSelectItem(treeList, selectedKeys[0])
  if(selectItem) sessionStorage.setItem("typeId", selectItem.typeId)
  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('能量单元')} className={'energy-unit-page'} style={{ display: 'flex' }}>
      {
        showAddDialog && (
          <AddObjectDialog
            selectedKeys={selectedKeys}
            energyUnitTypes={props.energyUnitTypes}
            energyUnitOptions={props.energyUnitOptions}
            parentDeviceList={props.parentDeviceList}
            deviceTypeList={props.deviceTypeList}
            showAddDevice={treeList.filter(item => item.activity !== false).some(item => item.type == Tree_Type.energyUnit)}
            onAdd={onAddFirst}
            visible={showAddDialog}
            onCancel={() => setShowAddDialog(false)}
            action={props.action}
          />
        )
      }
      <div className="left">
        <div className="flex1 f-oa" style={{ position: 'relative', paddingTop: 10 }}>
          {
            props.treeLoading && (<FullLoading />)
          }
          <LeftTree
            setSelectedKeys={setSelectedKeys}selectEnergyUnitId
            setMode={setMode}
            setCheckedKeys={setCheckedKeys}
            setTreeType={setTreeType}
            treeList={props.treeList}
            selectedKeys={selectedKeys}
            checkedKeys={checkedKeys}
            editable={props.editable}
            action={props.action}
            loadSucFuc={(newTreeList) => setTreeList(newTreeList)}
          />
        </div>
        <Footer>
          <div>
            <button className="txt-btn add" onClick={() => {
              props.dispatch({
                type: 'stationUpdate/fetchStationEnergyList',
                payload: { stationId: props.stationId }
              });
              props.back()
            }}>{utils.intl("返回")}</button>
          </div>
          {props.editable && (
            <div>
              <button className="txt-btn add" onClick={handleAdd}>{utils.intl("添加")}
              </button>
              {selectedKeys.length > 0 && isDeleteAvailable() && (
                <DeleteConfirmPopover onConfirm={deleteTreeItem} tip={`${utils.intl('确定删除吗')}？`}>
                  <button className="txt-btn delete">{utils.intl("删除")}</button>
                </DeleteConfirmPopover>
              )}
            </div>
          )}
        </Footer>
      </div>
      <div className="right">
        {mode != null && (
          <FullContainer className="flex1">
            <Header title={title}>
              <Button
                type="primary"
                className={classnames({ 'f-vh': !(props.editable && mode === Mode.look) })}
                onClick={() => {
                  setMode(Mode.update)
                  handleTitle(Mode.update, props.detail.title)
                }}
              >
                {utils.intl("编辑")}
              </Button>
            </Header>

            <div className="flex1">
              {isDeviceType && mode == Mode.look && (
                <PropertyListLook
                  deviceId={getSelectItem(treeList, selectedKeys[0])?.id}
                  deviceType={getSelectItem(treeList, selectedKeys[0])?.typeId}
                  editAuthority={props.editable}
                  detail={props.detail}
                  deviceModels={props.deviceModels}
                  treeList={treeList}
                  selectedKeys={selectedKeys}
                  action={props.action}
                />
              )}
              {isDeviceType && (mode == Mode.add || mode == Mode.update) && (
                <PropertyList
                  stationId={props.stationId}
                  energyUnitId={mode == Mode.add ? addInfo.current.energyUnitId : findParentEnergyUnitId()}
                  deviceId={mode == Mode.add ? null : getSelectItem(treeList, selectedKeys[0])?.id}
                  mode={mode}
                  deviceTypeId={mode == Mode.add ? addInfo.current.deviceTypeId : Number(sessionStorage.getItem("typeId"))}
                  deviceTypeList={props.deviceTypeList}
                  deviceModels={props.deviceModels}
                  parent1Options={props.parent1Options}
                  parent2Options={props.parent2Options}
                  parent3Options={props.parent3Options}
                  detail={props.detail}
                  title={title}
                  provinceOptions={props.provinceOptions}
                  cityOptions={props.cityOptions}
                  districtOptions={props.districtOptions}
                  toMapSelect={toMapSelect}
                  cancelUpdate={cancelUpdate}
                  onAdd={onSubmit}
                  loading={props.updateLoading}
                  fetchDeviceNameSuccess={props.fetchDeviceNameSuccess}
                  newDeviceInfo={props.newDeviceInfo}
                  action={props.action}
                />
              )}
              {
                treeType == Tree_Type.energyUnit && mode == Mode.look && (
                  <PropertyEnergyUnitLook
                    energyUnitId={getSelectItem(treeList, selectedKeys[0])?.id}
                    energyType={energyUnitType}
                    energyModels={props.energyModels}
                    energyUnitTypes={props.energyUnitTypes}
                    detail={props.detail}
                    action={props.action}
                    text_Generate={props.text_Generate}
                    text_Cost={props.text_Cost}
                    price_Cost={props.price_Cost}
                    price_Generate={props.price_Generate}
                    multipleTypeMap={props.multipleTypeMap}
                    realTimePriceMap_Cost={props.realTimePriceMap_Cost}
                    realTimePriceMap_Generate={props.realTimePriceMap_Generate}
                  />
                )
              }
              {treeType == Tree_Type.energyUnit && mode != Mode.look && (
                <PropertyEnergyUnit
                  mode={mode}
                  timeZone={timeZone}
                  energyUnitId={mode == Mode.add ? null : getSelectItem(treeList, selectedKeys[0])?.id}
                  energyModels={props.energyModels}
                  energyType={energyUnitType}
                  energyUnitTypes={props.energyUnitTypes}
                  detail={props.detail}
                  provinceOptions={props.provinceOptions}
                  cityOptions={props.cityOptions}
                  districtOptions={props.districtOptions}
                  toMapSelect={toMapSelect}
                  cancelUpdate={cancelUpdate}
                  onAdd={onSubmit}
                  loading={props.updateLoading}
                  action={props.action}
                />
              )}
            </div>
          </FullContainer>
        )}
        {
          mode == null && !title && treeList.length !== 0 && (
            <Center>
              <div className="f-tac" style={{ marginTop: '-20px' }}>
                <i className="iconfont fontLighter" style={{ fontSize: '90px' }}>
                  &#xe663;
                </i>
                <p style={{ marginTop: '-20px' }} className="fontLighter">
                  {utils.intl("请选择左侧树节点")}
                </p>
              </div>
            </Center>
          )
        }
        {
          mode == null && !title && !props.treeLoading && treeList.length === 0 && (
            <div className="vh-center h100">
              <Empty description={utils.intl('暂无数据')} />
            </div>
          )
        }
      </div>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    updateLoading: getLoading('addEnergyUnit') | getLoading('addAccessoryDevice') | getLoading('addDevice')
      | getLoading('batchUpdateDevice') | getLoading('updateEnergyUnit') | getLoading('updateDevice'),
    treeLoading: getLoading('fetchEnergyUnitTree'),
    energyUnitDetailSuccess: isSuccess('fetchEnergyUnitDetail'),
    fetchTreeSuccess: isSuccess('fetchEnergyUnitTree'),
    addDeviceSuccess: isSuccess('addDevice'),
    updateDeviceSuccess: isSuccess('updateDevice'),
    deleteDeviceSuccess: isSuccess('deleteDevice'),
    batchUpdateDeviceSuccess: isSuccess('batchUpdateDevice'),
    addEnergyUnitSuccess: isSuccess('addEnergyUnit'),
    addAccessoryDeviceSuccess: isSuccess('addAccessoryDevice'),
    updateEnergyUnitSuccess: isSuccess('updateEnergyUnit'),
    updateAccessoryDeviceSuccess: isSuccess('updateAccessoryDevice'),
    deleteEnergyUnitSuccess: isSuccess('deleteEnergyUnit'),
    fetchDeviceDetailSuccess: isSuccess('fetchDeviceDetail'),
    fetchDeviceNameSuccess: isSuccess('fetchDeviceName')
  }
}

export default makeConnect(stationUpdateNS, mapStateToProps)(EnergyUnit)
