// 查询实时数据逻辑
// 通过设备ID查询点号数据类型列表，存储一个pointDataTypeMap
// {typeId: {value, dtime, pointNumber}, ...}
// 查询点号，获取完点号之后,增加上面对象的pointNumber属性
// socket返回的数据结构是点号作键的对象，存一个点号作键的值对象valueMap
// {pointNumber: {val, dtime}}
// typeId从表格字段中获取
// 获取值就是valueObj[typeObj[typeId].pointNumber]

import { makeModel } from '../../../pages/umi.helper';
import { r_d_q, Tree_Type } from '../../../pages/constants';
import services from './service';

export class RealDataQuery {
  treeList = []
  dataPointTypeList = []
  valueMap = {}
  pointDataTypeMap = {}
  currentSelectNode: {
    deviceId: null,
    deviceTypeId: null
  }
}

const simulatorType = [
  'Charge', 'ChargeDetail', 'ChargeDay', 'ChargeMonth', 'ChargeYear', 'ChargeAmount',
  'Discharge', 'DischargeDetail', 'DischargeDay', 'DischargeMonth', 'DischargeYear', 'DischargeAmount',
  'Profit', 'ProfitDetail', 'ProfitDay', 'ProfitMonth', 'ProfitYear', 'ProfitAmount',
  'Generation', 'GenerationDetail', 'GenerationDay', 'GenerationMonth', 'GenerationYear', 'GenerationAmount'
];
// 虚拟点号临时过滤
export const tempAnalogFilter = (origin) => {
  return origin.filter(item => simulatorType.indexOf(item.name) === -1);
}

export default makeModel(r_d_q, new RealDataQuery(), (updateState, updateQuery, getState) => {
  return {
    * fetchDeviceTree({ payload }, { put, call }) {
      const { stationId } = payload;
      const data = yield call(services.fetchDeviceTree, { stationId, activity: true,  needCell: false });
      yield updateState(put, {
        treeList: formatTreeList([data.results]),
      });
    },
    * fetchPointDataType({ payload }, { call, put }) {
      const { deviceId, deviceTypeId } = payload;
      yield updateState(put, {
        dataPointTypeList: [],
      });
      const data = yield call(services.fetchPointDataType, { deviceTypeId, deviceId });
      const { dataPointTypeList, pointDataTypeMap } = data.results;
      const filterDataPointTypeList = tempAnalogFilter(dataPointTypeList);
      // console.log('dataPointTypeList', filterDataPointTypeList)
      yield updateState(put, {
        dataPointTypeList: filterDataPointTypeList.filter(item => item?.terminalName && item.pointNumber),
        pointDataTypeMap
      });
    },
    * updateCurrentSelectNode({ payload }, { call, put }) {
      const { deviceId, deviceTypeId } = payload;
      yield updateState(put, {
        currentSelectNode: { deviceId, deviceTypeId }
      });
    }
  }
})

// 树格式化 key值格式化成 0-0-1
const formatTreeList = (treeList) => {
  if (!treeList || !treeList.length) {
    return []
  }

  return treeList.map((node, index) => {
    const { children, ...rest } = node
    const type = node.type

    return {
      ...rest,
      disabled: type == Tree_Type.station || type == Tree_Type.energyUnit || type == 'VirtualNode',
      children: formatTreeList(children)
    }
  })
}