import React, { useEffect, useRef, useState } from 'react'
import { message, Tabs, FullLoading, DeleteConfirmPopover, Form, Button, Tree, AutoSizer } from 'wanke-gui'
import { enumsNS, Mode, OBJECT_TYPE, stationUpdateNS, Tree_Type } from '../../constants'
import { ValueName } from '../../../interfaces/CommonInterface'
import { getAction, makeConnect } from '../../umi.helper'
import Page from '../../../components/Page'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import FullContainer from '../../../components/layout/FullContainer'
import { StationUpdateModel } from '../models/station-update'
import TabBasic from './TabBasic'
import utils from '../../../public/js/utils'
import { EnergyUnitState } from '../models/station-update'
import './styles/update.less'
import { findTreeItem, findTreeParents, traverseTree } from '../../page.helper'
import AddObjectDialog from '../energy-unit/AddObjectDialog'
import Header from '../../../components/Header'
import Footer from '../../../components/Footer'
import LeftTree, { LeftTreeRef } from './LeftTree'
import { __temporaryStationModelLogic, identity } from '../station.helper'
import TabBasicLook from './TabBasicLook'
import PropertyListLook from '../energy-unit/PropertyListLook'
import PropertyList from '../energy-unit/PropertyList'
import PropertyEnergyUnit from '../energy-unit/PropertyEnergyUnit'
import PropertyEnergyUnitLook from '../energy-unit/PropertyEnergyUnitLook'
import BatchMaintenance from '../energy-unit/BatchMaintenance'
import { PlusOutlined } from 'wanke-icon'
import ResizeDiv from '../../../components/resizer/ResizeDiv'

//主页面，根据树节点选择的节点不同，右侧会展示不同页面，选电站时展示TabBasicLook和TabBasic组件一个为查看页面一个为编辑页面，选能量单元时右侧展示PropertyEnergyUnitLook和
//PropertyEnergyUnit 选设备时右侧展示PropertyListLook和PropertyList，选中虚拟节点时展示BatchMaintenance组件
interface Props extends PageProps, MakeConnectProps<StationUpdateModel>, StationUpdateModel {
  stationId: number
  stationType: number
  editable: boolean
  // end 外部属性
  stationTypes: ValueName[]
  priceRates: ValueName[]
  addStationLoading: boolean
  updateStationLoading: boolean
  savePriceLoading: boolean
  bindStationUserLoading: boolean
  fetchStationEnergyListLoading: boolean
  fetchStationModelSuccess: boolean
  fetchStationBasicInfoSuccess: boolean
  fetchStationBasicInfoLoading: boolean
  fetchStationManageInfoLoading: boolean
  addStationSuccess: boolean
  updateStationSuccess: boolean
  deleteStationSuccess: boolean
  bindPriceSuccess: boolean
  bindUserSuccess: boolean
  fetchStationManageInfoSuccess: boolean
  fetchStationPriceInfoSuccess: boolean
  price: any;
  generation: any;
  fetchUsePriceListLoading: boolean
  fetchPriceGenerateListLoading: boolean
  fetchCostListLoading: boolean
  fetchGenerateListLoading: boolean
  fetchSpotListLoading: boolean
  costSpotPriceList: any[];
  generateSpotPriceList: any[];
  fetchPriceListSuccess: boolean
  fetchPriceListLoading: boolean
  spotCurve: any;


  treeList: any
  detail: any
  newEnergyUnitTypeId: number
  treeLoading: boolean
  updateLoading: boolean
  fetchDeviceNameSuccess: boolean
  energyUnitDetailSuccess: boolean
  fetchDeviceDetailSuccess: boolean
  fetchTreeSuccess: boolean
  updateDeviceSuccess: boolean
  deleteDeviceSuccess: boolean
  batchUpdateDeviceSuccess: boolean
  addDeviceSuccess: boolean
  addEnergyUnitSuccess: boolean
  updateEnergyUnitSuccess: boolean
  deleteEnergyUnitSuccess: boolean

  stationStatusOptions: any
  energyUnitStatusOptions: any
  getDeviceDebugLoading: boolean
  postCollectDevicesSuccess: boolean
  stationRecord: any
  postStationId: any
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
  first, addEnergyUnit, updateEnergyUnit, deleteEnergyUnit, addDevice, updateDevice, deleteDevice, addStation, queryStation, updateStation
}

export const UpdatePage: React.FC<Props> = function (this: null, props) {
  //迁移
  const [energyUnitType, setEnergyUnitType] = useState(props.newEnergyUnitTypeId)
  const [selectedKeys, setSelectedKeys] = useState([])
  const [treeType, setTreeType] = useState(null)
  const [checkedKeys, setCheckedKeys] = useState([])
  const [title, setTitle] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [treeList, setTreeList] = useState(props.treeList)
  const fetchTreeType = useRef<FetchTreeType>(FetchTreeType.first)
  const addInfo = useRef<AddInfoType>()

  const [stationId, setStationId] = useState(props.stationId)
  const [mode, setMode] = useState(props.stationId ? Mode.look : Mode.add)
  const [stationType, setStationType] = useState(props.stationType)
  const [activeKey, setActiveKey] = useState('1')
  const [pTitle, setPTitle] = useState(null)

  const isFirst = useRef<boolean>(true)
  //设备信息迁移
  const timeZone = props.timeZone
  let isDevice = treeType && treeType != Tree_Type.energyUnit && treeType != Tree_Type.virtualNode && treeType != Tree_Type.station
  let isEnergyUnitType = treeType && treeType === Tree_Type.energyUnit
  let isStationType = treeType && treeType === Tree_Type.station
  let isVirtualNodeType = treeType && treeType === Tree_Type.virtualNode
  let isGridConnectedUnitNodeType = treeType && treeType === Tree_Type.gridConnectedUnit

  const treeRef = useRef<LeftTreeRef>()
  const lastAddDeviceInfoRef = useRef<any>({})

  //地图选点
  const toMapSelect = (longitude, latitude, onSuccess: ({ lat, lng }) => void) => {
    props.forward('selectMap', {
      latitude,
      longitude,
      onSelect: onSuccess
    })
  }

  const onNeedUpdate = (type, data) => {
    if (type == 'energyUnit') {
      props.action('fetchStationEnergyList', { stationId: data.stationId || props.stationId || stationId })
      // props.action('checkShowDataPoint', { stationId, activity: true })
    }
    if (type === 'updateDataPoint') {
      props.action('fetchList', { stationId: stationId, deviceId: getSelectItem(treeList, selectedKeys[0])?.id })
    }
    props.parentPageNeedUpdate()
  }

  const onTabChange = (v) => {
    setActiveKey(v)
  }

  //删除电站
  const onDelete = () => {
    props.action('deleteStation', { stationId })
  }

  useEffect(() => {
    setTreeType(Tree_Type.station)
    props.action('fetchOperatorList')
    if (mode == Mode.add) {
      // setStationType(props.basicInfo.stationType?.id)
    } else {
      fetchTreeType.current = FetchTreeType.queryStation
      //获取树
      //获取国家
      props.action('fetchProvinceOptions')
      // //获取电站类型枚举
      // props.dispatch(getAction(enumsNS, 'fetchStationTypes'))
    }
    //获取电站状态
    props.action('getStationStatusOperationMap')
    //获取储能单元状态
    props.action('getEnergyUnitStatusOperationMap')
    //获取应用场景枚举
    props.action('getScenariosList')
    // props.action('fetchStationUseTypeList')
    return () => {
      props.action('reset')
    }
  }, [])

  //获取电站基本信息
  // useEffect(() => {
  //   if (props.postStationId) {
  //     props.updateState({ stationId: props.postStationId })
  //   }
  // }, [props.postStationId]);

  //添加电站成功
  useEffect(() => {
    if (props.addStationSuccess) {
      message.success(utils.intl('添加电站成功'))
      fetchTreeType.current = FetchTreeType.addStation
      setStationId(props.newStationId)
      setMode(Mode.look)
      props.action('fetchStationBasicInfoDetail', { stationId: props.newStationId })
      props.action('fetchEnergyUnitTree', { stationId: props.newStationId })
    }
  }, [props.addStationSuccess])

  //更新成功
  useEffect(() => {
    if (props.updateStationSuccess) {
      fetchTreeType.current = FetchTreeType.updateStation
      message.success(utils.intl('更新成功'))
      props.action('fetchStationBasicInfoDetail', { stationId })
      props.action('fetchEnergyUnitTree', { stationId })
      setMode(Mode.look)
    }
  }, [props.updateStationSuccess])

  //删除电站成功
  useEffect(() => {
    if (props.deleteStationSuccess) {
      props.parentPageNeedUpdate('deleteStationSuccess')
      message.success(utils.intl('删除电站成功'))
      setTimeout(() => {
        props.back()
      })
    }
  }, [props.deleteStationSuccess])

  //获取电站基本信息
  useEffect(() => {
    if (props.stationId) {
      setMode(Mode.look)
      props.action('fetchStationBasicInfoDetail', { stationId })
      props.action('fetchEnergyUnitTree', { stationId })
    } else {
      setMode(Mode.add)
    }
  }, [props.stationId]);

  //获取电站基本信息后设置电站类型
  useEffect(() => {
    if (props.fetchStationBasicInfoSuccess && isFirst.current) {
      isFirst.current = false
      const stationType = props.detail.stationType?.id
      handleTitle(Mode.look, props.detail.title || props.detail.title)
      setStationType(stationType)
      props.action('fetchEnergyUnitType', { stationTypeId: stationType })
    }
  }, [props.fetchStationBasicInfoSuccess])

  //获取电站基本信息
  useEffect(() => {
    if (props.detail) {
      handleTitle(Mode.look, props.detail.title)
    }
  }, [props.detail]);

  //迁移

  //刷新树节点
  useEffect(() => {
    if (props.treeList.length) {
      setTreeList(props.treeList)
    } else {
      setTreeList([{ title: "电站名称" }])
    }
  }, [props.treeList])


  //迁移设备信息hook
  useEffect(() => {
    if (props.energyUnitDetailSuccess) {
      setEnergyUnitType(props.detail?.energyUnitTypeId)
    }
  }, [props.energyUnitDetailSuccess, props.fetchDeviceDetailSuccess])

  useEffect(() => {
    if (props.addEnergyUnitSuccess) {
      message.success(utils.intl('添加能量单元成功'))
      fetchTreeType.current = FetchTreeType.addEnergyUnit
      props.action('fetchEnergyUnitTree', { stationId })
      props.action('fetchEnergyUnitDetail', { id: props.newEnergyUnitId })
      setMode(Mode.look)
      setTreeType(Tree_Type.energyUnit)
    }
  }, [props.addEnergyUnitSuccess])

  useEffect(() => {
    if (props.updateEnergyUnitSuccess) {
      message.success(utils.intl('更新成功'))
      setMode(Mode.look)
      fetchTreeType.current = FetchTreeType.updateEnergyUnit
      const deviceId = getSelectItem(treeList, selectedKeys[0]).id
      props.action('fetchEnergyUnitTree', { stationId })
      props.action('fetchEnergyUnitDetail', { id: deviceId })
      props.action('getDeviceDebug', { deviceId: deviceId })
    }
  }, [props.updateEnergyUnitSuccess])

  useEffect(() => {
    if (props.deleteEnergyUnitSuccess) {
      fetchTreeType.current = FetchTreeType.deleteEnergyUnit
      props.action('fetchEnergyUnitTree', { stationId })
      message.success(utils.intl('删除成功'))
    }
  }, [props.deleteEnergyUnitSuccess])

  useEffect(() => {
    if (props.fetchTreeSuccess) {
      if (fetchTreeType.current == FetchTreeType.addStation || fetchTreeType.current == FetchTreeType.queryStation || fetchTreeType.current == FetchTreeType.updateStation) {
        let item = traverseTree(treeList, item => item.id == stationId ? item : null)
        if (item) {
          setSelectedKeys([identity(item)])
        }
      }
      if (!props.newEnergyUnitTypeId && fetchTreeType.current == FetchTreeType.first) {
        fetchTreeType.current = null
        if (isEnergyUnitType && getSelectItem(treeList, selectedKeys[0])?.id) { // 电站详情或编辑，能量单元列表页跳转到对应的能量单元
          let treeType
          setMode(Mode.look)
          let item = traverseTree(treeList, item => item.id == getSelectItem(treeList, selectedKeys[0])?.id ? item : null)
          if (item) {
            setSelectedKeys([identity(item)])
          }
          setTreeType(Tree_Type.energyUnit)
          props.action('fetchEnergyUnitDetail', { id: getSelectItem(treeList, selectedKeys[0])?.id })
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
          setTitle('')
          setTreeType(null)
          setMode(null)
          setSelectedKeys([])
        }
      }
      const selectKeys = (id, list) => {
        let current = traverseTree(list, item => item.id == id ? item : null)
        if (current) {
          setSelectedKeys([identity(current)])
          // 滚动树到对应位置
          treeRef.current.scrollTo(identity(current))
        }
        lastAddDeviceInfoRef.current = {}
        return current
      }
      if (fetchTreeType.current == FetchTreeType.addEnergyUnit) {
        selectKeys(props.newEnergyUnitId, treeList)
      }
      if (fetchTreeType.current == FetchTreeType.addDevice) {
        if (lastAddDeviceInfoRef.current.type === Tree_Type.singleBattery) {
          // 单体电池需要先请求树，再展开到对应位置
          const packId = lastAddDeviceInfoRef.current.packId
          const parentNode = traverseTree(treeList, item => item.id == packId ? item : null)
          if (parentNode) {
            treeRef.current.loadData(parentNode, (list) => {
              selectKeys(props.newDeviceId, list)
            })
          }
        } else {
          selectKeys(props.newDeviceId, treeList)
        }
      }
    }
  }, [props.fetchTreeSuccess])

  // useEffect(() => {
  //   if (props.newStationId) {
  //     let item = traverseTree(treeList, item => item.id == props.newStationId ? item : null)
  //     if (item) {
  //       setSelectedKeys([identity(item)])
  //     }
  //   }
  // }, [props.newStationId, props.fetchTreeSuccess])

  useEffect(() => {
    if (props.updateDeviceSuccess) {
      message.success(utils.intl('更新设备成功'))
      fetchTreeType.current = FetchTreeType.updateDevice
      setMode(Mode.look)
      props.action('fetchEnergyUnitTree', { stationId })
      props.action('fetchDeviceDetail', { deviceId: getSelectItem(treeList, selectedKeys[0]).id })
    }
  }, [props.updateDeviceSuccess])

  useEffect(() => {
    if (props.addDeviceSuccess) {
      message.success(utils.intl('添加设备成功'))
      setShowAddDialog(false)
      fetchTreeType.current = FetchTreeType.addDevice
      props.action('fetchEnergyUnitTree', { stationId })
      props.action('fetchDeviceDetail', { deviceId: props.newDeviceId })
      setMode(Mode.look)
    }
  }, [props.addDeviceSuccess])

  useEffect(() => {
    if (props.batchUpdateDeviceSuccess) {
      setMode(Mode.look)
      fetchTreeType.current = FetchTreeType.updateDevice
      props.action('fetchEnergyUnitTree', { stationId })
      let type = findTreeItem(treeList, item => identity(item) == checkedKeys[0])?.type
      if (type !== Tree_Type.singleBattery) {
        props.action('fetchDeviceDetail', { deviceId: checkedKeys[1] })
      } else {
        props.action('fetchDeviceDetail', { deviceId: checkedKeys[0] })
      }
    }
  }, [props.batchUpdateDeviceSuccess])

  useEffect(() => {
    if (props.deleteDeviceSuccess) {
      message.success(utils.intl('删除设备成功'))
      fetchTreeType.current = FetchTreeType.deleteDevice
      props.action('fetchEnergyUnitTree', { stationId })
    }
  }, [props.deleteDeviceSuccess])

  let pageTitle = ''
  if (mode == Mode.look || mode == Mode.update) {
    pageTitle = pTitle ?? `${props.detail.title}`
  } else if (mode == Mode.add) {
    pageTitle = utils.intl('新增电站')
  }

  //添加树节点
  const handleAdd = () => {
    setShowAddDialog(true)
    props.action('fetchEnergyUnitForDevice', { stationId })
  }

  const isDeleteAvailable = () => {
    const node = getSelectItem(treeList, selectedKeys[0])
    return node && node.deleteAvailable === undefined || !!node?.deleteAvailable
  }
  const getSelectItem = (treeList, key) => {
    return traverseTree(treeList, item => identity(item) == key ? item : null)
  }

  // 删除树节点
  const deleteTreeItem = () => {
    if (treeType == Tree_Type.energyUnit) {
      props.parentPageNeedUpdate('energyUnit', { stationId })
      props.action('deleteEnergyUnit', { id: getSelectItem(treeList, selectedKeys[0])?.id })
    } else if (treeType == Tree_Type.station) {
      onDelete()
    } else {
      props.action('deleteDevice', { deviceId: getSelectItem(treeList, selectedKeys[0])?.id })
    }
  }

  // sn模式直接添加设备
  const onAddFirst = (info: { treeType: any, values: AddInfoType, title: string }) => {
    if (info.values.addType == 2) {
      props.action('addDevice', {
        stationId,
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

    setTitle(newTitle);
  }

  //取消方法：返回到查看状态
  const onCancelEdit = () => {
    if (mode == Mode.add) {
      props.back();
    } else {
      setMode(Mode.look);
    }
    handleTitle(Mode.look, props.detail.title)
  }

  // 能量单元和设备页面的取消返回查看页面
  const cancelUpdate = () => {
    const { back, treeList, detail } = props
    if (treeList.length === 0) {
      back()
    } else {
      setMode(Mode.look)
      props.action('updateTitle', { title: detail.title })
    }
    handleTitle(Mode.look, detail.title)
  }

  //设备单元右侧迁移
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


  const onSubmit = (values) => {
    if (treeType == Tree_Type.energyUnit) {
      props.parentPageNeedUpdate('energyUnit', { stationId })
    }
    if (selectedKeys.length == 0 && checkedKeys.length == 0) {
      //新增
      lastAddDeviceInfoRef.current = { type: treeType }
      const { energyUnitId, deviceTypeId, deviceCount } = addInfo.current
      if (treeType == Tree_Type.energyUnit) {
        props.action('addEnergyUnit', { stationId, ...values })
      } else {
        lastAddDeviceInfoRef.current.packId = values?.pack?.id
        props.action('addDevice', {
          stationId,
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

  const getSelectItems = (treeList, keys) => {
    return keys.map(key => getSelectItem(treeList, key) ?? JSON.parse(sessionStorage.getItem("treeList")).find(item => item.key === key)).filter(item => item.type === Tree_Type.singleBattery)
    // return traverseTree(treeList, item => keys.indexOf(identity(item)) > -1 ? item : null)
  }
  let addTitle = ''
  if (isStationType && mode == Mode.add) {
    addTitle = utils.intl('新增电站')
  } else if (isDevice && mode == Mode.add) {
    addTitle = utils.intl('新增设备')
  } else if (isEnergyUnitType && mode == Mode.add) {
    addTitle = utils.intl('新增能量单元')
  }

  const handleCheck = (keys) => {
    if (!keys.length) {
      setTitle('')
    }
    setCheckedKeys(keys)
  }

  // 董远云要求页面面包屑显示电站
  return (
    <Page pageId={props.pageId} pageTitle={props.stationRecord?.title} className={'station-update-page'} onNeedUpdate={onNeedUpdate}> 
      <div style={{ display: 'flex', height: '100%' }} className={'update-page'}>
        {
          showAddDialog && (
            <AddObjectDialog
              energyUnitTypes={props.energyUnitTypes}
              energyUnitOptions={props.energyUnitOptions}
              parentDeviceList={props.parentDeviceList}
              deviceTypeList={props.deviceTypeList}
              showAddDevice={treeList.filter(item => item.activity !== false).length > 0}
              onAdd={onAddFirst}
              visible={showAddDialog}
              onCancel={() => setShowAddDialog(false)}
              action={props.action}
            />
          )
        }
        <ResizeDiv
          className="station-resize-div"
          defaultWidth={250}
          minWidth={250}
          maxWidth={700}
        >
          <div className="left">
            <div className="flex1 f-oa" style={{ position: 'relative', paddingLeft: 16, paddingTop: 10 }}>
              {
                props.treeLoading && (<FullLoading />)
              }
              <LeftTree
                ref={treeRef}
                setSelectedKeys={setSelectedKeys}
                setMode={setMode}
                setCheckedKeys={handleCheck}
                setTreeType={setTreeType}
                treeList={treeList}
                selectedKeys={selectedKeys}
                checkedKeys={checkedKeys}
                editable={props.editable}
                action={props.action}
                loadSucFuc={(newTreeList) => setTreeList(newTreeList)}
                stationId={stationId}
                handleTitle={handleTitle}
                onSelect={node => setPTitle(node.title)}
              />
            </div>
            <Footer>
              {props.editable && (
                <div>
                  <Button className="txt-btn add" onClick={handleAdd} icon={<PlusOutlined />}>{utils.intl("添加")}
                  </Button>
                  {!isGridConnectedUnitNodeType && selectedKeys.length > 0 && isDeleteAvailable() && (
                    <DeleteConfirmPopover onConfirm={deleteTreeItem} tip={`${utils.intl('确定删除吗')}？`}>
                      <Button className="txt-btn delete" style={{ marginLeft: 8 }}>{utils.intl("删除")}</Button>
                    </DeleteConfirmPopover>
                  )}
                </div>
              )}
            </Footer>
          </div>
        </ResizeDiv>

        <FullContainer className="flex1">
          <div className="flex1 full-container right" style={{ marginLeft: '16px' }}>
            <Header borderBottom title={addTitle || title}>
            </Header>
            <div className="flex1 tab-basic" style={{ padding: '15px', overflowY: 'auto' }}>
              {isStationType && mode == Mode.look &&
                <TabBasicLook
                  detail={props.detail}
                  stationModels={props.stationModels}
                  scenariosList={props.scenariosList}
                  stationType={stationType}
                  action={props.action}
                  toEdit={() => {
                    setMode(Mode.update)
                    handleTitle(Mode.update, props.detail.title)
                  }}
                  stationId={stationId}
                  stationStatusOptions={props.stationStatusOptions}
                  timeZone={timeZone}
                  stationRecord={props.stationRecord}
                />}
              {isStationType && (mode == Mode.add || mode == Mode.update) &&
                <TabBasic
                  mode={mode}
                  onCancelEdit={onCancelEdit}
                  stationModels={props.stationModels}
                  scenariosList={props.scenariosList}
                  stationId={stationId}
                  detail={props.detail}
                  stationType={stationType}
                  stationTypeOption={props.stationTypes}
                  fetchStationTypes={() => props.dispatch(getAction(enumsNS, 'fetchStationTypes'))}
                  provinceOptions={props.provinceOptions}
                  cityOptions={props.cityOptions}
                  districtOptions={props.districtOptions}
                  toMapSelect={toMapSelect}
                  updateStationSuccess={props.updateStationSuccess}
                  back={props.back}
                  saveLoading={props.addStationLoading || props.updateStationLoading}
                  action={props.action}
                  stationStatusOptions={props.stationStatusOptions}
                  parentPageNeedUpdate={props.parentPageNeedUpdate}
                  timeZone={timeZone}
                />
              }
              <div className="flex1">
                {isDevice && mode == Mode.look && (
                  <PropertyListLook
                    deviceId={getSelectItem(treeList, selectedKeys[0])?.id}
                    deviceType={getSelectItem(treeList, selectedKeys[0])?.typeId}
                    editAuthority={props.editable}
                    detail={props.detail}
                    deviceModels={props.deviceModels}
                    action={props.action}
                    toEdit={() => {
                      setMode(Mode.update)
                      handleTitle(Mode.update, props.detail.title)
                    }}

                    dataPointTotal={props.dataPointTotal}
                    stationId={stationId}
                    forward={props.forward}
                    back={props.back}
                    dispatch={props.dispatch}
                    bindCollectDevices={props.bindCollectDevices}
                  />
                )}
                {isDevice && (mode == Mode.add || mode == Mode.update) && (
                  <PropertyList
                    stationId={stationId}
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

                    dataPointTotal={props.dataPointTotal}
                    bindCollectDevices={props.bindCollectDevices}
                    dispatch={props.dispatch}
                  />
                )}
                {
                  isEnergyUnitType && mode == Mode.look && (
                    <PropertyEnergyUnitLook
                      energyUnitId={getSelectItem(treeList, selectedKeys[0])?.id}
                      energyType={energyUnitType}
                      energyModels={props.energyModels}
                      energyUnitTypes={props.energyUnitTypes}
                      detail={props.detail}
                      action={props.action}
                      toEdit={() => {
                        setMode(Mode.update)
                        handleTitle(Mode.update, props.detail.title)
                      }}

                      stationId={stationId}
                      energyUnitStatusOptions={props.energyUnitStatusOptions}
                      energyUnitStatusMap={props.energyUnitStatusMap}
                      onAdd={onSubmit}
                      timeZone={timeZone}
                      getDeviceDebugLoading={props.getDeviceDebugLoading}
                      debugLogs={props.debugLogs}
                      theme={props.theme}
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
                {isEnergyUnitType && mode != Mode.look && (
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

                    stationId={stationId}
                    energyUnitStatusOptions={props.energyUnitStatusOptions}
                    getDeviceDebugLoading={props.getDeviceDebugLoading}
                    debugLogs={props.debugLogs}
                    theme={props.theme}
                  />
                )}
              </div>
              {isVirtualNodeType &&
                <BatchMaintenance
                  list={getSelectItem(treeList, selectedKeys[0])}
                  editAuthority={props.editable}
                  stationId={stationId}
                  forward={props.forward}
                  back={props.back}
                  dispatch={props.dispatch}
                  detail={props.detail}
                  deviceId={getSelectItem(treeList, selectedKeys[0])?.id}
                  action={props.action}
                  postCollectDevicesSuccess={props.postCollectDevicesSuccess}
                />}
            </div>
          </div>
        </FullContainer>
      </div>
    </Page>
  )
}

UpdatePage.defaultProps = {
  editable: true
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    theme: state.global.theme,
    stationTypes: state[enumsNS].stationTypes,
    priceRates: state[enumsNS].priceRates,
    fetchUsePriceListLoading: getLoading('fetchStationPriceInfo'),
    fetchPriceGenerateListLoading: getLoading('fetchStationPriceInfo'),
    fetchCostListLoading: getLoading('fetchUsePriceList'),
    fetchSpotListLoading: getLoading('getSpotList'),
    fetchGenerateListLoading: getLoading('fetchPriceGenerateList'),
    addStationLoading: getLoading('addStation'),
    savePriceLoading: getLoading('savePriceLoading'),
    bindStationUserLoading: getLoading('bindStationUser'),
    fetchStationEnergyListLoading: getLoading('fetchStationEnergyList'),
    fetchStationBasicInfoLoading: getLoading('fetchStationBasicInfoDetail'),
    fetchStationManageInfoLoading: getLoading('fetchStationManageInfo'),
    fetchStationModelSuccess: isSuccess('fetchStationModel'),
    updateStationLoading: getLoading('updateStation'),
    addStationSuccess: isSuccess('addStation'),
    deleteStationSuccess: isSuccess('deleteStation'),
    updateStationSuccess: isSuccess('updateStation'),
    bindPriceSuccess: isSuccess('bindStationAndPrice'),
    bindPriceLoading: getLoading('bindStationAndPrice'),
    fetchStationBasicInfoSuccess: isSuccess('fetchStationBasicInfoDetail'),
    bindUserSuccess: isSuccess('bindStationUser'),
    fetchStationPriceInfoSuccess: isSuccess('fetchStationPriceInfo'),
    fetchStationManageInfoSuccess: isSuccess('fetchStationManageInfo'),
    fetchPriceListSuccess: isSuccess('fetchAllPriceList'),
    fetchPriceListLoading: getLoading('fetchAllPriceList'),
    //迁移
    treeLoading: getLoading('fetchEnergyUnitTree'),

    //设备单元迁移
    updateLoading: getLoading('addEnergyUnit') | getLoading('addAccessoryDevice') | getLoading('addDevice')
      | getLoading('batchUpdateDevice') | getLoading('updateEnergyUnit') | getLoading('updateDevice'),
    fetchDeviceNameSuccess: isSuccess('fetchDeviceName'),
    energyUnitDetailSuccess: isSuccess('fetchEnergyUnitDetail'),
    fetchDeviceDetailSuccess: isSuccess('fetchDeviceDetail'),
    fetchTreeSuccess: isSuccess('fetchEnergyUnitTree'),
    addDeviceSuccess: isSuccess('addDevice'),
    updateDeviceSuccess: isSuccess('updateDevice'),
    deleteDeviceSuccess: isSuccess('deleteDevice'),
    addEnergyUnitSuccess: isSuccess('addEnergyUnit'),
    updateEnergyUnitSuccess: isSuccess('updateEnergyUnit'),
    deleteEnergyUnitSuccess: isSuccess('deleteEnergyUnit'),
    getDeviceDebugLoading: getLoading('getDeviceDebug'),
    postCollectDevicesSuccess: isSuccess('postCollectDevices'),
  }
}

export default makeConnect(stationUpdateNS, mapStateToProps)(UpdatePage)
