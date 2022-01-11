import moment from 'moment';
import { makeModel } from "../../umi.helper";
import { device_form } from "../../constants";
import Service from "./service";
import services from '../../common-history-data-query/service'
import { DeviceTypeMap } from './columns';
import { TimeFormatMap } from '../station-form/StationForm';
import enums from 'src/models/enums';

function formatDeviceList(treeList) {
  let list = []
  treeList.forEach((node, index) => {
    if(node.child) {
      list.push({
        title: node.stationTitle,
        key: `station-${index}`,
        selectable: false,
        children: formatDeviceList(node.child)
      })
    } else {
      list.push({
        title: node.deviceTitle,
        selectable: false,
        key: node.deviceId.toString()
      })
    }
  })
  return list
}

export class DeviceFormModal {
  query = {
    timeRange: [moment(), moment()],
    timeMode: 'day',
    deviceType: DeviceTypeMap.inverter,
    deviceList: []
  }
  list = []
  deviceTreeList = []
}

export default makeModel(
  device_form,
  new DeviceFormModal(),
  (updateState, updateQuery, getState) => {
    return {
      *getTableData(action, { put, call, select }) {
        const { query } = yield getState(select)
        const { timeMode, timeRange, deviceList, deviceType } = query
        const startTime = timeMode !== 'total' ? timeRange[0].format(TimeFormatMap[timeMode]) : ''
        const endTime = timeMode !== 'total' ? timeRange[1].format(TimeFormatMap[timeMode]) : ''
        const params = {
          startTime,
          endTime,
          deviceIds: deviceList.join(','),
          deviceType
        }
        yield updateState(put, {list: []});
        const list = yield call(
          Service.getTable,
          params
        );
        yield updateState(put, {
          list: list || []
        });
      },
      *getDeviceTree(action, { put, call, select }) {
        // const { query } = yield getState(select)
        // const { deviceType } = query
        // const params = { deviceType }
        // const list = yield call(
        //   Service.getDeviceList,
        //   params
        // )
        // let deviceTreeList = formatDeviceList(list ||[])
        // deviceTreeList = deviceTreeList.filter(item => item.children && item.children.length)

        const { stationId } = action.payload;
        const data = yield call(services.fetchDeviceTree, { stationId, activity: true });

        yield updateState(put, { deviceTreeList: filterTreeData(data.results?.children || []) });
      },
      *onExport(action, { put, call, select }) {
        const { query } = yield getState(select)
        const { timeMode, timeRange, deviceList, deviceType } = query
        const startTime = timeMode !== 'total' ? timeRange[0].format(TimeFormatMap[timeMode]) : ''
        const endTime = timeMode !== 'total' ? timeRange[1].format(TimeFormatMap[timeMode]) : ''
        const params = {
          startTime,
          endTime,
          deviceIds: deviceList.join(','),
          deviceType
        }
        yield call(
          Service.exportTable,
          params
        );
      }
    };
  }
);

const deiviceList = ["Inverter",
  "Combiner",
  "SolarTransformer",
  "GatewayBreaker",
  "ProtectionRelay", 
]

function filterTreeData(treeData, level = 0){
  const list = []
  if(treeData && treeData.length){
    treeData.filter(item => item.children && item.children.length || level > 1).forEach((node, index) => {
      const { children, ...reObj } = node
      if(children && children.length){
        const newChildren = filterTreeData(children, level + 1)
        if(newChildren && newChildren.length) list.push({...reObj, key: `${reObj.id || index}`, children: newChildren, checkable: false })
      }else{
        const ind = deiviceList.findIndex(item => item === reObj.type)
        if(ind > -1) list.push({...reObj, key: `${reObj.id || index}`, checkable: true, typeIndex: ind + 1 })
      }
    })
    return list
  }
  return []
}