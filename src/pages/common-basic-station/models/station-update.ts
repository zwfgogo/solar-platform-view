import { stationUpdateNS, Tree_Type } from "../../constants";
import { makeModel } from "../../umi.helper";
import { enumsApi } from "../../../services/global2";
import * as services from "../station.service";
import gdata from "../../../public/js/gdata";
import moment from "moment";
import { addEmptyOption, findTreeItem } from "../../page.helper";
import { identity } from "../station.helper";
import {
  formatChartData,
  formatArrData,
  formatAbnormalData,
  sortChartData,
} from "../../page.helper";
import utils from "../../../public/js/utils";
import { map } from "lodash";
import { message } from "antd";
import { exportFile } from "../../../util/fileUtil";

//TODO 发电单元和用能单元暂未提供
export const energyUnitTypeName_Generate = ['Solar', 'WindPower', 'Storage', 'Generation']; // 光伏、风能、储能、发电
export const energyUnitTypeName_Cost = ['Storage', 'Load']; // 储能、用能

// 转换数据格式
const getMap = (maps = [], labelField = "name", valueField = "value") => {
  return maps.map((item) => ({
    ...item,
    label: item[labelField],
    value: item[valueField],
  }));
};

// 电价格式化 转成前端需要的
export const formatPrice = function (price = {}) {
  const { electricityPriceDetails, id } = price;
  if (!electricityPriceDetails) return { id };
  // return {}
  const newPrice = {
    ...price,
    electricityPriceDetails: (electricityPriceDetails || []).map((item) => ({
      ...item,
      dealers: (item.dealers || []).map((dItem) => ({
        ...dItem,
        monthsList: dItem.monthsList.map(mItem => ({
          ...mItem,
          priceType: Object.keys(mItem.priceDetails || {}).map((key) =>
            parseInt(key)
          ),
          priceDetails: Object.keys(mItem.priceDetails || {}).reduce(
            (pre, pkey) => ({
              ...pre,
              [pkey]: {
                price: mItem.priceDetails[pkey].price,
                timeRange: mItem.priceDetails[pkey].timeRange.map((time) => ({
                  startTime: moment(time.split("-")[0], "HH:mm"),
                  endTime: moment(time.split("-")[1], "HH:mm"),
                })),
              },
            }),
            {}
          ),
        })),
        // priceType: Object.keys(dItem.priceDetails || {}).map((key) =>
        //   parseInt(key)
        // ),
        // priceDetails: Object.keys(dItem.priceDetails || {}).reduce(
        //   (pre, pkey) => ({
        //     ...pre,
        //     [pkey]: {
        //       price: dItem.priceDetails[pkey].price,
        //       timeRange: dItem.priceDetails[pkey].timeRange.map((time) => ({
        //         startTime: moment(time.split("-")[0], "HH:mm"),
        //         endTime: moment(time.split("-")[1], "HH:mm"),
        //       })),
        //     },
        //   }),
        //   {}
        // ),
      })),
    })),
  };

  delete newPrice.effectiveDate;
  delete newPrice.failureDate;

  return newPrice;
};

// 反格式化（将前端表单数据转成服务端要求的数据）
export const reFormatPrice = function (price = {}) {
  const { generate, cost, ...rest } = price

  const result = {
    generate: generate && {
      ...rest,
      reusedStationPrice: !!rest.reusedStationPrice,
      effectiveDate: price.effectiveDate?.format('YYYY-MM-DD HH:00'),
      failureDate: price.failureDate?.format('YYYY-MM-DD HH:00'),
      ...(generate || {}),
      electricityPriceDetails: (generate?.electricityPriceDetails || []).filter((item, index) => generate.rangeType || index === 0).map(item => ({
        ...item,
        energyUnits: generate?.rangeType ? item.energyUnits : [],
        dealers: (item.dealers || []).map(dItem => ({
          ...dItem,
          monthsList: dItem.monthsList.map(mItem => ({
            ...mItem,
            price: mItem.type === 'Single' ? mItem.price : null,
            realTimePrice: mItem.type === 'RealTime' ? mItem.realTimePrice : null,
            priceDetails: mItem.type === 'Multiple' ? mItem.priceDetails && Object.keys(mItem.priceDetails || {}).filter(key => mItem.priceType.indexOf(parseInt(key)) > -1).reduce(
              (pre, pkey) => ({
                ...pre,
                [pkey]: {
                  price: mItem.priceDetails[pkey].price,
                  timeRange: mItem.priceDetails[pkey].timeRange.map((time) => `${time.startTime.format('HH:mm:00')}-${time.endTime.format('HH:mm:00')}`),
                },
              }),
              {}
            ) : {}
          }))
        }))
      }))
    },
    cost: cost && {
      ...rest,
      effectiveDate: price.effectiveDate?.format('YYYY-MM-DD HH:00'),
      failureDate: price.failureDate?.format('YYYY-MM-DD HH:00'),
      ...(cost || {}),
      electricityPriceDetails: (cost?.electricityPriceDetails || []).map(item => ({
        ...item,
        energyUnits: cost?.rangeType ? item.energyUnits : [],
        dealers: (item.dealers || []).map(dItem => ({
          ...dItem,
          monthsList: dItem.monthsList.map(mItem => ({
            ...mItem,
            price: mItem.type === 'Single' ? mItem.price : null,
            realTimePrice: mItem.type === 'RealTime' ? mItem.realTimePrice : null,
            priceDetails: mItem.type === 'Multiple' ? mItem.priceDetails && Object.keys(mItem.priceDetails || {}).filter(key => mItem.priceType.indexOf(parseInt(key)) > -1).reduce(
              (pre, pkey) => ({
                ...pre,
                [pkey]: {
                  price: mItem.priceDetails[pkey].price,
                  timeRange: mItem.priceDetails[pkey].timeRange.map((time) => `${time.startTime.format('HH:mm:00')}-${time.endTime.format('HH:mm:00')}`),
                },
              }),
              {}
            ) : {}
          }))
        }))
      }))
    }
  }

  return result
}

export class EnergyUnitState {
  energyModels = [];
  parent1Options = [];
  parent2Options = [];
  parent3Options = [];
  deviceModels = [];
  newDeviceId = null;
  newEnergyUnitId = null;
  treeList: any[] = [];
  //下拉
  energyUnitTypes = [];
  energyUnitOptions = [];
  deviceTypeList: { name: string; id: number; title: string }[] = [];
  parentDeviceList = [];
  detail = {
    title: "",
    energyUnitTypeId: null
  };
  // 自定义类型
  provinceOptions = [];
  cityOptions = [];
  districtOptions = [];
  newDeviceInfo = { title: null, serial: null }
}

export class StationUpdateModel extends EnergyUnitState {
  // tab1
  stationModels = [];
  values = {};

  newStationId = null;
  basicInfo = {
    title: "",
    stationType: { id: null },
    scale: 0,
    ratedPower: 0,
    hasEnergyUnit: false,
  };
  // showDataPoint = false;
  // tab2

  userOption1 = [];
  userOption2 = addEmptyOption([]);
  userOption3 = addEmptyOption([]);
  manageInfo = {
    operator: { id: null, title: "" },
    maintenance: { id: null, title: "" },
    finalUser: { id: null, title: "" },
  };
  financialType = [];

  // tab3
  energyUnitList = [];

  // tab4
  costSpotPriceList = [];
  generateSpotPriceList = [];
  costPriceList = [];
  generatePriceList = [];
  priceInfo = {
    costId: null,
    generatorId: null,
  };
  price = {};
  generation = {};
  costPriceModal = false;
  generatePriceModal = false;
  spotCurve = {};

  // tab5
  deviceTree = [];
  stationUseTypeList = [];

  realTime = "";
  // 新版电价
  realTimePriceMap_Generate = []; // 实时电价枚举, --- 售电
  priceObjMap = []; // 用电对象
  realTimePriceMap_Cost = []; // 实时电价枚举, --- 购电
  multipleTypeMap = []; // 复费率类型
  nowPrice = {}; // 当前执行电价
  planPrice = {}; // 计划执行电价

  text_Generate = null;
  text_Cost = null;
  price_Generate = {};
  price_Cost = {};
  stationPrice = {}

  energyUnits_Generate = []; // 能量单元_售电
  energyUnits_Cost = []; // 能量单元_购电

  // 应用场景枚举
  scenariosList = [];

  //迁移
  dataPointTotal = ''

  // 采集设备
  list = [];
  allCollectDevices = [];
  bindCollectDevices = [];

  stationStatusMap = {}
  energyUnitStatusMap = {}
  operatorList = []
  debugLogs = []
  timeZone = ''
}

function findTypeId(list, type) {
  let match = list.find((item) => item.name == type);
  return match && match.value;
}

function tranformToBoolean(values, key) {
  if (typeof values[key] !== "undefined") {
    values[key] = values[key] === 1;
  }
  return values;
}

export default makeModel(
  stationUpdateNS,
  new StationUpdateModel(),
  (updateState, updateQuery, getState) => {
    return {
      *fetchStationBasicRes(action, { select, put, call }) {
        const { stationId } = action.payload;
        const data = yield call(services.fetchStationBasicInfo, {
          id: stationId,
        });
        return data
      },
      *fetchStationBasicInfo(action, { select, put, call }) {
        const { stationId } = action.payload;
        const data = yield call(services.fetchStationBasicInfo, {
          id: stationId,
        });
        yield updateState(put, { basicInfo: data });
      },
      *fetchStationBasicInfoDetail(action, { select, put, call }) {
        const { stationId } = action.payload;
        const data = yield call(services.fetchStationBasicInfo, {
          id: stationId,
        });
        yield updateState(put, { detail: data, timeZone: data.timeZone });
      },
      *fetchStationManageInfo(action, { put, call, select }) {
        let data = yield call(services.fetchStationManageInfo, {
          id: action.payload.stationId,
        });
        yield updateState(put, { manageInfo: data });
      },
      *fetchFinancialTypeInfo(action, { put, call, select }) {
        let types = yield call(enumsApi, {
          resource: "financeInfoTypes",
          property: "*",
        });
        yield updateState(put, { financialType: types });
      },
      *fetchStationEnergyList(action, { put, call, select }) {
        let data = yield call(services.fetchStationEnergyList, {
          id: action.payload.stationId,
        });
        yield updateState(put, {
          energyUnitList: data.filter(item => action.payload.activity !== undefined ? item.activity === action.payload.activity : true).map((item) => ({
            ...item,
            value: item.id,
            label: item.title,
          })),
        });
      },
      *fetchStationPriceInfo(action, { put, call, select }) {
        let data = yield call(services.fetchStationPriceInfo, {
          id: action.payload.stationId,
        });
        yield updateState(put, {
          priceInfo: {
            costId: data.cost?.id,
            generatorId: data.generator?.id,
          },
        });
      },
      *fetchStationModel(action, { call, put }) {
        // 基本属性列表
        let results = yield call(services.fetchStationModel, action.payload);
        yield updateState(put, { stationModels: results });
      },
      *fetchUsePriceList(action, { call, put }) {
        let { results: costPriceList } = yield call(
          services.fetchUsePriceList,
          { queryStr: action.payload.queryStr }
        );
        yield updateState(put, { costPriceList });
      },
      *fetchPriceGenerateList(action, { call, put }) {
        let {
          results: generatePriceList,
        } = yield call(services.fetchPriceGenerateList, {
          queryStr: action.payload.queryStr,
        });
        yield updateState(put, { generatePriceList });
      },
      *fetchPriceList(action, { call, put }) {
        if (action.payload.string === "Cost") {
          let { results: costPriceList } = yield call(
            services.fetchUsePriceList
          );
          // let { results: costSpotPriceList } = yield call(services.getSpotList, { type: 'Cost' })
          yield updateState(put, { costPriceList });
        } else if (action.payload.string === "Generation") {
          let { results: generatePriceList } = yield call(
            services.fetchPriceGenerateList
          );
          // let { results: generateSpotPriceList } = yield call(services.getSpotList, { type: 'Generation' })
          yield updateState(put, { generatePriceList });
        }
      },
      *fetchAllPriceList(action, { call, put }) {
        let { results: generatePriceList } = yield call(
          services.fetchPriceGenerateList
        );
        let {
          results: generateSpotPriceList,
        } = yield call(services.getSpotList, { type: "Generation" });
        let { results: costPriceList } = yield call(services.fetchUsePriceList);
        let { results: costSpotPriceList } = yield call(services.getSpotList, {
          type: "Cost",
        });
        yield updateState(put, { costPriceList, costSpotPriceList });
        yield updateState(put, { generatePriceList, generateSpotPriceList });
      },
      *getSpotList(action, { call, put }) {
        if (action.payload.string === "Cost") {
          let { results: costSpotPriceList } = yield call(
            services.getSpotList,
            { type: "Cost", queryStr: action.payload.queryStr }
          );
          yield updateState(put, { costSpotPriceList });
        } else {
          let {
            results: generateSpotPriceList,
          } = yield call(services.getSpotList, {
            type: "Generation",
            queryStr: action.payload.queryStr,
          });
          yield updateState(put, { generateSpotPriceList });
        }
      },
      *bindStationUser(action, { call }) {
        yield call(services.updateStation, action.payload);
      },
      *bindStationAndPrice(action, { call }) {
        if (action.payload.tabType === utils.intl("固定电价")) {
          yield call(services.savePrice, {
            id: action.payload.stationId,
            priceType: action.payload.type,
            priceId: action.payload.priceId,
          });
        } else {
          yield call(services.saveRealTimePrice, {
            id: action.payload.stationId,
            priceType: action.payload.type,
            priceId: action.payload.priceId,
          });
        }
      },
      *fetchEnergyUnitType(action, { select, put, call }) {
        // 电站类型获取能量单元类型
        const { stationTypeId } = action.payload;
        const data = yield call(services.fetchEnergyUnitTypes, {
          stationTypeId,
        });
        yield updateState(put, {
          energyUnitTypes: data,
        });
      },
      *getDeviceTree(action, { call, put }) {
        let results = yield call(services.getEnergyUnitTree, action.payload);
        yield updateState(put, { deviceTree: results.children || [] });
      },
      // *checkShowDataPoint(action, { call, put }) {
      //   console.log(2)
      //   let results = yield call(services.getEnergyUnitTree, action.payload);
      //   yield updateState(put, { showDataPoint: results.children?.length > 0 });
      // },
      // 运营商运维商终端用户的下拉枚举项
      *fetchUserList(action, { select, put, call }) {
        let firmId = gdata("userInfo").firm.id;
        let types = yield call(enumsApi, {
          resource: "firmTypes",
          property: "name",
        });
        let values = yield Promise.all([
          services.fetchOperator({ firmId, firmType: "Operator" }),
          enumsApi({
            resource: "firms",
            activity: true,
            firmTypeIds: findTypeId(types, "Maintenance"),
          }),
          enumsApi({
            resource: "firms",
            activity: true,
            firmTypeIds: findTypeId(types, "FinalUser"),
          }),
        ]);
        yield updateState(put, {
          userOption1: values[0],
          userOption2: addEmptyOption(values[1]),
          userOption3: addEmptyOption(values[2]),
        });
      },
      *addStation(action, { select, put }) {
        const id = yield services.addStation(action.payload);
        yield updateState(put, { newStationId: id });
      },
      *updateStation(action, { select, put }) {
        yield services.updateStation(action.payload);
      },
      *deleteStation(action, { select, put }) {
        yield services.deleteStation({ id: action.payload.stationId });
      },
      *fetchStationUseTypeList(param, { select, put, call }) {
        let data = yield call(enumsApi, { resource: "stationPurposes" });
        yield updateState(put, {
          stationUseTypeList: data,
        });
      },
      *fetchProvinceOptions(action, { call, put }) {
        yield updateState(put, {
          provinceOptions: [],
          cityOptions: [],
          districtOptions: [],
        });
        let results = yield call(services.fetchProvinceOptions, action.payload);
        yield updateState(put, { provinceOptions: results });
      },
      *fetchCityOptions(action, { call, put }) {
        yield updateState(put, { cityOptions: [], districtOptions: [] });
        let results = yield call(services.fetchCityOptions, action.payload);
        yield updateState(put, { cityOptions: results });
      },
      *fetchDistrictOptions(action, { call, put }) {
        yield updateState(put, { districtOptions: [] });
        let results = yield call(services.fetchDistrictOptions, action.payload);
        yield updateState(put, { districtOptions: results });
      },
      //  common
      *fetchDeviceParentForDevice(
        { payload: { deviceTypeId, energyUnitId, showDeviceParent } },
        { select, put, call }
      ) {
        let options = yield call(enumsApi, {
          resource: "parentDevices",
          deviceTypeId,
          energyUnitId,
        });
        if (!options) {
          options = [];
        }
        yield updateState(put, { parentDeviceList: options });
      },

      // energyUnit
      *fetchEnergyUnitModel(action, { call, put }) {
        // 基本属性列表
        let results = yield call(services.fetchStationModel, action.payload);
        yield updateState(put, { energyModels: results });
      },
      *fetchParent1Options(action, { call, put }) {
        const results = yield call(services.fetchParentOptions, action.payload);
        yield updateState(put, { parent1Options: results });
      },
      *fetchParent2Options(action, { call, put }) {
        const results = yield call(services.fetchParentOptions, action.payload);
        yield updateState(put, { parent2Options: results });
      },
      *fetchParent3Options(action, { call, put }) {
        const results = yield call(services.fetchParentOptions, action.payload);
        yield updateState(put, { parent3Options: results });
      },
      *fetchEnergyUnitForDevice(action, { select, put, call }) {
        let { stationId } = action.payload;
        let options = yield call(enumsApi, {
          resource: "energyUnits",
          stationId,
          property: "energyUnitType",
        });
        options = options.map((item) => {
          return {
            ...item,
            energyUnitTypeId: item.energyUnitType ? item.energyUnitType.id : "",
          };
        });
        options.push({ name: '并网单元', value: 'null' })
        yield updateState(put, {
          energyUnitOptions: options,
        });
      },
      *fetchEnergyUnitTree(action, { select, put }) {
        let { stationId } = action.payload;
        const data = yield services.getEnergyUnitTree({ stationId, needCell: false });
        yield updateState(put, { treeList: [data] });
      },
      // 能量单元详情/附属单元详情
      *fetchEnergyUnitDetail(action, { select, put }) {
        const { id, stationTypeId } = action.payload;
        const detail = yield services.fetchEnergyUnitDetail({
          id,
          stationTypeId,
        });
        yield updateState(put, { detail: detail });
      },
      *addEnergyUnit(action, { select, put }) {
        let id = yield services.addEnergyUnit(action.payload);
        yield updateState(put, { newEnergyUnitId: id });
      },
      *updateEnergyUnit(action, { select, put }) {
        yield services.updateEnergyUnit(action.payload);
      },
      *deleteEnergyUnit(action, { select, put }) {
        const { id } = action.payload;
        yield services.deleteEnergyUnit({ id });
      },

      // device
      *fetchDeviceModel(action, { call, put }) {
        // 基本属性列表
        let results = yield call(services.fetchStationModel, action.payload);
        yield updateState(put, { deviceModels: results });
      },
      *fetchDeviceDetail(action, { select, put }) {
        const { deviceId } = action.payload;
        let detail = yield services.fetchDeviceDetail({ id: deviceId });
        if (!detail) {
          detail = {};
        }
        yield updateState(put, { detail: detail });
      },
      *fetchDeviceName(action, { call, put }) {
        let info = yield call(services.fetchDeviceName, action.payload)
        yield updateState(put, { newDeviceInfo: info || { title: '', serial: null } })
      },
      *fetchDeviceType(action, { select, put, call }) {
        const { energyUnitTypeId, energyUnitId } = action.payload;
        const data = yield call(enumsApi, {
          resource: "deviceTypes",
          energyUnitTypeId,
          property: "*",
          energyUnitId,
        });
        yield updateState(put, { deviceTypeList: data });
      },
      *addDevice(action, { select, put }) {
        let ids = yield services.addDevice(action.payload);
        yield updateState(put, { newDeviceId: ids[0] });
      },
      *updateDevice(action, { select, put }) {
        yield services.updateDevice(action.payload);
        // 暂时不走接口
        yield updateState(put, { detail: action.payload });
      },
      *batchUpdateDevice(
        { payload: { checkedKeys, device } },
        { select, put }
      ) {
        const { treeList } = yield select((state) => state[stationUpdateNS]);
        // // 找到第一个单体电池，全选的时候需要取第二个
        // let type = findTreeItem(
        //   treeList,
        //   (item) => identity(item) == checkedKeys[0]
        // )?.type;
        // console.log('treeList', treeList)
        // checkedKeys = checkedKeys.filter(key => findTreeItem(
        //   treeList,
        //   (item) => identity(item) == key
        // )?.type === Tree_Type.singleBattery)
        // console.log('checkedKeys', checkedKeys)
        yield services.batchUpdateDevice({ idList: checkedKeys, device });
      },
      *deleteDevice(action, { select, put, call }) {
        const { deviceId } = action.payload;
        yield call(services.deleteDevice, { id: deviceId });
      },
      *verifySnCode(action, { select, put, call }) {
        const { name } = action.payload;
        const result = yield call(services.verifySnCode, { name });
        return {
          result: !!result?.results,
          errorMsg: result?.errorMsg,
        };
      },
      *getSpotCurve(action, { select, put, call }) {
        let { spotCurve } = yield select((state) => state.stationMonitor);
        const result = yield call(services.getSpotCurve, {
          id: action.payload.id,
        });
        spotCurve = formatChartData(spotCurve, result, ["spotPrices"]);
        spotCurve = sortChartData(spotCurve);
        yield updateState(put, { spotCurve: spotCurve });
      },
      *fetchRealTime(action, { select, put, call }) {
        const result = yield call(services.fetchRealTime, {
          timeZoneId: "Australia/Queensland",
        });
        yield updateState(put, { realTime: result });
      },

      // -------------------------新版电价的相关接口-----------------------------
      // 获取相关枚举接口
      *getPriceMap(action, { select, put, call, all }) {

        // let {
        //   results: generateSpotPriceList,
        // } = yield call(services.getSpotList, { type: "Generation" });
        // let { results: costPriceList } = yield call(services.fetchUsePriceList);
        // let { results: costSpotPriceList } = yield call(services.getSpotList, {
        //   type: "Cost",
        // });
        // yield updateState(put, { costPriceList, costSpotPriceList });

        const [
          realTimePriceMap_Generate,
          realTimePriceMap_Cost,
          priceObjMap,
          priceRate,
        ] = yield all([
          services.getSpotList({
            type: "Generation",
          }),
          services.getSpotList({
            type: "Cost",
          }),
          services.realTimePriceMap({ resource: "dealers" }),
          services.realTimePriceMap({ resource: "priceRate" }),
        ]);

        yield updateState(put, {
          realTimePriceMap_Generate: getMap(realTimePriceMap_Generate?.results, "title", "id"),
          realTimePriceMap_Cost: getMap(realTimePriceMap_Cost?.results, "title", "id"),
          priceObjMap: getMap(priceObjMap),
          multipleTypeMap: getMap(priceRate),
        });
      },

      // // 根据电价id查询实时电价
      // *getAllPriceList(action, { call, put }) {
      //   let { results: generatePriceList } = yield call(
      //     services.fetchPriceGenerateList
      //   );
      //   let {
      //     results: generateSpotPriceList,
      //   } = yield call(services.getSpotList, { type: "Generation" });
      //   let { results: costPriceList } = yield call(services.fetchUsePriceList);
      //   let { results: costSpotPriceList } = yield call(services.getSpotList, {
      //     type: "Cost",
      //   });
      //   yield updateState(put, { costPriceList, costSpotPriceList });
      //   yield updateState(put, { generatePriceList, generateSpotPriceList });
      // },

      // 获取当前、计划的执行电价
      *getPrice(action, { select, put, call, all }) {
        const { isFuture, stationId, energyUnitId, modalType, needStationPrice } = action.payload;
        // console.log('stationId', stationId)
        // 查售电和购电
        // const [realTimePriceMap_Generate, realTimePriceMap_Cost] = yield all([
        //   services.getPricePool({ isFuture, stationId, type: "Generation" }),
        //   services.getPricePool({ isFuture, stationId, type: "Cost" })
        // ])

        // if(modalType === 'cost'){
        //   services.getPricePool({ isFuture, stationId, type: "Cost" })
        // }else{
        //   services.getPricePool({ isFuture, stationId, type: "Cost" })
        // }

        if (modalType === 'all') {
          yield updateState(put, { text_Cost: null, text_Generate: null, price_Generate: {}, price_Cost: {} });
          // updateState(put, { text_Cost: null, text_Generate: null });
          const [realTimePriceMap_Generate, realTimePriceMap_Cost] = yield all([
            stationId ? services.getPricePool({ isFuture, stationId, energyUnitId, type: "Generation" }) : services.getPricePool({ isFuture, energyUnitId, type: "Generation" }),
            stationId ? services.getPricePool({ isFuture, stationId, energyUnitId, type: "Cost" }) : services.getPricePool({ isFuture, energyUnitId, type: "Cost" })
          ])
          // console.log(realTimePriceMap_Generate, realTimePriceMap_Cost)
          yield updateState(put, { text_Cost: realTimePriceMap_Cost.title, text_Generate: realTimePriceMap_Generate.title, price_Generate: realTimePriceMap_Generate, price_Cost: realTimePriceMap_Cost });
          return false
        } else {
          const realTimePriceMap = stationId ? yield services.getPricePool({ isFuture, stationId, type: modalType === 'cost' ? "Cost" : "Generation" }) : yield services.getPricePool({ isFuture, energyUnitId, type: modalType === 'cost' ? "Cost" : "Generation" })
          // console.log('realTimePriceMap', realTimePriceMap)
          const result = {
            effectiveDate: realTimePriceMap?.effectiveDate, // 生效时间
            failureDate: realTimePriceMap?.failureDate,
            title: realTimePriceMap?.title,
            reusedStationPrice: realTimePriceMap?.reusedStationPrice ? 1 : 0,
            ...(
              modalType === 'cost' ? {
                cost: formatPrice(realTimePriceMap)
              } : {
                generate: formatPrice(realTimePriceMap)
              }
            )
          }

          if (needStationPrice) yield updateState(put, { stationPrice: result });
          else {
            if (isFuture) {
              yield updateState(put, { planPrice: result });
            } else {
              yield updateState(put, { nowPrice: result });
            }
          }
          return JSON.stringify(realTimePriceMap) === '{}'
        }


        // const realTimePriceMap = yield services.getPricePool({ isFuture, stationId, type: modalType === 'cost' ? "Cost" : "Generation" })

        // const result = {
        //   effectiveDate: realTimePriceMap?.effectiveDate, // 生效时间
        //   failureDate: realTimePriceMap?.failureDate,
        //   title: realTimePriceMap?.title,
        //   reusedStationPrice: realTimePriceMap?.reusedStationPrice ? 1 : 0,
        //   ...(
        //     modalType === 'cost' ? {
        //       cost: formatPrice(realTimePriceMap)
        //     } : {
        //       generate: formatPrice(realTimePriceMap)
        //     }
        //   )
        // }

        // 单个售电或者购电对象
        //     const result = {
        //       "effectiveDate": "2020-09-01 00:00:00", // 生效时间
        //       "failureDate": "2020-09-02 00:00:00", // 失效时间
        //       "rangeType": 0, // 0： 全电站 1：能量单元
        //       "electricityPriceDetails": [
        //            {
        //              "energyUnits": [1,2,3], // 发电单元id(可传可不传),
        //               "dealers": [{
        //                 "id": [233], // 233: 电网，322：非电网，
        //                 "type": "Multiple", // 实时，单费率，复费率 - RealTime, Single, Multiple
        //                 "multipleType": [0], // 0：尖峰，1: 高峰 2: 平段 3：低谷
        //                 "multipleObj": { // key 值代表类型的id
        //                   "0": {
        //                       "price":500, // 价格，
        //                       "timeRange": ["00:00-08:00","20:00-00:00"],
        //                   },
        //                 },
        //               },{
        //                 "id": [322], // 233: 电网，322：非电网，
        //                 "type": "Single", // 实时，单费率，复费率 - RealTime, Single, Multiple
        //                 "price": 500, // 价格
        //               },{
        //                 "id": [322], // 233: 电网，322：非电网，
        //                 "type": "RealTime", // 实时，单费率，复费率 - RealTime, Single, Multiple
        //                 "price": "类型", // 价格
        //               }],

        //            }
        //       ]
        //  }

        // const result = {
        //   "effectiveDate": "2020-09-01 00:00:00", // 生效时间
        //   "failureDate": "2020-09-02 00:00:00", // 失效时间
        //   "generate": formatPrice({ // 售电
        //     "rangeType": 1, // 0： 全电站 1：能量单元
        //     "electricityPriceDetails": [
        //       {
        //         "energyUnits": [522203], // 发电单元id(可传可不传),
        //         "dealers": [{
        //           "id": [233], // 233: 电网，322：非电网，
        //           "type": "Multiple", // 实时，单费率，复费率 - RealTime, Single, Multiple
        //           // "multipleType": [0,1], // 0：尖峰，1: 高峰 2: 平段 3：低谷
        //           "priceType": [0,1],
        //           // initialValue={Object.keys(this.getValueByName(price)?.[index]?.dealers?.[dIndex]?.priceDetails || {}).map(key => parseInt(key))}
        //           "priceDetails": { // key 值代表类型的id
        //             "0": {
        //               "price": parseInt(Math.random() * 500), // 价格，
        //               "timeRange": ["00:00-08:00", "20:00-00:00"],
        //             },
        //             "1": {
        //               "price": parseInt(Math.random() * 500), // 价格，
        //               "timeRange": ["00:00-08:00", "20:00-00:00"],
        //             },
        //           },
        //         }, {
        //           "id": [322], // 233: 电网，322：非电网，
        //           "type": "Single", // 实时，单费率，复费率 - RealTime, Single, Multiple
        //           "price": 500, // 价格
        //         }],
        //       }
        //     ]
        //   }),
        //   "cost": formatPrice({ // 购电
        //     "rangeType": 1, // 0： 全电站 1：能量单元
        //     "electricityPriceDetails": [
        //       {
        //         "energyUnits": [522203], // 发电单元id(可传可不传),
        //         "dealers": [{
        //           "id": [233], // 233: 电网，322：非电网，
        //           "type": "Multiple", // 实时，单费率，复费率 - RealTime, Single, Multiple
        //           // "multipleType": [2,3], // 0：尖峰，1: 高峰 2: 平段 3：低谷
        //           "priceType": [2,3],
        //           "priceDetails": { // key 值代表类型的id
        //             "2": {
        //               "price": 400, // 价格，
        //               "timeRange": ["00:00-08:00", "20:00-00:00"],
        //             },
        //             "3": {
        //               "price": 100, // 价格，
        //               "timeRange": ["00:00-08:00", "20:00-00:00"],
        //             },
        //           },
        //         }, {
        //           "id": [322], // 233: 电网，322：非电网，
        //           "type": "RealTime", // 实时，单费率，复费率 - RealTime, Single, Multiple
        //           "realTimePrice": 283872, // 价格
        //         }],
        //       }
        //     ]
        //   })
        // }

        // console.log('result', result)

        // if (isFuture) {
        //   yield updateState(put, { planPrice: result });
        // } else {
        //   yield updateState(put, { nowPrice: result });
        // }

      },

      // 新增计划的执行电价
      *addPrice(action, { select, put, call, all }) {
        const { stationId, data, modalType, energyUnitId } = action.payload;
        const generateData = reFormatPrice(data)
        // const [realTimePriceMap_Generate, realTimePriceMap_Cost] = yield all([
        //   generateData.generate ? services.addPricePool({ data: generateData.generate, stationId, type: "Generation" }) : undefined,

        // ])
        if (modalType === 'cost') {
          generateData.cost ? yield services.addPricePool({ data: generateData.cost, stationId, type: "Cost", energyUnitId, reusedStationPrice: !!generateData.cost.reusedStationPrice }) : undefined
        } else {
          generateData.generate ? yield services.addPricePool({ data: generateData.generate, stationId, type: "Generation", energyUnitId, reusedStationPrice: !!generateData.generate.reusedStationPrice }) : undefined
        }


        yield put({ type: `${stationUpdateNS}/getPrice`, payload: { isFuture: true, stationId, modalType, energyUnitId } })

        message.success(utils.intl('保存成功'))

        return;

      },

      // 编辑计划的执行电价
      *editPrice(action, { select, put, call, all }) {
        const { stationId, data, modalType, energyUnitId } = action.payload;
        const { planPrice } = yield select((state) => state[stationUpdateNS]);
        const generateData = reFormatPrice(data)
        // console.log('planPrice', planPrice)
        // const [realTimePriceMap_Generate, realTimePriceMap_Cost] = yield all([
        //   generateData.generate ? planPrice?.generate?.id ? services.editPricePool({ data: generateData.generate, id: planPrice?.generate?.id }) : services.addPricePool({ data: generateData.generate, stationId, type: "Generation" }) : undefined,
        //   generateData.cost ? planPrice?.cost?.id ? services.editPricePool({ data: generateData.cost, id: planPrice?.cost?.id }) : services.addPricePool({ data: generateData.cost, stationId, type: "Cost" }) : undefined
        // ])

        if (modalType === 'cost') {
          generateData.cost ? planPrice?.cost?.id ? yield services.editPricePool({ data: generateData.cost, id: planPrice?.cost?.id }) : yield services.addPricePool({ data: generateData.cost, stationId, type: "Cost", energyUnitId, reusedStationPrice: !!generateData.cost.reusedStationPrice }) : undefined
        } else {
          generateData.generate ? planPrice?.generate?.id ? yield services.editPricePool({ data: generateData.generate, id: planPrice?.generate?.id }) : yield services.addPricePool({ data: generateData.generate, stationId, type: "Generation", energyUnitId, reusedStationPrice: !!generateData.generate.reusedStationPrice }) : undefined
        }

        yield put({ type: `${stationUpdateNS}/getPrice`, payload: { isFuture: true, stationId, modalType, energyUnitId } })

        message.success(utils.intl('保存成功'));

        return;
      },

      // 删除计划的执行电价
      *removePrice(action, { select, put, call, all }) {
        const { stationId, energyUnitId, modalType } = action.payload;
        const { planPrice } = yield select((state) => state[stationUpdateNS]);

        const [realTimePriceMap_Generate, realTimePriceMap_Cost] = yield all([
          services.removePricePool({ id: planPrice?.generate?.id, energyUnitId }),
          services.removePricePool({ id: planPrice?.cost?.id, energyUnitId })
        ])

        yield put({ type: `${stationUpdateNS}/getPrice`, payload: { energyUnitId, isFuture: true, stationId, modalType } })

      },

      // 查询特定的能量单元
      *getEnergyUnits(action, { select, put, call, all }) {
        const { stationId } = action.payload;
        //TODO 后台接口的多能量单元的查询暂不支持
        const [energyUnits_Generate, energyUnits_Cost] = yield all([
          services.getEnergyUnits({
            activity: true,
            stationId,
            energyUnitTypeName: energyUnitTypeName_Generate.join()
          }),
          services.getEnergyUnits({
            activity: true,
            stationId,
            energyUnitTypeName: energyUnitTypeName_Cost.join()
          })
        ])
        yield updateState(put, { energyUnits_Generate: energyUnits_Generate.map(item => ({ ...item, label: item.name, id: item.value })), energyUnits_Cost: energyUnits_Cost.map(item => ({ ...item, label: item.name, id: item.value })) });
      },

      // 获取应用场景枚举
      *getScenariosList(action, { select, put, call, all }) {
        const scenariosList = yield call(services.getScenariosList);
        yield updateState(put, { scenariosList });
      },

      fetchList: [function* (action, { select, put }) {
        let data = yield services.fetchDataPointList(action.payload)
        yield updateState(put, { dataPointTotal: data.totalCount })
      }, { type: 'takeLatest' }],

      //采集设备
      * getList(action, { select, call, put }) {
        // const { record } = yield select(state => state.deviceModel)
        const { deviceId } = action.payload;
        const res = yield services.getBatchMaintenanceList({ deviceId })
        yield put({
          type: 'updateToView',
          payload: { list: res.results }
        })
      },
      * deleteRecord(action, { select, call, put }) {
        // const { record } = yield select(state => state.deviceModel)
        const { deviceId } = action.payload;
        yield services.deleteMaintenanceRecord(deviceId)
      },
      *postRecord(action, { select, call, put }) {
        yield services.postMaintenanceRecord({ ...action.payload });
      },
      *putRecord(action, { select, call, put }) {
        yield services.putMaintenanceRecord({ ...action.payload });
      },
      *updateState(action, { call, put }) {
        yield put({
          type: 'updateToView',
          payload: action.payload
        });
      },
      *getCollectDevicesByStation(action, { select, call, put }) {
        let res = yield services.getCollectDevices({ ...action.payload, type: "station" });
        yield put({
          type: 'updateToView',
          payload: { allCollectDevices: res.results }
        })
      },
      *getCollectDevicesByDevices(action, { select, call, put }) {
        let res = yield services.getCollectDevices({ ...action.payload, type: "devices" });
        yield put({
          type: 'updateToView',
          payload: { bindCollectDevices: res.results }
        })
      },
      *postCollectDevices(action, { select, call, put }) {
        const { id, controlDeviceIds } = action.payload;
        yield services.postCollectDevices({ controlDeviceIds, id });
      },

      *getStationStatusOperationMap(param, { put, call }) {
        let data = yield call(services.stationStatusOperationMap, {})
        data = data || []
        const stationStatusMap: any = {}
        data.forEach(item => {
          stationStatusMap[item.id] = { ...item }
          stationStatusMap[item.id].options = (item.next || [])
            .map(id => {
              const match = data.find(target => target.id === id)
              return { name: match.title, value: id }
            })
          stationStatusMap[item.id].options.unshift({ name: item.title, value: item.id })
        })
        yield updateState(put, { stationStatusMap })
      },
      *getEnergyUnitStatusOperationMap(param, { put, call }) {
        let data = yield call(services.energyUnitStatusOperationMap, {})
        data = data || []
        const energyUnitStatusMap: any = {}
        data.forEach(item => {
          energyUnitStatusMap[item.id] = { ...item }
          energyUnitStatusMap[item.id].options = (item.next || [])
            .map(id => {
              const match = data.find(target => target.id === id)
              return { name: match.title, value: id }
            })
          energyUnitStatusMap[item.id].options.unshift({ name: item.title, value: item.id })
        })
        yield updateState(put, { energyUnitStatusMap })
      },
      // 运营商下拉枚举项
      *fetchOperatorList(action, { select, put, call }) {
        let types = yield call(enumsApi, {
          resource: "firmTypes",
          property: "name",
        });
        let matchValue = types.find(o => o.name === "Operator").value
        let res = yield call(enumsApi, {
          resource: "firms",
          activity: true,
          firmTypeIds: matchValue,
        });
        yield updateState(put, {
          operatorList: res,
        });
      },
      //获取调试记录
      *getDeviceDebug(action, { select, put, call }) {
        const { deviceId } = action.payload;
        let res = yield call(services.getDeviceDebug, { deviceId })
        yield put({
          type: 'updateToView',
          payload: { debugLogs: res }
        })
      },
      //获取调试记录
      *exportDeviceDebug(action, { select, put, call }) {
        const { deviceId, columns } = action.payload;
        let res = yield call(services.getDeviceDebug, { deviceId })
        exportFile(columns, res)
      },
    };
  }
);
