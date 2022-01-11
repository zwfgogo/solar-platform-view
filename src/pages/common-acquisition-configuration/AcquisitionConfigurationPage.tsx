/**
 * 采集点号配置
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { GlobalState } from 'umi'
import { Button, Empty, FullLoading, message, Modal, Table1, Table2, Tabs, Tree } from 'wanke-gui'
import { InfoCircleFilled, ZdDragOutlined } from 'wanke-icon'
import AutoSizer from '../../components/AutoSizer'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { triggerEvent } from '../../util/utils'
import { globalNS, Tree_Type } from '../constants'
import { makeConnect } from '../umi.helper'
import { modelNamespace, AcquisitionManagement } from './model'
import "./index.less"
import utils from '../../public/js/utils'
import MeasurePointsForm from './components/MeasurePointsForm'
import PointForm from './components/PointForm'
import DataItemForm from './components/DataItemForm'
import ImportExcelDialog from '../../components/ImportExcelDialog'
import createServices from '../../util/createServices'
import _ from 'lodash'
import classNames from 'classnames'

const { TabPane } = Tabs;
const modalTitleMap = {
  1: utils.intl('新增测量点'),
  2: utils.intl('编辑测量点'),
  3: utils.intl('新增点号'),
  4: utils.intl('编辑点号'),
  5: utils.intl('新增数据项'),
  6: utils.intl('编辑数据项'),
}

const importAttrKeyMap = {

  // 汇总表导入明细
  // "数据项名称":"typeTitle",
  "缩写/简写": "name",
  "Abbreviation": "name",
  "初始单位": "unit",
  "Initial Unit": "unit",
  "数据精度": "accuracy",
  "Data Accuracy": "accuracy",
  // "点号":"pointNumber",
  "点号名称": "title",
  "Signal Name": "title",
  "所属设备": "deviceName",
  "Device": "deviceName",
  "所属输入输出端": "terminalTitle",
  "Input/Output": "terminalTitle",
  // 其他数据
  "数据项名称": "typeTitle",
  "Data Item Name": "typeTitle",
  "点号": "pointNumber",
  "Point Number": "pointNumber",
  "描述": "desc",
  "Description": "desc"
};

// 导入必填字段枚举
const importRequiredFieldMap = {
  "1": "typeTitle,pointNumber,accuracy",
  "2": "typeTitle,pointNumber,accuracy,deviceName,terminalTitle",// 汇总明细
  "3": "typeTitle,pointNumber",
}

interface Props extends PageProps, GlobalState, MakeConnectProps<AcquisitionManagement>, AcquisitionManagement {
  otherPointLoading: boolean;
  treeLoading: boolean;
  measurePointLoading: boolean;
  pointListLoading: boolean;
  pointLoading: boolean;
  saveMeasurePointsLoading: boolean;
  saveOtherPointsLoading: boolean;
  saveRemotePulseLoading: boolean;
  savePointsLoading: boolean;
}

let startX: number;
let startWidth: number;
let isMousedown: boolean = false;
let nowPointNumber = null;

const AcquisitionConfigurationPage: React.FC<Props> = (props) => {
  const { pageId, userId, treeData, unitList, accuracyList, otherPointLoading, treeLoading, pointLoading, measurePointLoading, pointListLoading } = props
  const LeftTreeDom = useRef();
  const [leftTreeWidth, setLeftTreeWidth] = useState(250);
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState(1); // 1|2: 新增|编辑 测量点  3|4：新增|编辑 点号  5|6：新增|编辑 数据项
  const [nowRecord, setNowRecord] = useState({})
  const [activeKey, setActiveKey] = useState("1"); // tabs的key
  const [device, setDevice] = useState(null); // tree中选择的设备
  const [importVisible, setImportVisible] = useState(false);
  const [importModalType, setImportModalType] = useState(1); // 1：数据点号导入 2：批量导入明细 3：其他数据导入 
  const [expandedKeys, setExpandedKeys] = useState(props.defaultExpandedKeys);
  const [selectKeys, setSelectKeys] = useState([]); // tree选中的key数组
  const [treeList, setTreeList] = useState(props.treeData)
  const [childDeviceId, setChildDeviceId] = useState(null)
  const [childDeviceList, setChildDeviceList] = useState([])
  const [pointKey, setPointKey] = useState("0");
  const [superTitle, setSuperTitle] = useState(null);
  const language = localStorage.getItem('language') || 'zh'

  useEffect(() => {
    document.body.addEventListener('mousemove', stopMouseMove)
    document.body.addEventListener('mouseup', stopMouseUp)
    // 查询treeData
    props.action('getTreeList', { userId });
    props.action('getEnums');

    return () => {
      document.body.removeEventListener('mouseup', stopMouseUp)
      document.body.removeEventListener('mousemove', stopMouseMove)
      startX = undefined;
      startWidth = undefined;
      isMousedown = false;
      nowPointNumber = null;
      props.action('reset')
    }
  }, []);

  // tabs的key改变查询数据
  useEffect(() => {
    triggerEvent('resize', window);
    setPointKey("0")
    if (!device) return
    if (activeKey === '1') { // 量测数据
      if (isShowPoint(device)) { // 测量点
        props.action('getMeasurePointsByDeviceId', { deviceId: device?.id });
      }
      // if (isShowPointBatch(device)) { // 批量维护点表
      //   if (device.children?.length) {
      //     const deviceId = device.children.map(i => i.id).join();
      //     setChildDeviceId(deviceId);
      //     console.log('device', device)
      //     setChildDeviceList(device.children);
      //     props.action('getPointListByDeviceId', { deviceId });
      //   } else {// 单体电池
      //     createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: device?.id, activity: true })
      //       .then(data => {
      //         const deviceId = (data?.results || []).map(i => i.id).join();
      //         setChildDeviceId(deviceId);
      //         setChildDeviceList(data?.results || []);
      //         props.action('getPointListByDeviceId', { deviceId });
      //       })
      //   }
      // }
    } else { // 其他数据
      props.action('getOtherPointsByDevIdList', { devIdList: device?.id, type: 2, page: 1, size: 20 });
    }
  }, [activeKey, JSON.stringify(device)]);

  useEffect(() => {
    if (!superTitle) setPointKey(pointKey ?? "0")
  }, [superTitle, pointKey])

  // 由上级跳转到当前页面需要定位到端子tab
  useEffect(() => {
    if (superTitle && props.measurePointList?.length) {
      const index = props.measurePointList.findIndex(i => i.terminal?.title === superTitle)
      if (index > -1) {
        setPointKey(`${index}`);
        setSuperTitle(null);
      }
    }
  }, [JSON.stringify(props.measurePointList), superTitle])

  useEffect(() => {
    if (device?.id) props.action('getTerminals', { deviceId: device?.id }); // 获取端子数据
    if (device?.stationId) props.action('getSecondaryDevicesList', { stationId: device?.stationId }); // 获取端子数据
  }, [JSON.stringify(device)])

  useEffect(() => {
    setTreeList(treeData);
    if (treeData?.length) {
      setSelectKeys([treeData[0].key]);
      setDevice(treeData[0]);

      setActiveKey(treeData[0].type === 'Station' || treeData[0].type === 'EnergyUnit' ? '2' : '1'); // 电站和能量单元只有其他数据
    }
  }, [JSON.stringify(treeData)])

  useEffect(() => {
    if (props.measurePointList && props.measurePointList.length && device?.id) {
      props.action('getPointsByDeviceIdAndTerminal', { deviceId: device?.id, terminal: props.measurePointList[Number(pointKey ?? 0)]?.terminal?.name ?? 'default', page: 1, size: 20 })
    }
  }, [JSON.stringify(props.measurePointList), JSON.stringify(device), pointKey])

  const stopMouseMove = (e) => {
    if (isMousedown) {
      setLeftTreeWidth(Math.min(Math.max(startWidth + e.clientX - startX, 12), 500))
      setTimeout(() => {
        triggerEvent('resize', window)
      }, 500)
    }
  }

  const stopMouseUp = () => {
    isMousedown = false
    // window.event.stopPropagation();
  }

  // 打开modal
  const openModal = useCallback(
    (type = 1, record?: any) => {
      if (type === 1) {
        if (!props.terminalList?.length && props.measurePointList?.length) {
          message.error(utils.intl('默认端子的测量点只能新增一次'))
        } else {
          setModalType(type);
          setVisible(true);
        }
      } else {
        setModalType(type);
        setVisible(true);
        if (record) setNowRecord(record);
      }
    }, [JSON.stringify(props.terminalList), JSON.stringify(props.measurePointList)]);

  // 打开删除modal 
  const openDeleteModal = (type = 1, record?: any) => {
    const modal = Modal.warn({
      title: type === 1 ? utils.intl('是否删除{0}', '测量点') : type === 2 ? utils.intl('是否删除{0}', '点号') : utils.intl('是否删除{0}', '数据项'),
      className: "acq-receiver-delete-modal",
      content: (
        <>
          <p className="delete-context">{utils.intl('删除后将不可恢复，请谨慎操作，你还要继续吗')}?</p>
          <div style={{ textAlign: "right" }}>
            <Button onClick={() => modal.destroy()} style={{ marginRight: 8 }}>{utils.intl('取消')}</Button>
            <Button type="primary" onClick={() => {
              if (type === 1) {
                // console.log('device?.id', device?.id)
                props.action('deleteMeasurePoints', { deviceId: device?.id, id: record.id }).then(errorCode => {
                  if (errorCode === 0) {
                    message.success(utils.intl('删除成功'))
                  }
                })
              } else if (type === 2) {
                props.action('deletePoints', { deviceId: device?.id, terminal: props.measurePointList[Number(pointKey)]?.terminal?.name, id: record.id }).then(errorCode => {
                  if (errorCode === 0) {
                    message.success(utils.intl('删除成功'))
                  }
                })
              } else {
                props.action('deleteOtherPoints', { devIdList: device?.id, id: record.id, type: 2 }).then(errorCode => {
                  if (errorCode === 0) {
                    message.success(utils.intl('删除成功'))
                  }
                })
              }
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

  // modal 关闭
  const onCancel = () => {
    setVisible(false);
  }

  // 点击确定,验证，保存
  const onOk = useCallback(
    (form) => {
      form.validateFields().then((value) => {
        if (modalType === 1) {// 测量点数据新增
          props.action("addMeasurePoints", { deviceId: device?.id, value: measureFormDataToService(value) })
            .then(code => {
              if (code === 0) {
                message.success(utils.intl('保存成功'))
                setVisible(false);
              }
            })
        } else if (modalType === 2) {// 测量点数据编辑
          props.action("updateMeasurePoints", { deviceId: device?.id, value: measureFormDataToService({ ...nowRecord, ...value }) })
            .then(code => {
              if (code === 0) {
                message.success(utils.intl('保存成功'))
                setVisible(false);
              }
            })
        } else if (modalType === 3) {// 点号数据新增
          const terminalId = props.measurePointList[Number(pointKey)]?.terminal?.id;
          const terminal = props.measurePointList[Number(pointKey)]?.terminal?.name;
          // measureFormDataToService(value)
          // console.log('value', value)
          props.action("addPoints", { deviceId: device?.id, terminal, value: measureFormDataToService({ ...value, deviceId: device?.id, terminalId, terminalName: terminal ?? 'default' }) })
            .then(code => {
              if (code === 0) {
                message.success(utils.intl('保存成功'))
                setVisible(false);
              }
            })
        } else if (modalType === 4) { // 点号数据编辑
          const terminalId = props.measurePointList[Number(pointKey)]?.terminal?.id;
          const terminal = props.measurePointList[Number(pointKey)]?.terminal?.name;
          props.action("updatePoints", { deviceId: device?.id, terminal, value: measureFormDataToService({ ...nowRecord, ...value, deviceId: device?.id, terminalId, terminalName: terminal ?? 'default' }) })
            .then(code => {
              if (code === 0) {
                message.success(utils.intl('保存成功'))
                setVisible(false);
              }
            })
        } else if (modalType === 5) { // 其他数据新增
          // console.log('value', value)
          props.action("addOtherPoints", { devIdList: device?.id, type: 2, value })
            .then(code => {
              if (code === 0) {
                message.success(utils.intl('保存成功'))
                setVisible(false);
              }
            })
        } else if (modalType === 6) {// 其他数据编辑
          props.action("updateOtherPoints", { devIdList: device?.id, type: 2, value: { ...nowRecord, ...value } })
            .then(code => {
              if (code === 0) {
                message.success(utils.intl('保存成功'))
                setVisible(false);
              }
            })
        }


      })
    }, [modalType, device?.id, JSON.stringify(nowRecord), pointKey, JSON.stringify(props.measurePointList)]);

  // 测量点表单数据从服务端转前端
  const measureServiceToFormData = useCallback((sData: any = {}) => {
    const serviceData = _.cloneDeep(sData)
    if (modalType === 1 || modalType === 2) {
      serviceData.terminal = serviceData.terminal?.id;
      serviceData.secondaryDevices = serviceData.secondaryDevices?.length ? serviceData.secondaryDevices.map(i => i.id) : [];
    } else if (modalType === 3 || modalType === 4) {
      serviceData.remotePulse = serviceData.remotePulse ? [1] : undefined
      // serviceData.unit = serviceData.unit ? Number(serviceData.unit) : serviceData.unit;
      // serviceData.accuracy = serviceData.accuracy ? Number(serviceData.accuracy) : serviceData.accuracy;
    } else if (modalType === 5 || modalType === 6) {

    }
    return serviceData;
  }, [modalType]);

  // 测量点表单数据从前端转服务端
  const measureFormDataToService = useCallback((fData: any = {}) => {
    const formData = _.cloneDeep(fData)
    if (modalType === 1 || modalType === 2) {
      if (formData.terminal === utils.intl('默认端子')) {
        delete formData.terminal;
      } else {
        formData.terminal = formData.terminal ? { id: formData.terminal } : {};
      }
      formData.secondaryDevices = formData.secondaryDevices?.length ? formData.secondaryDevices.map(item => ({ id: item })) : [];
    } else if (modalType === 3 || modalType === 4) {
      formData.remotePulse = !!formData.remotePulse?.length
    } else if (modalType === 5 || modalType === 6) {

    }
    return formData;
  }, [modalType]);

  // 初始化form
  const initForm = useCallback((form) => {
    if (modalType === 2) { // 测量点form
      form.setFieldsValue(measureServiceToFormData(nowRecord));
    } else if (modalType === 3) { // 数据点表
      props.action('updateState', { pointNumberTitle: null })
    } else if (modalType === 4) { // 数据点表
      const measurePointId = props.measurePointList[Number(pointKey)]?.id
      props.action('getPointNumber', { pointNumber: nowRecord.pointNumber, measurePointId });
      form.setFieldsValue(measureServiceToFormData(nowRecord));
    } else if (modalType === 6) {
      form.setFieldsValue(measureServiceToFormData(nowRecord));
    }

  }, [modalType, JSON.stringify(nowRecord), JSON.stringify(props.measurePointList), pointKey]);

  const handleActiveKeyChange = useCallback((activeKey) => {
    setActiveKey(activeKey);
    setPointKey(pointKey ?? '0')
    triggerEvent('resize', window);
  }, [pointKey])

  // 打开摇脉页面（子页面）
  const openRemotePulsePage = useCallback((record: any) => {
    props.forward('RemotePulse', { ...record, device });
  }, [JSON.stringify(device)]);

  const unitMap = useMemo(() => {
    return unitList.reduce((pre, item) => {
      pre[item.name] = item.value;
      return pre;
    }, {})
  }, [JSON.stringify(unitList)])

  const accuracyMap = useMemo(() => {
    return accuracyList.reduce((pre, item) => {
      pre[item.name] = item.value;
      return pre;
    }, {})
  }, [JSON.stringify(accuracyList)])
  // console.log('unitMap', unitMap, accuracyMap);

  // 导入
  const handleImport = useCallback(async (l: []) => {
    const list = l.filter(item => {
      const keys = importRequiredFieldMap[importModalType].split(',');
      return keys.filter(key => item[key] && item[key] !== '').length
    })
    if (checkFile(list, importRequiredFieldMap[importModalType])) {
      if (importModalType === 1) { // 数据点号导入
        const newList = await checkFileWork(list, importRequiredFieldMap[importModalType])
        if (newList) {
          const terminalId = props.measurePointList[Number(pointKey)]?.terminal?.id;
          const terminal = props.measurePointList[Number(pointKey)]?.terminal?.name;
          const newList = list.map((i: any) => {
            // {...i, typeTitle: i.typeTitle, pointNumber: i.pointNumber, desc: i.desc, type: 2, deviceId: device?.id, terminalId, terminalName: terminal }
            i.terminalName = terminal ?? 'default';
            i.deviceId = device?.id;
            i.terminalId = terminalId;
            delete i['序号']
            return i
          })
          props.action('addAllPoints', { deviceId: device?.id, terminal, value: { list: newList } });
          setImportVisible(false);
        }
      } else if (importModalType === 2) { // 批量导入明细
        const newList = await checkFileWork(list, importRequiredFieldMap[importModalType])
        if (newList) {
          props.action('addPointListPoints', {
            deviceId: (device?.children || []).map(i => i.id).join(), value: {
              list: newList.map(i => {
                i.terminalName = i.terminalName ?? 'default';
                delete i['序号'];
                return i;
              })
            }
          });
          setImportVisible(false);
        }
      } else if (importModalType === 3) { // 其他数据导入
        const newList = list.map((i: any) => ({ typeTitle: i.typeTitle, pointNumber: i.pointNumber, desc: i.desc, type: 2, deviceId: device?.id }))
        // console.log('newList', newList, device)
        props.action('addAllOtherPoints', { devIdList: device?.id, type: 2, value: { list: newList } });
        setImportVisible(false);
      }
    }
  }, [importModalType, JSON.stringify(device), pointKey, JSON.stringify(props.measurePointList)])

  // 导入打开
  const openImportModal = useCallback((type) => {
    setImportModalType(type);
    setImportVisible(true);
  }, [])

  // 验证导入文件的字段(必填验证)
  const checkFile = useCallback((list: any[], requireField: string = ""): boolean => {
    // console.log('list', list)
    if (!list?.length) {
      message.error(utils.intl('导入数据为空'))
      return false;
    } else {
      const index = list.findIndex((item) => {
        const keys = requireField.split(',');
        let flag = false;
        for (let i = 0; i < keys.length; i++) {
          if (!item[keys[i]] || item[keys[i]] === '') {
            flag = true;
            break;
          }
        }
        return flag;
      })
      // console.log('list', list, index)
      if (index > -1) {
        message.error(utils.intl(`第{0}项数据内容不全`, index + 1));
        return false;
      } else {
        const i = list.findIndex((i, index) => !!list.find((item, ind) => i.pointNumber === item.pointNumber && ind !== index));
        if (i > -1) {
          message.error(utils.intl(`第{0}项数据点号重复`, i + 1));
          return false
        }
        return true
      }
    }
    return true
  }, []);

  // 业务逻辑验证
  const checkFileWork = useCallback(async (list: any[], requireField: string = ""): Promise<boolean | any> => {
    if (importModalType === 2) { // 批量导入明细
      // console.log('childDeviceList', childDeviceList, list)
      const errorIndex = list.findIndex((item, index) => {
        const obj = childDeviceList.find(i => i.title === item.deviceName)
        list[index].deviceId = obj ? obj.id : null;
        return !obj
      })
      if (errorIndex < 0) {
        // 验证精度和单位
        const uaIndex = list.findIndex((item, index) => {
          const flag = item.unit && item.unit !== '无' && (!unitMap[item.unit] || !accuracyMap[item.accuracy]);
          if (unitMap[item.unit]) {
            list[index].unit = unitMap[item.unit] ?? null
          }
          if (accuracyMap[item.accuracy]) {
            list[index].accuracy = accuracyMap[item.accuracy]
          }
          return flag;
        })
        if (uaIndex < 0) {
          // 点号验证
          const pointNumbers = list.map(i => i.pointNumber);
          // console.log('pointNumbers', pointNumbers)
          const { results } = await createServices<any>("post", "/acquisition-configuration/getPointNumberBatch", { pointNumbers });
          const pMap = (results || []).reduce((pre, item) => {
            pre[item.pointNumber] = pre[item.pointNumber] ?? item.title;
            return pre;
          }, {});
          // console.log('pointNumbers', pointNumbers,pMap)
          const pIndex = list.findIndex(item => !pMap[item.pointNumber]);
          if (pIndex > -1) {
            message.error(utils.intl(`第{0}项数据的点号未维护`, pIndex + 1));
            return false
          } else {
            // 验证相关的端子
            const { results } = await createServices<any>("post", "/acquisition-configuration/checkTerminal", { list });
            if (Array.isArray(results)) {
              return results
            } else {
              message.error(utils.intl(`第{0}项数据的端子未维护`, (results as number) + 1));
              return false
            }
          }
          return true
        } else {
          message.error(utils.intl(`第{0}项数据的精度或单位不合理`, uaIndex + 1));
          return false
        }
        //createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: id, activity: true })
      } else {
        message.error(utils.intl(`第{0}项数据的所属设备不在当前设备序列里`, errorIndex + 1));
        return false
      }
    } else if (importModalType === 1) {
      // 验证精度和单位
      const uaIndex = list.findIndex((item, index) => {
        const flag = item.unit && item.unit !== '无' && (!unitMap[item.unit] || !accuracyMap[item.accuracy]);
        if (unitMap[item.unit]) {
          list[index].unit = unitMap[item.unit] ?? null
        }
        if (accuracyMap[item.accuracy]) {
          list[index].accuracy = accuracyMap[item.accuracy]
        }
        return flag;
      })
      // console.log('uaIndex', uaIndex, list[uaIndex], unitMap, accuracyMap)
      if (uaIndex < 0) {
        // 点号验证
        const pointNumbers = list.map(i => i.pointNumber);
        const { results } = await createServices<any>("post", "/acquisition-configuration/getPointNumberBatch", { pointNumbers });
        const pMap = (results || []).reduce((pre, item) => {
          pre[item.pointNumber] = pre[item.pointNumber] ?? item.title;
          return pre;
        }, {});
        // console.log('pointNumbers', pointNumbers,pMap)
        const pIndex = list.findIndex(item => !pMap[item.pointNumber]);
        if (pIndex > -1) {
          message.error(utils.intl(`第{0}项数据的点号未维护`, pIndex + 1));
          return false
        }
      } else {
        message.error(utils.intl(`第{0}项数据的单位或者精度未维护`, uaIndex + 1));
        return false
      }
    }
    return list
  }, [importModalType, JSON.stringify(childDeviceList), JSON.stringify(unitMap), JSON.stringify(accuracyList)]);

  const handlerTree = (treeList => {
    if (!treeList || !treeList.length) {
      return [];
    }

    return treeList.map(item => {
      const leaf = { ...item };
      leaf.checkable = false;
      leaf.selectable = true;

      if (leaf.type === Tree_Type.batteryGroup) {
        // 电池组类型
        if (leaf.children && leaf.children.length && leaf.children[0]?.type === Tree_Type.singleBattery) {
          leaf.hasChild = true;
        }
      } else if (leaf.type === Tree_Type.batteryPackage && leaf.children && leaf.children.length) {
        leaf.hasChild = true;
      }

      leaf.isLeaf = !leaf.hasChild && !leaf?.children?.length || leaf.type == Tree_Type.singleBattery;

      if (leaf.children) {
        leaf.children = handlerTree(leaf.children);
      }

      return leaf;
    });
  })

  // tree选择
  const handleTreeSelect = (keys, e) => {
    if (keys?.length) {
      setSelectKeys(keys);
      setDevice(e.node);
    }

    const device = e.node
    if (device.children?.length) {
      const deviceId = device.children.map(i => i.id).join();
      setChildDeviceId(deviceId);
      // console.log('device', device)
      setChildDeviceList(device.children);
      props.action('getPointListByDeviceId', { deviceId });
    } else if(e.node.hasChild){ // 单体电池
      createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: device?.id, activity: true })
        .then(data => {
          const deviceId = (data?.results || []).map(i => i.id).join();
          setChildDeviceId(deviceId);
          setChildDeviceList(data?.results || []);
          props.action('getPointListByDeviceId', { deviceId });
        })
    }
    setActiveKey(e.node.type === 'Station' || e.node.type === 'EnergyUnit' ? '2' : '1'); // 电站和能量单元只有其他数据
  }

  const updateTreeData = (list: any[], key: React.Key, children: any[]): any[] => {
    return list.map((node) => {
      if (node.key === key) {
        return {
          ...node,
          children: children?.map((item, index) => ({ ...item, key: `${key}-${index}` })),
        };
      }
      if (node.children?.length) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  }

  // 是否显示测量点信息|数据点表
  const isShowPoint = useCallback((device: any): boolean => {
    return device?.type !== 'VirtualNode'; // 不是设备大类的设备
  }, [])

  // 是否显示批量维护点表
  const isShowPointBatch = useCallback((device: any): boolean => {
    return device?.children && device?.children.length || device?.hasChild
  }, [])

  // 点号change
  const handlePointNumberChange = useCallback((value) => {
    const measurePointId = props.measurePointList[Number(pointKey)]?.id
    // nowPointNumber = value;
    // setTimeout(() => {
    props.action("getPointNumber", { pointNumber: value, measurePointId });
    // }, 500)
  }, [JSON.stringify(props.measurePointList)])



  const columns1 = [
    { title: utils.intl('序号'), dataIndex: 'num', key: 'num', width: 65 },
    { title: utils.intl('测量点名称'), dataIndex: 'title', key: 'title', width: 250 },
    { title: utils.intl('输入/输出端'), dataIndex: 'terminal', key: 'terminal', width: 250, render: (obj) => obj?.title ?? utils.intl('默认端子') },
    { title: utils.intl('绑定二次设备'), dataIndex: 'secondaryDevices', key: 'secondaryDevices', ellipsis: true, render: (obj) => obj ? obj.map(item => item.title).join() : null },
    {
      title: utils.intl('操作'), dataIndex: 'operation', key: 'operation', align: "right", width: 135, render: (text, record) => (
        <div className="table-btns">
          <div onClick={() => openModal(2, record)}>{utils.intl('编辑')}</div>
          <div onClick={() => openDeleteModal(1, record)}>{utils.intl('删除')}</div>
        </div>
      )
    },
  ];
  // , [JSON.stringify(device), JSON.stringify(props.terminalList), visible]);

  const columns2 = [
    { title: utils.intl('序号'), dataIndex: 'num', key: 'num', width: 65, render: (text, record, index) => (props.PointsPage - 1) * props.PointsSize + index + 1 },
    {
      title: utils.intl('数据项名称'), dataIndex: 'typeTitle', key: 'typeTitle', ellipsis: true, render: (text, record) => {
        return record.remotePulse ? (
          <div className="remote-pulse-title" onClick={() => openRemotePulsePage(record)}>{text}</div>
        ) : text
      }
    },
    { title: utils.intl('缩写/简写'), dataIndex: 'name', key: 'name', width: 110 },
    { title: utils.intl('初始单位'), dataIndex: 'unit', key: 'unit', width: 110, render: text => unitList.find(i => `${i.value}` === text)?.name },
    { title: utils.intl('数据精度'), dataIndex: 'accuracy', key: 'accuracy', width: 130, render: text => accuracyList.find(i => `${i.value}` === text)?.name },
    { title: utils.intl('点号'), dataIndex: 'pointNumber', key: 'pointNumber', width: 180 },
    { title: utils.intl('点号名称'), dataIndex: 'title', key: 'title', width: '18%' },
    {
      title: utils.intl('操作'), dataIndex: 'operation', key: 'operation', align: "right", width: 150, render: (text, record) => (
        <div className="table-btns">
          <div onClick={() => openModal(4, record)}>{utils.intl('编辑')}</div>
          {record.delete ? <div onClick={() => openDeleteModal(2, record)}>{utils.intl('删除')}</div> : null }
        </div>
      )
    },
  ]

  const columns3 = useMemo(() => {
    return [
      { title: utils.intl('设备对象'), dataIndex: 'deviceName', key: 'deviceName', width: '22%' },
      { title: utils.intl('输入/输出端'), dataIndex: 'terminal', key: 'terminal', width: '22%' },
      {
        title: utils.intl('点号数量'), dataIndex: 'num', key: 'num', width: '35%', render: (text, record) =>
          record.deviceName === "合计" || record.deviceName === "Total" ? text : <div style={{ color: "#3D7EFF", cursor: "pointer" }} onClick={() => {
            setExpandedKeys([...expandedKeys, device.key]);
            setSelectKeys([device.children.find(i => i.id === record.id)?.key]);
            setDevice(device.children.find(i => i.id === record.id));
            // 对应端子打开
            props.action('updateState', { measurePointList: [] });
            setSuperTitle(record.terminal);
          }}>{text}</div>
      },
    ]
  }, [JSON.stringify(device)]);

  const columns4 = useMemo(() => {
    return [
      { title: utils.intl('序号'), dataIndex: 'num', key: 'num', width: 65, render: (text, record, index) => (props.otherPointPage - 1) * props.otherPointSize + index + 1 },
      { title: utils.intl('数据项名称'), dataIndex: 'typeTitle', key: 'typeTitle', width: 250 },
      { title: utils.intl('点号'), dataIndex: 'pointNumber', key: 'pointNumber', width: '15%' },
      {
        title: utils.intl('描述'), dataIndex: 'desc', key: 'desc', ellipsis: true
      },
      {
        title: utils.intl('操作'), dataIndex: 'operation', key: 'operation', width: 120, align: "right", render: (text, record) => (
          <div className="table-btns">
            <div onClick={() => openModal(6, record)}>{utils.intl('编辑')}</div>
            <div onClick={() => openDeleteModal(3, record)}>{utils.intl('删除')}</div>
          </div>
        )
      },
    ]
  }, [JSON.stringify(device), props.otherPointPage, props.otherPointSize]);

  // 输入/输出端数据过滤
  const terminalList = useMemo(() => {
    if (modalType === 1) {
      const ids = props.measurePointList.map(i => i.terminal?.id).filter(i => !!i);
      return props.terminalList.filter(i => ids.indexOf(i.value) < 0)
    } else if (modalType === 2) {
      const ids = props.measurePointList.map(i => i.terminal?.id).filter(i => !!i && i !== nowRecord.terminal?.id);
      return props.terminalList.filter(i => ids.indexOf(i.value) < 0)
    }
    return []
  }, [JSON.stringify(props.terminalList), modalType, JSON.stringify(props.measurePointList), JSON.stringify(nowRecord)])

  return (
    <Page pageId={pageId} className="acq-page" style={{ display: 'flex', background: "transparent", boxShadow: "none" }}>
      <div className="left page-sub-left" ref={LeftTreeDom} style={{ flexShrink: 0, width: leftTreeWidth }}>
        <div className="flex1 f-oa e-pt20 e-pl20 e-pr20 horizontal-scroll-tree" style={{ position: 'relative' }}>
          {
            treeLoading && (<FullLoading />)
          }
          <AutoSizer>
            {
              ({ width, height }) => {
                const newTreeList = handlerTree(treeList)
                if (height === 0 || treeData?.length === 0) return null
                return (<Tree
                  // filterable
                  scrollX
                  showIcon
                  showLine
                  height={height}
                  // checkable
                  treeData={newTreeList}
                  expandedKeys={expandedKeys}
                  onExpand={expandedKeys => setExpandedKeys(expandedKeys as string[])}
                  onClick={e => e.stopPropagation()}
                  onSelect={handleTreeSelect}
                  selectedKeys={selectKeys}
                  // searchProps={{
                  //   placeholder: utils.intl('请输入关键字搜索')
                  // }}
                  loadData={(node) =>
                    new Promise<void>(resolve => {
                      const { key, id, children, hasChild } = node
                      // setDisabled(true);
                      if (children && children.length || !hasChild) {
                        // setDisabled(false);
                        resolve();
                        return;
                      } else if (hasChild) {
                        createServices<{ parentId: number, activity: boolean }>("get", "/api/basic-data-management/equipment-ledger/devices/getDeviceTreeChild", { parentId: id, activity: true })
                          .then(data => {
                            setTreeList(tList => updateTreeData(tList, key, data?.results || []))
                            resolve();
                          })
                      }
                    })}
                />)
              }
            }
          </AutoSizer>
        </div>
        <div
          className="dragBox"
          onMouseDown={e => {
            startX = e.clientX
            const { width } = LeftTreeDom.current.getBoundingClientRect()
            startWidth = width
            isMousedown = true
          }}
          onClick={e => e.stopPropagation()}
        >
          <ZdDragOutlined style={{ color: '#999' }} />
        </div>
      </div>
      <div className="right" style={{ overflow: 'hidden', marginLeft: 0, display: 'flex', flexDirection: "column", flex: 1 }}>
        {
          device ? <Tabs activeKey={activeKey} onChange={handleActiveKeyChange}>
            {
              device?.type === 'Station' || device?.type === 'EnergyUnit' ? null : (
                <TabPane tab={utils.intl('量测数据')} key="1">
                  <div className="tabs-body" style={{ overflowY: isShowPoint(device) && isShowPointBatch(device) ? 'auto' : 'hidden' }}>
                    {
                      isShowPoint(device) ? (
                        <>
                          <header>
                            {utils.intl('测量点信息')}
                            <div className="btn-group">
                              <Button type="primary" size="small" onClick={() => openModal(1)}>{utils.intl('新增')}</Button>
                            </div>
                          </header>
                          <div className="table-box">
                            <Table1
                              columns={columns1}
                              dataSource={props.measurePointList}
                              loading={measurePointLoading}
                            />
                          </div>
                          <header style={{ marginBottom: 16 }}>
                            {utils.intl('数据点表')}
                          </header>
                          {
                            props.measurePointList?.length ? (
                              <Tabs activeKey={pointKey} type="card" className={classNames({ "tabs-en": language !== 'zh' })} size="small" tabPosition="top" tabBarExtraContent={
                                props.measurePointList?.length ? <div className="btn-group" style={{ top: 6 }}>
                                  <Button type="primary" size="small" onClick={() => openModal(3)}>{utils.intl('新增')}</Button>
                                  <Button size="small" onClick={() => openImportModal(1)}>{utils.intl('导入')}</Button>
                                  <Button size="small" onClick={() => {
                                    props.action("onPointsExport", { deviceId: device?.id, terminal: props.measurePointList[Number(pointKey)]?.terminal?.name ?? 'default' })
                                  }}>{utils.intl('导出')}</Button>
                                </div> : null
                              } onChange={(key) => {
                                setPointKey(key);
                                triggerEvent('resize', window);
                                props.action('getPointsByDeviceIdAndTerminal', { deviceId: device?.id, terminal: props.measurePointList[Number(key)]?.terminal?.name ?? 'default', page: 1, size: 20 })
                              }}>
                                {
                                  props.measurePointList?.map((item, index) => (
                                    <TabPane key={index} tab={item.title}>
                                      <div className="table-box" style={{ height: 'calc(100vh - 570px)', marginBottom: 12, marginTop: 0 }}>
                                        <Table2
                                          columns={columns2}
                                          dataSource={props.PointsList}
                                          loading={pointLoading}
                                          page={props.PointsPage}
                                          size={props.PointsSize}
                                          total={props.PointsTotal}
                                          onPageChange={(page: number, size: number) => props.action('getPointsByDeviceIdAndTerminal', { deviceId: device?.id, terminal: item.terminal?.name ?? 'default', page, size })}
                                        />
                                      </div>
                                    </TabPane>
                                  ))
                                }
                              </Tabs>
                            )
                              : <Empty className="tabs-empty" image={<div className="empty-img" />} description={utils.intl('请先添加测量点，再维护数据点表')} />
                          }
                        </>
                      ) : null
                    }
                    {
                      isShowPointBatch(device) ? (<>
                        <header style={{ marginTop: isShowPoint(device) ? 16 : 0 }}>
                          {utils.intl('批量维护点表')}
                          <div className="btn-group">
                            <Button type="primary" size="small" onClick={() => props.action("onPointListExport", { deviceId: childDeviceId })}>{utils.intl('导出汇总表')}</Button>
                            <Button size="small" onClick={() => openImportModal(2)}>{utils.intl('导入明细')}</Button>
                            <Button size="small" onClick={() => props.action("onPointDetailExport", { deviceId: childDeviceId })}>{utils.intl('导出明细')}</Button>
                          </div>
                        </header>

                        <div className="table-box" style={{ height: isShowPoint(device) ? 'calc(33.3% - 64px)' : 'calc(100% - 64px)' }}>
                          <Table1
                            columns={columns3}
                            dataSource={props.countPointList}
                            loading={pointListLoading}
                          />
                        </div>
                      </>) : null
                    }
                  </div>
                </TabPane>
              )
            }
            {device?.type !== 'VirtualNode' && device?.name !== 'GridConnectedUnit' ? ( // 设备大类没有其他数据,并网单元没有其他数据
              <TabPane tab={utils.intl('其他数据')} key="2">
                <div className="tabs-body">
                  <header className="no-before">
                    <div className="btn-group">
                      <Button type="primary" size="small" onClick={() => openModal(5)}>{utils.intl('新增')}</Button>
                      <Button size="small" onClick={() => openImportModal(3)}>{utils.intl('导入')}</Button>
                      <Button size="small" onClick={() => props.action("onOtherPointsExport", { devIdList: device?.id, type: 2 })}>{utils.intl('导出')}</Button>
                    </div>
                  </header>
                  <div className="table-box"
                    style={{
                      height: "calc(100% - 54px)",
                      marginBottom: 16
                    }}>
                    <Table2
                      columns={columns4}
                      dataSource={props.otherPointList}
                      loading={otherPointLoading}
                      page={props.otherPointPage}
                      size={props.otherPointSize}
                      total={props.otherPointTotal}
                      onPageChange={(page: number, size: number) => props.action('getOtherPointsByDevIdList', { devIdList: device?.id, type: 2, page, size })}
                    />
                  </div>
                </div>
              </TabPane>
            ) : null}
          </Tabs> : null
        }
      </div>
      <Modal
        visible={visible}
        title={modalTitleMap[modalType]}
        wrapClassName="acq-modal-box"
        width={modalType === 1 || modalType === 2 ? 480 : 640}
        footer={null}
        onCancel={onCancel}
      >
        {
          modalType === 1 || modalType === 2 ?
            <MeasurePointsForm
              terminalDataSource={terminalList}
              secondaryDataSource={props.secondaryDevicesList}
              noTerminal={!props.terminalList?.length}
              loading={props.saveMeasurePointsLoading}
              onCancel={onCancel}
              onOk={onOk}
              initForm={initForm}
            /> :
            modalType === 3 || modalType === 4 ?
              <PointForm
                unitDataSource={unitList}
                accuracyDataSource={accuracyList}
                pointNumberTitle={props.pointNumberTitle}
                loading={props.savePointsLoading}
                onCancel={onCancel}
                onOk={onOk}
                initForm={initForm}
                handlePointNumberChange={handlePointNumberChange}
              />
              :
              modalType === 5 || modalType === 6 ?
                <DataItemForm
                  loading={props.saveOtherPointsLoading}
                  onCancel={onCancel}
                  onOk={onOk}
                  initForm={initForm}
                /> : null
        }
      </Modal>
      <ImportExcelDialog
        // loading={props.importDataLoading}
        onImport={handleImport}
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        attrKeyMap={importAttrKeyMap}
      />
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
    otherPointLoading: getLoading('getOtherPointsByDevIdList'),
    treeLoading: getLoading('getTreeList'),
    measurePointLoading: getLoading('getMeasurePointsByDeviceId'),
    pointListLoading: getLoading('getPointListByDeviceId'),
    pointLoading: getLoading('getPointsByDeviceIdAndTerminal'),

    saveMeasurePointsLoading: getLoading('addMeasurePoints') || getLoading('updateMeasurePoints'),
    saveOtherPointsLoading: getLoading('addOtherPoints') || getLoading('updateOtherPoints'),
    saveRemotePulseLoading: getLoading('addRemotePulse') || getLoading('updateRemotePulse'),
    savePointsLoading: getLoading('addPoints') || getLoading('updatePoints'),
  }
}

export default makeConnect(modelNamespace, mapStateToProps)(AcquisitionConfigurationPage);