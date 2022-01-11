/**
 * 规则配置的新增编辑页面
 */
import React, { Component } from 'react'
import { AlarmState } from 'umi'
import { Button, Select, Input, Radio, InputNumber, Modal, Table2, Table1, Tooltip, message, AutoComplete } from 'wanke-gui'
import { Form, Switch } from 'antd'
import Page from '../../../components/Page'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import PageProps from '../../../interfaces/PageProps'
import { GlobalState } from '../../../models/global'
import { alarm_config, crumbsNS, globalNS } from '../../constants'
import utils from '../../terminal-station-monitor/utils'
import { makeConnect } from '../../umi.helper'
import "./index.less"
import { CloseOutlined, GfDeleteOutlined, PlusOutlined, QuestionCircleOutlined } from 'wanke-icon'
import AlarmRulesViewPage from './AlarmRulesViewPage'
import createServices from '../../../util/createServices'
import CustomCascader from '../component/CustomCascader'
import DeviceTypeDataItem from './DeviceTypeDataItem'
import _ from 'lodash'
import PointDataModal, { DeviceItem } from './point-data-modal/PointDataModal'
import RichText from '../component/RichText'

const FormItem = Form.Item
const { TextArea, Search } = Input
const RadioGroup = Radio.Group

interface Props extends PageProps, GlobalState, MakeConnectProps<AlarmState>, AlarmState {
  type: 'new' | 'edit' | 'view',
  tabKey: 'station' | 'device',
  searchObj: any,
  loadTreeLoading: boolean,
  deviceTypeTableLoading: boolean,
  record?: any,
  roleName: string
}
interface State {
  type: 'new' | 'edit' | 'view',
  switchChecked: boolean,
  visible: boolean
  dataSource: any[]
  page: number,
  size: number,
  total: number,
  searchValue: any,
  selectedRowKeys: string[],
  modalType: 'rule' | 'dataItem', // 规则 | 数据项 
  alarmTypeIndex: number,
  alarmRulesIndex: number,
  dataItemRowKeys: string[],
  showTableData: boolean,
  record?: any;
  alarmScope: "station" | "deviceType" | "device"
  alarmCalcType?: any,
  durationRtime: any
  deviceTreeKey: string | number
  // 数据项（deviceType）
  nowDeviceType: any;
  selectedKeysMap: any;
  editForm: any;
  // 数据项（device|station）
  dataItemId: number;
  formulaHTML: any;
  formulaError: any;
  formulaIds: string[]
}

class AlarmRulesEditPage extends Component<Props, State> {
  deviceType = null;
  state = {
    type: this.props.type,
    switchChecked: true,
    visible: false,
    dataSource: [],
    page: 1,
    size: 20,
    total: 0,
    searchValue: {},
    selectedRowKeys: [],
    modalType: 'rule',
    alarmTypeIndex: 0,
    alarmRulesIndex: 0,
    dataItemRowKeys: [],
    showTableData: false,
    record: undefined,
    alarmScope: "station",
    alarmCalcType: {},
    durationRtime: {},
    deviceTreeKey: null,
    nowDeviceType: null,
    selectedKeysMap: {},
    editForm: {},
    dataItemId: null,
    formulaHTML: {},
    formulaError: {},
    formulaIds: []
  }

  formBox: any
  formulaRef: any = {};

  componentDidMount() {
    // console.log('this.props.record', this.props.record)
    this.setState({
      type: this.props.type,
      alarmScope: this.props.record?.alarmScope?.name ?? 'station',
      switchChecked: this.props.record ? !(this.props.tabKey === 'station' ? this.props.record.stations : this.props.record.devices) : true,
      record: this.props.record,
      dataItemId: this.props.record?.alarmScope?.name === 'station' ? this.props.record?.alarmObject?.stationIds?.[0] : this.props.record?.alarmObject?.deviceIds?.[0],
      dataSource: this.props.pointDataTypesList,
      alarmCalcType: this.props.record?.alarmCalcType?.id ? { '0-0': this.props.record?.alarmCalcType?.id } : {}
    })

    this.props.dispatch({ type: `${alarm_config}/updateState`, payload: { pointDataTypesList: [] } })
    // const stationTypeId = this.props.stationList?.[0]?.stationType?.id
    // if (this.props.tabKey === 'station' && stationTypeId) {
    //   this.props.dispatch({
    //     type: `${alarm_config}/getPointDataTypes`,
    //     payload: {
    //       stationTypeId
    //     }
    //   })
    // }

    if (this.props.record) {
      // this.deviceType = this.deviceType ?? this.props.record?.deviceType?.id;
      this.handleChangeDeviceType(this.props.record?.deviceType?.id) // 设备和数据项
      this.setState({
        dataItemRowKeys: (this.props.record.relatedPointDataTypes || []).map(item => item.id),
        alarmScope: this.props.record?.alarmScope?.name ?? 'station',
      })
      if (this.props.tabKey === 'station') {
        this.setState({ switchChecked: !!this.props.record.isAllStation })
      } else {
        this.setState({ switchChecked: !!this.props.record.isAllDevice })
      }
      this.props.dispatch({
        type: `${alarm_config}/getStationList`,
        payload: {
          firmId: this.props.record.firmId
        }
      })

      // if(this.props.record.alarmScope?.name === 'device'){
      //   this.props.dispatch({
      //     type: `${alarm_config}/getDeviceTypeTreeChildren`,
      //     payload: {
      //       deviceTypeName: this.props.record.alarmObject?.deviceTypeName,
      //       firmId: this.props.record?.firmId
      //     }
      //   })
      // }

    } else {
      this.props.dispatch({
        type: `${alarm_config}/getStationList`,
      })



    }
  }

  componentDidUpdate(preProps, perState) {
    if (!_.isEqual(this.props.pointDataTypesList, preProps.pointDataTypesList)) {
      this.getReceiverList()
      this.setState({ dataSource: this.props.pointDataTypesList })
    }
    if (this.state.visible !== perState.visible) {
      if (this.state.visible) {
        setTimeout(() => {
          this.setState({ showTableData: true })
        }, 300)
      } else {
        this.setState({ showTableData: false })
      }
    }

    if (this.state.type !== perState.type && this.state.type === 'edit' && this.props.record) {
      // console.log('this.props.record?.deviceType?.id', this.props.record)
      // this.handleChangeDeviceType(this.deviceType ?? this.props.record?.deviceType?.id)
      this.setState({ 
        dataItemRowKeys: (this.props.record.relatedPointDataTypes || []).map(item => item.id),
        alarmScope: this.props.record?.alarmScope?.name ?? 'station' 
      }, () => {
        this.formBox.setFieldsValue(this.changeToFormData(this.state.record));
      })
      
      // this.setState({ editForm: this.state.type === 'edit' ? this.changeToFormData(this.props.record) : null })
    }

    if (!_.isEqual(this.state.record, perState.record) && this.state.record) {
      const deviceType = this.props.alarmRulesEnums.deviceTypes?.find(item => item.name === this.state.record.alarmObject?.deviceTypeName)?.id;
      if (deviceType) {
        this.props.dispatch({
          type: `${alarm_config}/getDeviceList`,
          payload: {
            deviceTypeId: deviceType,
            firmId: this.props.record?.firmId
          }
        })

        // 关联数据项
        this.props.dispatch({
          type: `${alarm_config}/getPointDataTypes`,
          payload: {
            deviceTypeId: deviceType
          }
        })
      }
    }
  }

  // 取消
  cancel = () => {
    const { alarmRulesEnums } = this.props
    const { deviceTypes } = alarmRulesEnums
    const { type } = this.state
    if (type === 'new') { // 新增
      this.props.dispatch({
        type: `${crumbsNS}/updateCrumbs`,
        payload: {
          type: 'back', count: 1
        }
      })
    } else { // 编辑 --> 切换为查看 deviceTypes
      // console.log('this.props.record', this.props.record?.alarmObject)
      if(this.props.record?.alarmObject?.deviceTypeName){
        this.handleChangeDeviceType(deviceTypes.find(item => item.name === this.props.record?.alarmObject?.deviceTypeName)?.id);
      }
      this.setState({ type: "view" })
    }
  }

  // 返回
  calBack = () => {
    this.props.dispatch({
      type: `${crumbsNS}/updateCrumbs`,
      payload: {
        type: 'back', count: 1
      }
    })
  }

  // 切换编辑
  changeEdit = () => {
    this.setState({ type: "edit" })
  }

  // 保存异常规则
  saveAlarmRules = () => {
    const { alarmRulesEnums, tabKey, searchObj } = this.props
    const { type, searchValue, alarmCalcType, durationRtime, formulaError } = this.state
    // const alarmScopeId = (alarmRulesEnums?.alarmScopes || []).find(item => item.name === tabKey)?.id
    // console.log('body', this.changeToServerData(this.formBox.getFieldsValue))

    this.formBox.validateFields().then(value => {
      const obj = alarmRulesEnums?.alarmCalcTypes?.find(item => item.id === alarmCalcType);
      if(value.alarmTypes.find(item => !item.alarmRules?.length)){
        message.error(utils.intl('规则为空无法保存'));
        return
      }if (obj?.name !== 'realtime' && durationRtime === null) {
        message.error(utils.intl('请输入持续时间'))
        // return
      } else if (!Object.values(formulaError).find(v => !!v)) {
        const body = this.changeToServerData(value)
        // console.log('body', body)
        if (type === 'new') { // 新增
          this.props.dispatch({
            type: `${alarm_config}/postAlarmRules`,
            payload: {
              body,
              searchObj: { ...searchObj }
            }
          }).then((errorCode) => {
            if (errorCode === 0) {
              message.success(utils.intl('保存成功'))
              this.calBack()
            }
          })
        } else {
          const { record } = this.state
          this.props.dispatch({
            type: `${alarm_config}/putAlarmRules`,
            payload: {
              id: record.id,
              body: { ...record, ...body[0] },
              searchObj: { ...searchObj }
            }
          }).then(({ errorCode, record }) => {
            // console.log('record', record)
            if (errorCode === 0) {
              message.success(utils.intl('保存成功'))
              this.setState({ record, type: "view" }) // 回退到查看
            }
          })
        }
      }
    })
  }

  // 前端分页
  getReceiverList = (page?: number = 1, size?: number = 20, searchValue?) => {
    const { pointDataTypesList } = this.props
    // const { dataSource } = this.state
    // const dataSourceIds = dataSource.map(item => item.id)
    // // 过滤出已经在收件人列表里的数据
    const receiverAllList = pointDataTypesList.filter(item => {
      if (searchValue && searchValue !== '') {
        return (item.title || '').indexOf(searchValue) > -1
          ||
          (item.symbol || '').indexOf(searchValue) > -1
          ||
          (item.unit?.title || '').indexOf(searchValue) > -1
      }
      return true
    })
    // console.log('dataSource', searchValue, receiverAllList, pointDataTypesList)
    this.setState({ dataSource: receiverAllList, page, size, total: receiverAllList.length })
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  openModal = (modalType, { alarmTypeIndex, alarmRulesIndex }) => {
    const { dataItemRowKeys, alarmScope, record } = this.state
    const { alarmRulesEnums, dispatch } = this.props
    const { deviceTypes } = alarmRulesEnums

    const newSelectedKeysMap = {};
    for (let i = 0; i < (record?.relatedPointDataTypeIds ?? []).length; i++) {
      newSelectedKeysMap[record?.relatedPointDataTypeIds[i]] = record?.relatedPointDataTypeTitles?.[i];
    }
    if (alarmScope === 'deviceType') { // 设备类型
      const deviceTypeId = this.formBox.getFieldValue('deviceType');
      if (!deviceTypeId) {
        message.error(utils.intl('请选择设备类型后再选择数据项'));
        return
      }
      const deviceType = deviceTypes.find(item => item.id === deviceTypeId); // 当前设备类型对象
      // 根据设备类型查询端子
      dispatch({ type: `${alarm_config}/getTerminalsByDeviceTypeId`, payload: { deviceTypeId: deviceType?.id } })
        .then(terminalList => {
          // 获得数据点号枚举
          dispatch({ type: `${alarm_config}/updateState`, payload: { pointDataTypeList: [], allPointDataTypeList: {} } });
          dispatch({ type: `${alarm_config}/getPointDataTypesByTerminals`, payload: { deviceTypeId: deviceType?.id, queryStr: null, terminal: terminalList[0]?.name ?? 'default' } });
          this.setState({
            visible: true,
            nowDeviceType: deviceType,
            searchValue: null,
            modalType,
            alarmTypeIndex,
            alarmRulesIndex,
            // selectedKeysMap: modalType === 'rule' ? {} : {
            //   [`${alarmTypeIndex}-${alarmRulesIndex}`]: newSelectedKeysMap
            // }
          })

          // console.log('111', {
          //   [`${alarmTypeIndex}-${alarmRulesIndex}`]: (record?.relatedPointDataTypeIds ?? []).map((id, index) => ({ [id]: record?.relatedPointDataTypeTitles?.[index] }))
          // })
        })

    } else { // 电站或者
      const stationId = this.formBox.getFieldValue('stations');
      const deviceId = this.formBox.getFieldValue('device');
      if (alarmScope === 'station' && !stationId) {
        message.error(utils.intl('请选择电站后再选择数据项'));
        return
      }
      if (alarmScope === 'device' && !deviceId) {
        message.error(utils.intl('请选择设备后再选择数据项'));
        return
      }

      this.props.updateState({ pointDataModalVisible: true })
      this.setState({
        dataItemId: alarmScope === 'station' ? stationId : Number(deviceId.split('-')[1]),
        modalType,
        alarmTypeIndex,
        alarmRulesIndex,
        // selectedKeysMap: modalType === 'rule' ? {} : {
        //   [`${alarmTypeIndex}-${alarmRulesIndex}`]: newSelectedKeysMap
        // }
      });
    }

    // if (record) {
    //   this.setState({ visible: true, searchValue: null, modalType, alarmTypeIndex, alarmRulesIndex, selectedRowKeys: modalType === 'rule' ? [] : (record.relatedPointDataTypes || []).map(item => item.id) })
    // } else {
    //   this.setState({ visible: true, searchValue: null, modalType, alarmTypeIndex, alarmRulesIndex, selectedRowKeys: modalType === 'rule' ? [] : dataItemRowKeys })
    // }

    // this.getReceiverList()
  }

  // 添加数据项
  addDataItem = (param) => {
    const { alarmScope, modalType, alarmTypeIndex, alarmRulesIndex } = this.state;
    const { getFieldsValue, setFieldsValue } = this.formBox;
    const formValue = _.cloneDeep(getFieldsValue());
    // console.log('param', param)
    if (alarmScope === 'deviceType') { // 设备类型
      if (modalType === 'rule') { // 规则
        // const titles = Object.values(param).map(text => `var(${text})`);
        // const originText = formValue["alarmTypes"].[alarmTypeIndex].['alarmRules'].[alarmRulesIndex].formula || '';
        // formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].formula = `${originText}${titles.join('')}`;
        if((this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML || '').substr(0,6) !== '&nbsp;'){
          this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML = '&nbsp;' + (this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML || '')
          + Object.keys(param).map(key => `<span value="${key}" contenteditable="false" class="view-box">${param[key]}</span>`).join('');
        }else{
          this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML = (this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML || '')
          + Object.keys(param).map(key => `<span value="${key}" contenteditable="false" class="view-box">${param[key]}</span>`).join('');
        }
        

        this.setState({
          formulaIds: [...this.state.formulaIds, ...Object.keys(param)]
        })
      } else { // 关联数据项
        this.setState({
          selectedKeysMap: {
            ...(this.state.selectedKeysMap),
            [`${alarmTypeIndex}-${alarmRulesIndex}`]: { ...(this.state.selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] ?? {}), ...param }
          }
        });
        formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].relatedPointDataTypes = Object.keys(param);
      }
    } else { // 电站、设备
      const newParam = param.reduce((pre, item) => {
        const { deviceId, measureId, pointId, deviceTitle, measureTitle, pointTitle } = item
        if (measureId) {
          return { ...pre, [`${deviceId}:${measureId}:${pointId}`]: `${deviceTitle}:${measureTitle}:${pointTitle}` }
        }
        return { ...pre, [`${deviceId}:${pointId}`]: `${deviceTitle}:${pointTitle}` }
      }, {})

      if (modalType === 'rule') { // 规则
        // const titles = Object.values(newParam).map(text => `${text.split(':')?.length === 2 ? 'param' : 'var'}(${text})`);
        // const originText = formValue["alarmTypes"].[alarmTypeIndex].['alarmRules'].[alarmRulesIndex].formula || '';
        // formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].formula = `${originText}${titles.join('')}`;

        if((this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML || '').substr(0,6) !== '&nbsp;'){
          this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML = '&nbsp;' + (this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML || '')
          + Object.keys(newParam).map(key => `<span value="${key}" contenteditable="false" class="view-box">${newParam[key]}</span>`).join('')
        }else{
          this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML = (this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML || '')
          + Object.keys(newParam).map(key => `<span value="${key}" contenteditable="false" class="view-box">${newParam[key]}</span>`).join('')
        }

        this.setState({
          formulaIds: [...this.state.formulaIds, ...Object.keys(newParam)]
        })

      } else { // 关联数据项
        this.setState({
          selectedKeysMap: {
            ...(this.state.selectedKeysMap),
            [`${alarmTypeIndex}-${alarmRulesIndex}`]: { ...(this.state.selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] ?? {}), ...newParam }
          }
        });
        formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].relatedPointDataTypes = Object.keys(newParam);
      }
    }
    // const { alarmTypeIndex, alarmRulesIndex, modalType, selectedRowKeys } = this.state
    // const { getFieldsValue, setFieldsValue } = this.formBox
    // const formValue = _.cloneDeep(getFieldsValue());

    // if (modalType === 'rule') { // 规则
    //   const titles = pointDataTypesList.filter(item => selectedRowKeys.indexOf(item.id) > -1).map(item => `var(${item.title})`)
    //   const originText = formValue["alarmTypes"].[alarmTypeIndex].['alarmRules'].[alarmRulesIndex].formula || ''
    //   formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].formula = `${originText}${titles.join()}`
    // } else { // 关联数据项
    //   this.setState({ dataItemRowKeys: selectedRowKeys })
    //   formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].relatedPointDataTypes = selectedRowKeys
    // }

    setFieldsValue(formValue)
    this.setState({ visible: false })
    this.props.updateState({ pointDataModalVisible: false })
  }

  addText = (text, { alarmTypeIndex, alarmRulesIndex }) => {
    const { getFieldsValue, setFieldsValue } = this.formBox
    const formValue = _.cloneDeep(getFieldsValue());
    const originText = formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].formula || ''
    formValue["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].formula = `${originText}${text}()`
    setFieldsValue(formValue)
  }

  handleChangeDeviceType = (deviceType) => {
    // console.log('deviceType', deviceType)
    if (deviceType) {
      this.props.dispatch({
        type: `${alarm_config}/getDeviceList`,
        payload: {
          deviceTypeId: deviceType,
          firmId: this.props.record?.firmId
        }
      })

      // 关联数据项
      this.props.dispatch({
        type: `${alarm_config}/getPointDataTypes`,
        payload: {
          deviceTypeId: deviceType
        }
      })
    }
    // else{
    //   this.props.dispatch({ type: `${alarm_config}/updateState`, payload: { pointDataTypesList: [] } })
    // }

    if (this.formBox) {
      const { setFieldsValue } = this.formBox
      const { switchChecked } = this.state
      if (!switchChecked) {
        setFieldsValue({ devices: [] })
      }
    }

    this.setState({ selectedKeysMap: {} })

  }

  // 转换成服务器的数据格式
  changeToServerData = (value) => {
    const { alarmRulesEnums, deviceList } = this.props
    const { switchChecked, alarmScope: stateAlarmScope, durationRtime, alarmCalcType, selectedKeysMap } = this.state
    const { alarmTypes, alarmScope } = value
    const results = [];
    const stationTypeId = this.props.stationList?.[0]?.stationType?.id;
    const { deviceTypes } = alarmRulesEnums;
    (alarmTypes || []).forEach((item, alarmTypeIndex) => {
      const { alarmRules, id } = item;
      (alarmRules || []).forEach((aItem, alarmRulesIndex) => {
        const { text, ids, titles } = this.formulaToService(this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`].innerHTML)
        const result: any = {}
        result.alarmType = id;
        result.alarmScope = { id: alarmScope };
        result.alarmLevel = { id: aItem.alarmLevel };
        result.alarmCalcType = { id: aItem.alarmCalcType };
        result.desc = aItem.desc;
        result.formula = text;
        result.relatedPointDataTypeIds = Object.keys(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] ?? {});
        result.relatedPointDataTypeTitles = Object.values(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] ?? {});
        result.durationRtime = durationRtime[`${alarmTypeIndex}-${alarmRulesIndex}`] ? Math.min(durationRtime[`${alarmTypeIndex}-${alarmRulesIndex}`] * 1000 * 60, 99999 * 1000 * 60) : durationRtime[`${alarmTypeIndex}-${alarmRulesIndex}`]
        result.pointDataTypeIds = ids.filter(i => i.split(':').length === 3);
        result.pointDataTypeTitles = titles.filter(i => i.split(':').length === 3);
        result.paramIds = ids.filter(i => i.split(':').length === 2);
        result.paramTitles = titles.filter(i => i.split(':').length === 2);
        if (stateAlarmScope === 'station') {
          // result.stations = value.stations && !switchChecked ? value.stations.map(id => ({ id })) : null;
          result.stationType = { id: stationTypeId } // 电站类型
          // result.isAllStation = switchChecked
          result.alarmObject = {
            stationIds: [value.stations]
          }
        } else if (stateAlarmScope === 'device') { // 设备
          const ids = value.device.split('-')
          result.alarmObject = {
            deviceTypeName: deviceTypes.find(item => item.id === Number(ids?.[0]))?.name,

            deviceIds: [Number(ids?.[1])]
          }
        } else { // 设备类型
          // const deviceIds = deviceList.filter(item => !(item.children?.length && value.devices.indexOf(item.value) > -1)).map(item => item.value)
          if (switchChecked) {
            result.alarmObject = {
              deviceTypeName: deviceTypes.find(item => item.id === value.deviceType)?.name,
              selectAll: switchChecked,
            }
          } else {
            const deviceIdMap = {};
            const stationIds = value.devices.filter(v => deviceList.find(d => d.value === v));  // deviceList.filter(item => item.children?.length && value.devices.indexOf(item.value) > -1).map(item => item.value)
            const notStations = value.devices.filter(id => stationIds.indexOf(id) < 0
              && deviceList.find(d => stationIds.indexOf(d.value) < 0 && d.children?.find(dc => dc.value === id)))
            for (let i = 0; i < notStations.length; i++) {
              const obj = deviceList.find(ii => ii.children?.find(c => c.value === notStations[i]));
              // console.log('obj', obj, deviceList, notStations)
              if (deviceIdMap[obj.value]) {
                deviceIdMap[obj.value].push(notStations[i]);
              } else {
                deviceIdMap[obj.value] = [notStations[i]];
              }
            }
            result.deviceType = { id: value.deviceType };
            // result.devices = value.devices && !switchChecked ? value.devices.map(id => ({ id })) : null
            // result.isAllDevice = switchChecked
            result.alarmObject = {
              deviceTypeName: deviceTypes.find(item => item.id === value.deviceType)?.name,
              selectAll: switchChecked,
              stationIds,
              deviceIdMap
            }
          }
        }
        results.push(result)
      })
    })

    return results
  }

  // 转换成前端需要的数据
  changeToFormData = (value) => {
    const { alarmRulesEnums } = this.props
    const { switchChecked, alarmScope: stateAlarmScope } = this.state
    const { deviceTypes } = alarmRulesEnums;
    const result: any = {}
    result.alarmScope = value.alarmScope?.id
    const relatedPointDataType = {};
    // console.log('`${alarmTypeIndex}-${alarmRulesIndex}`', this.formulaRef)
    for (let i = 0; i < value.relatedPointDataTypeIds?.length; i++) {
      relatedPointDataType[value.relatedPointDataTypeIds[i]] = value.relatedPointDataTypeTitles?.[i]
    }
    if (stateAlarmScope === 'station') {
      // result.stations = value.stations
      result.stations = value.alarmObject?.stationIds?.[0]
      this.setState({
        durationRtime: { '0-0': value.durationRtime ? Number((value.durationRtime / 60000).toFixed(2)) : null },
        selectedKeysMap: {
          '0-0': relatedPointDataType
        }
      })
    } else if (stateAlarmScope === 'device') {
      // result.deviceType = value.deviceType?.id;
      // result.devices = value.devices ? value.devices.map(({ id }) => id) : []
      const deviceTypeId = deviceTypes.find(item => item.name === value.alarmObject?.deviceTypeName)?.id
      result.device = `${deviceTypeId}-${value.alarmObject?.deviceIds?.[0]}`;
      this.setState({
        durationRtime: { '0-0': value.durationRtime ? Number((value.durationRtime / 60000).toFixed(2)) : null },
        alarmScope: stateAlarmScope,
        selectedKeysMap: {
          '0-0': relatedPointDataType
        }
      })
    } else {
      const deviceType = alarmRulesEnums.deviceTypes?.find(item => item.name === value.alarmObject?.deviceTypeName)?.id;
      result.deviceType = deviceType;
      if (!value.alarmObject?.selectAll) {
        result.devices = [
          ...(value.alarmObject?.stationIds ?? []),
          ...(Object.values(value.alarmObject?.deviceIdMap ?? {}).reduce((pre, v) => ([...pre, ...v]), []))
        ]
      }

      this.setState({
        switchChecked: value.alarmObject?.selectAll,
        durationRtime: { '0-0': value.durationRtime ? Number((value.durationRtime / 60000).toFixed(2)) : null },
        selectedKeysMap: {
          '0-0': relatedPointDataType
        }
      })
    }

    const formulaMap = {};
    for (let i = 0; i < value.pointDataTypeTitles?.length; i++) {
      formulaMap[value.pointDataTypeTitles[i]] = value.pointDataTypeIds[i];
    }

    for (let i = 0; i < value.paramTitles?.length; i++) {
      formulaMap[value.paramTitles[i]] = value.paramIds[i];
    }

    setTimeout(() => {
      this.formulaRef['0-0'].innerHTML = this.formulaToForm(value.formula, formulaMap);
    }, 500)

    this.setState({
      formulaIds:  [...(value.pointDataTypeIds ?? []), ...(value.paramIds ?? [])] 
    })

    result.alarmTypes = [{
      id: value.alarmType,
      alarmRules: [{
        alarmCalcType: value.alarmCalcType?.id,
        alarmLevel: value.alarmLevel?.id,
        desc: value.desc,
        // formula: this.formulaToForm(value.formula, formulaMap),
        relatedPointDataTypes: value.relatedPointDataTypes ? value.relatedPointDataTypes.map(i => i.id) : [],
        // rtime: value.durationRtime ? Number((value.durationRtime / 60000).toFixed(2)) : value.durationRtime
      }],
    }];

    return result
  }

  initForm = () => {
    const { tabKey, alarmRulesEnums } = this.props
    const { alarmScopes } = alarmRulesEnums
    return {
      alarmScope: (alarmScopes || []).find(item => item.name === tabKey)?.id,
      alarmTypes: [{
        id: undefined,
        alarmRules: [{
          alarmCalcType: undefined,
          alarmLevel: undefined,
          desc: undefined,
          formula: undefined,
          relatedPointDataTypes: [],
        }],
      }],
    }
  }

  // 将后台的formula字符串（判断规则）转换成前端标签形势的字符串
  formulaToForm = (originFormula: string = '', formulaMap?: any = {}): string => {
    const formula = originFormula.replace(/(var|param)\([^()]+\)/g, (str) => {
      const title = str.replace(/(var|param)\(|\)/g, '');
      return formulaMap[title] ? `<span value="${formulaMap[title]}" contenteditable="false" class="view-box">${title}</span>` : str
    })
    return ' '+ formula;
  }

  // 将后台的formula字符串（判断规则）转换成后台标签形势的字符串
  formulaToService = (originFormula: string = '', formulaMap?: any = {}): {
    ids, titles, text
  } => {
    const ids = [];
    const titles = [];
    const formula = originFormula.replace(/(<span)[^</]+<\/span>/g, (str) => {
      const id = str.substring(str.indexOf('"') + 1, str.indexOf('contenteditable') - 2);
      const title = str.substring(str.indexOf(">") + 1, str.indexOf('</'));
      ids.push(id);
      titles.push(title);
      return title.split(':').length === 3 ? `var(${title})` : `param(${title})`
    }).replace(/(\&gt;|\&lt;|\&amp;|&nbsp;)/g, (str) => {
      if (str === '&gt;') return '>';
      else if (str === '&lt;') return '<';
      else if (str === '&nbsp;') return '';
      else return '&';
    })

    return {
      ids,
      titles,
      text: formula
    }
  }


  render() {
    const { pageId, tabKey, alarmRulesEnums, stationList, alarmTypesList, pointDataTypesList, deviceList, deviceTypeTree, loadTreeLoading, terminalList, pointDataTypeList, deviceTypeTableLoading, allPointDataTypeList, roleName } = this.props
    const { type, switchChecked, visible, alarmTypeIndex, alarmRulesIndex, record, alarmScope, deviceTreeKey, nowDeviceType, searchValue, selectedKeysMap, editForm, formulaError } = this.state
    const { alarmScopes, alarmLevels, calcFunctions, alarmCalcTypes, deviceTypes } = alarmRulesEnums
    // console.log('stationList', stationList)
    const stationDataList = stationList.map(item => ({ value: item.id, name: item.title }))
    const alarmScopesList = (alarmScopes || []).map(item => ({ value: item.id, type: item.name, name: item.title }))
    const alarmTypesDataList = (alarmTypesList || []).map(item => ({ value: item, label: item ?? '' }))
    const alarmLevelsList = (alarmLevels || []).map(item => ({ value: item.id, name: item.title }))
    const alarmCalcTypesRadioList = (alarmCalcTypes || []).map(item => ({ value: item.id, label: item.title, name: item.name }))
    const deviceTypesList = (deviceTypes || []).map(item => ({ value: item.id, type: item.name, name: item.title }))
    return (
      <Page pageId={pageId} pageTitle={utils.intl("异常规则")}>
        <CrumbsPortal pageName="AlarmRulesEditPage">
          {
            type !== 'view' ? (
              <>
                <Button onClick={this.cancel}>
                  {utils.intl('取消')}
                </Button>
                <Button style={{ marginLeft: 16 }} type="primary" onClick={this.saveAlarmRules}>
                  {utils.intl('保存')}
                </Button>
              </>
            ) : (
              <>
                <Button onClick={this.calBack}>
                  {utils.intl('返回')}
                </Button>
                <Button style={{ marginLeft: 16 }} type="primary" onClick={this.changeEdit}>
                  {utils.intl('编辑')}
                </Button>
              </>
            )
          }
        </CrumbsPortal>
        {
          type === 'view' ? <AlarmRulesViewPage {...this.props} record={record || {}} />
            :
            (
              <div className="alarm-rules-edit-page">
                <div className="alarm-rules-edit-header">{utils.intl(type === 'new' ? '新增' : '编辑')}{utils.intl('title.异常规则')}</div>
                <Form
                  className="alarm-rules-form"
                  ref={formBox => this.formBox = formBox}
                  initialValues={type === 'new' ? this.initForm() : editForm}
                >
                  <div className="alarm-rules-form-first">
                    <FormItem 
                    name="alarmScope" 
                    label={utils.intl('适用类型')}
                    rules={[{ required: true, message: utils.intl('请选择{0}', '适用类型') }]}
                    >
                      <Select
                        dataSource={alarmScopesList}
                        className="card-detail-select"
                        style={{ width: 200 }}
                        // disabled
                        onChange={value => {
                          this.setState({ alarmScope: alarmScopesList.find(i => i.value === value)?.type, selectedKeysMap: {} })
                        }}
                      />
                    </FormItem>
                    {
                      alarmScope === 'station' ? (
                        <FormItem 
                        className="station-form-item" 
                        // style={{ marginLeft: 142 }}
                        >
                          <FormItem
                            name="stations"
                            label={utils.intl('适用对象')} 
                            style={{ display: 'flex' }}
                            rules={[{ required: true, message: utils.intl('请选择{0}', '适用对象') }]}
                          >
                            <Select
                              dataSource={stationDataList}
                              style={{ width: 493 }}
                              // maxTagCount='responsive'
                              // mode="multiple"
                              allowClear
                              onChange={value => {
                                this.setState({ selectedKeysMap: {} })
                              }}
                            // checkAllText={utils.intl("全选")}
                            // selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                            />
                          </FormItem>
                        </FormItem>
                      ) : alarmScope === 'deviceType' ? (
                        <div className="alarm-rules-form-first-device">
                          <FormItem
                            name="deviceType"
                            label={utils.intl('设备类型')}
                            rules={[{ required: true, message: utils.intl('请选择{0}', '设备类型') }]}
                            style={{ width: 358 }}
                          >
                            <Select
                              dataSource={deviceTypesList}
                              className="card-detail-select"
                              style={{ width: 150 }}
                              filterable
                              onChange={this.handleChangeDeviceType}
                            />
                          </FormItem>
                          <FormItem label={utils.intl('适用对象')} className="station-form-item" style={{ width: '100%', lineHeight: 2.3 }}>
                            {utils.intl('全部适用')} <Switch checked={switchChecked} onChange={checked => {
                              if(checked) this.formBox.setFieldsValue({
                                devices: (deviceList || []).map(item => item.value)
                              });
                              this.setState({ switchChecked: checked })
                            }} />
                            {
                              !switchChecked ?
                                <FormItem
                                  name="devices"
                                  style={{ display: 'inline-block', marginLeft: 16 }}
                                  rules={[{ required: true, message: utils.intl('请选择{0}', '设备') }]}
                                >
                                  <Select
                                    dataSource={deviceList || []}
                                    style={{ width: 350 }}
                                    maxTagCount='responsive'
                                    mode="multiple"
                                    checkAllText={utils.intl("全选")}
                                    selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                                    allowClear
                                    filterable
                                    showSuperSwitch
                                    showAllSelect={false}
                                    switchText={utils.intl('全部适用')}
                                    tagAllText={utils.intl('全部')}
                                    onChange={value => {
                                      this.setState({ selectedKeysMap: {} })
                                    }}
                                  />
                                </FormItem>
                                : null
                            }
                          </FormItem>
                        </div>
                      ) : alarmScope === 'device' ? (
                        <FormItem className="station-form-item">
                          <FormItem
                            name="device"
                            label={utils.intl('适用对象')} 
                            style={{ display: 'flex' }}
                            rules={[{ required: true, message: utils.intl('请选择{0}', '适用对象') }]}
                          >
                            <CustomCascader
                              style={{ width: 493 }}
                              allowClear
                              dataSource={deviceTypeTree}
                              loading={{
                                [deviceTreeKey]: loadTreeLoading
                              }}
                              handleSubMenuClick={(m, key) => {
                                if (!m.children?.length) {
                                  this.props.dispatch({
                                    type: `${alarm_config}/getDeviceTypeTreeChildren`,
                                    payload: {
                                      deviceTypeName: m.type,
                                      firmId: this.props.record?.firmId
                                    }
                                  })
                                }
                                this.setState({ deviceTreeKey: key })
                              }}
                              onChange={value => {
                                this.setState({ selectedKeysMap: {} })
                              }}
                            />
                          </FormItem>
                        </FormItem>
                      ) : null
                    }
                    {/* <FormItem label={utils.intl('适用电站')} className="station-form-item" style={{ flex: 1, marginLeft: 142 }}>
                      {utils.intl('全部适用')} <Switch checked={switchChecked} onChange={checked => this.setState({ switchChecked: checked })} />
                      {
                        !switchChecked ?
                          <FormItem
                            name="stations"
                            style={{ display: 'inline-block', marginLeft: 16 }}
                            rules={[{ required: true, message: utils.intl('请选择电站') }]}
                          >
                            <Select
                              dataSource={stationDataList}
                              style={{ width: 493 }}
                              // maxTagCount='responsive'
                              // mode="multiple"
                              allowClear
                              checkAllText={utils.intl("全选")}
                              selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                            />
                          </FormItem>
                          : null
                      }
                    </FormItem> */}
                  </div>
                  {/* {
                    tabKey === 'station' ? ( // 电站
                      <div className="alarm-rules-form-first">
                        <FormItem name="alarmScope" label={utils.intl('所有类型')}>
                          <Select
                            dataSource={alarmScopesList}
                            className="card-detail-select"
                            style={{ width: 200 }}
                            // disabled
                            onChange={value => {
                              this.setState({ alarmScope: alarmScopesList.find(i => i.value === value)?.type })
                            }}
                          />
                        </FormItem>
                        <FormItem label={utils.intl('适用电站')} className="station-form-item" style={{ flex: 1, marginLeft: 142 }}>
                          {utils.intl('全部适用')} <Switch checked={switchChecked} onChange={checked => this.setState({ switchChecked: checked })} />
                          {
                            !switchChecked ?
                              <FormItem
                                name="stations"
                                style={{ display: 'inline-block', marginLeft: 16 }}
                                rules={[{ required: true, message: utils.intl('请选择电站') }]}
                              >
                                <Select
                                  dataSource={stationDataList}
                                  style={{ width: 493 }}
                                  maxTagCount='responsive'
                                  mode="multiple"
                                  allowClear
                                  checkAllText={utils.intl("全选")} 
                                  selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                                />
                              </FormItem>
                              : null
                          }
                        </FormItem>
                      </div>
                    ) : ( // 设备类型
                      <div className="alarm-rules-form-first-device">
                        <FormItem name="alarmScope" label={utils.intl('作用对象')}>
                          <Select
                            dataSource={alarmScopesList}
                            className="card-detail-select"
                            style={{ width: 150 }}
                            disabled
                          />
                        </FormItem>
                        <FormItem
                          name="deviceType"
                          label={utils.intl('设备类型')}
                          rules={[{ required: true, message: utils.intl('请选择设备类型') }]}
                          style={{ marginLeft: 30 }}
                        >
                          <Select
                            dataSource={deviceTypesList}
                            className="card-detail-select"
                            style={{ width: 150 }}
                            filterable
                            onChange={this.handleChangeDeviceType}
                          />
                        </FormItem>
                        <FormItem label={utils.intl('适用设备')} className="station-form-item" style={{ width: '100%', lineHeight: 2.3 }}>
                          {utils.intl('全部适用')} <Switch checked={switchChecked} onChange={checked => this.setState({ switchChecked: checked })} />
                          {
                            !switchChecked ?
                              <FormItem
                                name="devices"
                                style={{ display: 'inline-block', marginLeft: 16 }}
                                rules={[{ required: true, message: utils.intl('请选择{0}', '设备') }]}
                              >
                                <Select
                                  dataSource={deviceList || []}
                                  style={{ width: 350 }}
                                  maxTagCount='responsive'
                                  mode="multiple"
                                  checkAllText={utils.intl("全选")} 
                                  selectText={val => <span className="select-text">({utils.intl(`已选 {0} 个`, val?.length ?? 0)})</span>}
                                  allowClear
                                  filterable
                                />
                              </FormItem>
                              : null
                          }
                        </FormItem>
                      </div>
                    )
                  } */}
                  <div className="alarm-rules-context">
                    <div className="alarm-rules-context-header">{utils.intl('规则内容')}</div>
                    <Form.List name="alarmTypes">
                      {
                        (alarmTypeFields, { add, remove }) => (
                          <>
                            {
                              alarmTypeFields.map((alarmTypeField, alarmTypeIndex) => (
                                <div className="alarm-type-form-list" style={{ marginBottom: type === 'edit' ? 16 : 0 }}>
                                  <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                    return curValue?.["alarmTypes"]?.[alarmTypeIndex]?.['id'] !== prevValue?.["alarmTypes"]?.[alarmTypeIndex]?.['id']
                                  }}>
                                    {
                                      ({ getFieldsValue, validateFields }) => {
                                        const ids = getFieldsValue()?.["alarmTypes"]
                                        const is = (ids || []).filter((i, index) => index !== alarmTypeIndex && i).map(item => item.id)
                                        return (
                                          <FormItem
                                            name={[alarmTypeField.name, 'id']}
                                            label={utils.intl('异常类型')}
                                            validateFirst
                                            rules={[{ required: true, message: utils.intl('请选择{0}', "异常类型") }, {
                                              type: 'string', max: 32, message: utils.intl('{0}不要超过{1}个字', '异常类型', 32)
                                            },
                                              // {
                                              //   validator: (rule, value) => {
                                              //     if (is.find(i => i === value)) {
                                              //       return Promise.reject(utils.intl('存在相同的异常类型'))
                                              //     }
                                              //     return Promise.resolve()
                                              //   }
                                              // }
                                            ]}
                                          >
                                            <AutoComplete
                                              options={alarmTypesDataList}
                                              style={{ width: 200 }}
                                              filterOption={(inputValue, option) => {
                                                return inputValue && inputValue !== '' ? `${option.label}`.indexOf(inputValue) > -1 : true
                                              }}
                                            />
                                            {/* <Select
                                              dataSource={alarmTypesDataList}
                                              className="card-detail-select"
                                              filterable
                                              style={{ width: 200 }}
                                            /> */}
                                          </FormItem>)
                                      }
                                    }
                                  </FormItem>
                                  <Form.List name={[alarmTypeField.name, 'alarmRules']}>
                                    {
                                      (alarmRulesFields, { add: alarmRulesAdd, remove: alarmRulesRemove }) => (
                                        <>
                                          {
                                            alarmRulesFields.map((alarmRulesField, alarmRulesIndex) => (
                                              <div className="alarm-type-form-list">
                                                <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                                  return curValue?.["alarmTypes"]?.[alarmTypeIndex]?.['alarmRules']?.[alarmRulesIndex]?.alarmLevel !== prevValue?.["alarmTypes"]?.[alarmTypeIndex]?.['alarmRules']?.[alarmRulesIndex]?.alarmLevel
                                                }}>
                                                  {
                                                    ({ getFieldsValue, validateFields }) => {
                                                      const alarmRules = getFieldsValue()?.["alarmTypes"]?.[alarmTypeIndex]?.['alarmRules']
                                                      // console.log('alarmRules', alarmRules)
                                                      const alarmLevels = (alarmRules || []).filter((i, index) => index !== alarmRulesIndex && i).map(item => item.alarmLevel)
                                                      // console.log('alarmLevels', alarmLevels)
                                                      return (
                                                        <FormItem
                                                          name={[alarmRulesField.name, 'alarmLevel']}
                                                          label={utils.intl('异常级别')}
                                                          rules={[{ required: true, message: utils.intl('请选择{0}', "异常级别") },
                                                            //  {
                                                            //   validator: (rule, value) => {
                                                            //     alarmLevels.find(i => i === value)
                                                            //     if (alarmLevels.find(i => i === value)) {
                                                            //       return Promise.reject(utils.intl('存在相同的异常级别'))
                                                            //     }
                                                            //     return Promise.resolve()
                                                            //   }
                                                            // }
                                                          ]}
                                                        >
                                                          <Select
                                                            dataSource={alarmLevelsList}
                                                            className="card-detail-select"
                                                            style={{ width: 200 }}
                                                          />
                                                        </FormItem>)
                                                    }
                                                  }
                                                </FormItem>
                                                {/* <FormItem
                                                  name={[alarmRulesField.name, 'alarmLevel']}
                                                  label={utils.intl('异常级别')}
                                                  rules={[{ required: true, message: utils.intl('请选择异常级别') }]}
                                                >
                                                  <Select
                                                    dataSource={alarmLevelsList}
                                                    className="card-detail-select"
                                                    style={{ width: 200 }}
                                                  />
                                                </FormItem> */}
                                                <FormItem
                                                  name={[alarmRulesField.name, 'desc']}
                                                  label={utils.intl('异常详情')}
                                                  rules={[{ required: true, message: utils.intl('请输入{0}', '异常详情') }, { type: 'string', max: 100, message: utils.intl('{0}不要超过{1}个字', '异常详情', 10) }]}
                                                >
                                                  <Input style={{ width: 780 }} maxLength={100} placeholder={utils.intl("请输入")} />
                                                </FormItem>
                                                <div className="formula-box">
                                                  <label>{utils.intl('判断规则')}：</label>
                                                  <div className="formula-border-text">
                                                    <div
                                                      className="richText-box"
                                                      style={{ width: 780, boxShadow: 'none' }}
                                                      contenteditable="true"
                                                      ref={richDom => this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`] = richDom}
                                                      onInput={(e) => {
                                                        const value = e.target.innerHTML;
                                                        // console.log('value',value)
                                                        if (value && value !== '') {
                                                          const str = value.substr(0,6);
                                                          if(str !== '&nbsp;') e.target.innerHTML = '&nbsp;' + e.target.innerHTML;
                                                          const { text, ids } = this.formulaToService(value);
                                                          // console.log('text', text)
                                                          createServices<any>("get", `/abnormal-alarm/formulaCheck`, { formula: text }).then(({ errorCode, errorMsg }) => {
                                                            if (errorCode !== 0) {
                                                              // formulaError[`${alarmTypeIndex}-${alarmRulesIndex}`] = errorMsg
                                                              this.setState({
                                                                formulaError: { ...formulaError, [`${alarmTypeIndex}-${alarmRulesIndex}`]: errorMsg },
                                                                formulaIds: ids
                                                              })
                                                            } else {
                                                              // formulaError[`${alarmTypeIndex}-${alarmRulesIndex}`] = null;
                                                              this.setState({
                                                                formulaError: { ...formulaError, [`${alarmTypeIndex}-${alarmRulesIndex}`]: null },
                                                                formulaIds: ids
                                                              })
                                                            }
                                                          })
                                                        } else {
                                                          // formulaError[`${alarmTypeIndex}-${alarmRulesIndex}`] = utils.intl('请输入{0}', '判断规则')
                                                          this.setState({
                                                            formulaError: { ...formulaError, [`${alarmTypeIndex}-${alarmRulesIndex}`]: utils.intl('请输入{0}', '判断规则') },
                                                            formulaIds: []
                                                          })
                                                        }
                                                      }}
                                                    >
                                                    </div>
                                                  </div>
                                                  {formulaError[`${alarmTypeIndex}-${alarmRulesIndex}`] ? <div style={{ marginLeft: 71 }} className="ant-form-item-explain ant-form-item-explain-error">{formulaError[`${alarmTypeIndex}-${alarmRulesIndex}`]}</div> : null}
                                                  {/* <FormItem
                                                    name={[alarmRulesField.name, 'formula']}
                                                    label={utils.intl('判断规则')}

                                                    rules={[{ required: true, message: utils.intl('请输入{0}', '判断规则') }, {
                                                      validateTrigger: "onSubmit",
                                                      validator: async (rule, value) => {
                                                        try {
                                                          if (value && value !== '') {
                                                            const { errorCode, errorMsg } = await createServices<any>("get", `/abnormal-alarm/formulaCheck`, { formula: value });
                                                            if (errorCode !== 0) {
                                                              return Promise.reject(errorMsg)
                                                            }
                                                            return Promise.resolve()
                                                          } else {
                                                            return Promise.resolve()
                                                          }

                                                        } catch (error) {
                                                          return Promise.reject(error.errorMsg)
                                                        }
                                                      }
                                                    }]}
                                                  > */}
                                                  {/* <RichText ref={ref => this.formulaRef[`${alarmTypeIndex}-${alarmRulesIndex}`] = ref} style={{ width: 780, height: 118 }} onChange={value => {

                                                    }} placeholder={utils.intl("请输入")} /> */}
                                                  {/* <TextArea style={{ width: 780, boxShadow: 'none' }} placeholder={utils.intl("请输入")} autoSize={{ minRows: 5, maxRows: 5 }} /> */}
                                                  {/* </FormItem> */}
                                                  <span className="add-text-btn" style={{ top: 116, left: localStorage.getItem('language') === 'zh' ? 93 : 61 }} onClick={() => this.openModal('rule', { alarmTypeIndex, alarmRulesIndex })}>{utils.intl('选择数据项')}</span>
                                                  <Tooltip placement="bottom" overlayClassName="alarm-rules-tooltip" title={
                                                    <>
                                                      {
                                                        (calcFunctions || []).map(item => (<span title={item.title} style={{ marginRight: 8, cursor: "pointer" }} onClick={() => this.addText(item.name, { alarmTypeIndex, alarmRulesIndex })}>{item.name}</span>))
                                                      }
                                                    </>
                                                  } arrowPointAtCenter trigger="click">
                                                    <span className="add-text-btn" style={{ top: 116, left: 181 }}>{utils.intl('导入公式')} <QuestionCircleOutlined /></span>
                                                  </Tooltip>
                                                </div>
                                                <div className="alarmCalcType-box">
                                                  <FormItem
                                                    name={[alarmRulesField.name, 'alarmCalcType']}
                                                    label={utils.intl('判断方式')}
                                                    initialValue={type === 'edit' ? undefined : alarmCalcTypesRadioList[0].value}
                                                    rules={[{ required: true, message: utils.intl('请选择判断方式') }]}
                                                  >
                                                    <RadioGroup
                                                      // options={alarmCalcTypesRadioList}
                                                      onChange={e => {
                                                        const { alarmCalcType, durationRtime } = this.state
                                                        alarmCalcType[`${alarmTypeIndex}-${alarmRulesIndex}`] = e.target.value;
                                                        durationRtime[`${alarmTypeIndex}-${alarmRulesIndex}`] = null;

                                                        this.setState({ alarmCalcType: alarmCalcType, durationRtime: durationRtime })
                                                      }}
                                                    >
                                                      {
                                                        alarmCalcTypesRadioList.map(item => {
                                                          const { alarmCalcType, durationRtime } = this.state
                                                          const { name, value: id } = item
                                                          const nowAlarmCalcType = alarmCalcType[`${alarmTypeIndex}-${alarmRulesIndex}`] ?? alarmCalcTypesRadioList[0]?.value;
                                                          const time = durationRtime[`${alarmTypeIndex}-${alarmRulesIndex}`]
                                                          if (name === 'realtime') {
                                                            return (<Radio value={id}>{utils.intl('实时')}</Radio>)
                                                          } else if (name === 'duration') {
                                                            return (
                                                              <>
                                                                <Radio value={id}>
                                                                  {utils.intl('持续发生')}
                                                                  <InputNumber
                                                                    style={{ margin: '0px 4px' }}
                                                                    disabled={id !== nowAlarmCalcType}
                                                                    value={id === nowAlarmCalcType ? time : undefined}
                                                                    max={99999}
                                                                    min={0}
                                                                    onChange={value => {
                                                                      durationRtime[`${alarmTypeIndex}-${alarmRulesIndex}`] = value;
                                                                      this.setState({ durationRtime })
                                                                    }}
                                                                  />{utils.intl('分钟后告警')}
                                                                </Radio>
                                                              </>
                                                            )
                                                          } else {
                                                            return (<>
                                                              <Radio value={id}>
                                                                {utils.intl('持续')}
                                                                <InputNumber
                                                                  style={{ margin: '0px 4px' }}
                                                                  disabled={id !== nowAlarmCalcType}
                                                                  value={id === nowAlarmCalcType ? time : undefined}
                                                                  max={99999}
                                                                  min={0}
                                                                  onChange={value => {
                                                                    durationRtime[`${alarmTypeIndex}-${alarmRulesIndex}`] = value;
                                                                    this.setState({ durationRtime })
                                                                  }}
                                                                /> {utils.intl('分钟后不变化告警')}
                                                              </Radio>
                                                            </>)
                                                          }
                                                        })
                                                      }
                                                    </RadioGroup>
                                                  </FormItem>
                                                </div>
                                                <FormItem
                                                  name={[alarmRulesField.name, 'relatedPointDataTypes']}
                                                  label={utils.intl('关联数据项')}
                                                // rules={[{ required: true, message: utils.intl('请选择关联数据项') }]}
                                                >
                                                  <FormItem noStyle shouldUpdate={(prevValue, curValue) => {
                                                    return curValue?.["alarmTypes"]?.[alarmTypeIndex]?.['alarmRules']?.[alarmRulesIndex]?.relatedPointDataTypes !== prevValue?.["alarmTypes"]?.[alarmTypeIndex]?.['alarmRules']?.[alarmRulesIndex]?.relatedPointDataTypes
                                                  }}>
                                                    {
                                                      ({ getFieldsValue, validateFields, setFieldsValue }) => {
                                                        const relatedPointDataTypes = getFieldsValue()?.["alarmTypes"]?.[alarmTypeIndex]?.['alarmRules']?.[alarmRulesIndex]?.relatedPointDataTypes || []
                                                        const pointDataList = relatedPointDataTypes.map(item => (pointDataTypesList || []).find(i => i.id === item)).filter(i => i)
                                                        return (
                                                          <div className="relatedPointDataTypes">
                                                            <span className="addRelatedPointDataTypes" style={{ marginLeft: 0 }} onClick={() => this.openModal('dataItem', { alarmTypeIndex, alarmRulesIndex })}>{utils.intl('选择数据项')}</span>
                                                            {
                                                              Object.keys(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] || {}).map(key => (
                                                                <span className="dataShowItem" style={{ margin: '4px' }}>{selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`]?.[key]}<CloseOutlined style={{ marginLeft: 8, cursor: "pointer" }} onClick={() => {
                                                                  const newSelectedKeysMap = {
                                                                    ...selectedKeysMap,
                                                                    [`${alarmTypeIndex}-${alarmRulesIndex}`]: _.omit(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`], [key])
                                                                  };
                                                                  const ids = Object.keys(newSelectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`])
                                                                  this.setState({ selectedKeysMap: newSelectedKeysMap })
                                                                  const formValues = _.cloneDeep(getFieldsValue())
                                                                  formValues["alarmTypes"][alarmTypeIndex]['alarmRules'][alarmRulesIndex].relatedPointDataTypes = ids
                                                                  setFieldsValue(formValues)
                                                                }} /></span>
                                                              ))
                                                            }
                                                          </div>
                                                        )
                                                      }
                                                    }
                                                  </FormItem>
                                                </FormItem>
                                                {
                                                  type === 'edit' || alarmRulesFields?.length <= 1 ? null : <div className="delete-btn" onClick={() => alarmRulesRemove(alarmRulesIndex)}><GfDeleteOutlined /></div>
                                                }
                                              </div>
                                            ))
                                          }
                                          {
                                            type === 'edit' ? null : (
                                              <Button type="dashed" block className="plus-block-btn" onClick={() => alarmRulesAdd()}>
                                                <PlusOutlined style={{ marginRight: 8 }} /> {utils.intl('新增判断规则')}
                                              </Button>
                                            )
                                          }

                                        </>
                                      )
                                    }
                                  </Form.List>
                                  {
                                    type === 'edit' || alarmTypeFields?.length <= 1 ? null : <div className="delete-btn" onClick={() => remove(alarmTypeIndex)}><GfDeleteOutlined /></div>
                                  }
                                </div>
                              ))
                            }
                            {
                              type === 'edit' ? null : (
                                <Button type="dashed" block className="plus-block-btn" onClick={() => add()}>
                                  <PlusOutlined style={{ marginRight: 8 }} /> {utils.intl('新增异常类型')}
                                </Button>
                              )
                            }

                          </>
                        )
                      }
                    </Form.List>
                  </div>
                </Form>
              </div>
            )
        }
        <Modal
          visible={visible}
          title={<div style={{ fontWeight: 'bold' }}>{utils.intl('选择数据项')}</div>}
          width={780}
          destroyOnClose
          maskClosable={false}
          onCancel={() => this.setState({ visible: false, searchValue: null })}
          footer={null}
        // okText={utils.intl('确定')}
        // cancelText={utils.intl('取消')}
        // onOk={this.addDataItem}
        >
          {
            alarmScope === 'deviceType' ? (
              <DeviceTypeDataItem
                terminalList={terminalList}
                pointDataTypeList={pointDataTypeList}
                deviceType={nowDeviceType}
                selectedKeysMap={this.state.modalType === 'rule' ? {} : selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] || {}}
                disabledKeys={this.state.modalType === 'rule' ? Object.keys(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] || {})
                  : [...this.state.formulaIds, ...Object.keys(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] || {})]
                }
                allPointDataTypeMap={allPointDataTypeList}
                tableLoading={deviceTypeTableLoading}
                onSearch={(params) => this.props.dispatch({ type: `${alarm_config}/getPointDataTypesByTerminals`, payload: params })}
                onCancel={() => this.setState({ visible: false })}
                onOk={this.addDataItem}
              />
            ) : null
          }
          {/* <div className="receiver-add-modal-box">
            <div style={{ marginBottom: 8 }}><Search style={{ width: 260 }} placeholder={utils.intl('请输入关键字')} onSearch={value => {
              this.setState({ searchValue: value })
              this.getReceiverList(1, 20, value)
            }} /></div>
            <div style={{ maxHeight: 500 }}>
              <Table1
                x={592}
                rowKey={record => record.id}
                rowSelection={rowSelection}
                dataSource={this.state.showTableData ? dataSource : []}
                virtual
                columns={columns}
              // page={page}
              // size={size}
              // total={total}
              // onPageChange={(page, size) => {
              //   this.getReceiverList(page, size, this.state.searchValue)
              // }}
              />
            </div>
          </div> */}
        </Modal>
        {this.props.pointDataModalVisible ? (
          <PointDataModal
            id={this.state.dataItemId}
            isStation={alarmScope === 'station'}
            showTechnologyParams={this.state.modalType === 'rule'}
            disabledPointIds={this.state.modalType === 'rule' ?
              Object.keys(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] || {})
              :
              [...this.state.formulaIds, ...Object.keys(selectedKeysMap[`${alarmTypeIndex}-${alarmRulesIndex}`] || {})]}
            onClose={() => this.props.updateState({ pointDataModalVisible: false })}
            onFinish={this.addDataItem} // (values: DeviceItem[]) => {}
          />
        ) : null}
      </Page>
    )
  }
}

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    loadTreeLoading: getLoading('getDeviceTypeTreeChildren'),
    deviceTypeTableLoading: getLoading('getPointDataTypesByTerminals'),
    // stationList: state[globalNS].stationList,
    roleName: state[globalNS].roleName,
    theme: state[crumbsNS].theme,
  }
}

export default makeConnect(alarm_config, mapStateToProps)(AlarmRulesEditPage)
