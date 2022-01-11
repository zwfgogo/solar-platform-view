/** 新版的电价信息 */
import React, { Component } from 'react'
import { message, Modal, Row } from 'wanke-gui'
import { ExclamationCircleOutlined } from 'wanke-icon'
import "./styles/tab-price-new.less"
import PriceTags from './tab-price-component/PriceTags'
import { getAction, makeConnect } from '../../umi.helper'
import { stationUpdateNS } from '../../constants'
import { formatPrice, StationUpdateModel } from 'umi'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import moment from 'moment'
import utils from '../../../util/utils'
import { getTimeNearly, getTimeRange } from './price/RealTimeDialog'
import { EChartOption } from 'echarts'
import { CustomChartOption, useEchartsOption } from '../../../components/charts/common-echarts/useEchartsOption'
import { transfromZoneTime } from '../../../util/dateUtil'
import BorderHeader from '../../../components/BorderHeader'
import _ from 'lodash'

const dataSource = new Array(100).fill(0).map((item, index) => ({ value: index, label: `测试能量单元${index}` }))

//电价页签
interface Props extends StationUpdateModel, MakeConnectProps<StationUpdateModel> {
  station: any,
  addLoading: boolean,
  searchLoading: boolean,
  stationId: number,
  // stationInfo?: any, // 电站对象
  energyUnitInfo?: any, // 能量单元对象
  modalType?: 'cost' | 'generation',
  onCancel: () => void
}
interface State {
  type: boolean;
  visible: boolean;
  isEdit: boolean;
  infoVisible: boolean;
  obj: any;
  isNoStationPrice: false;
}

@makeConnect(stationUpdateNS, (model, { getLoading }, state) => {
  const { time } = state.global
  return {
    ...model,
    time,
    theme: state.global.theme,
    station: state.stationUpdate,
    addLoading: getLoading('addPrice'),
    searchLoading: getLoading('getPrice')
  }
})
export default class TabPriceNew extends Component<Props, State> {
  state = {
    type: true, //  false:当前电价 true: 计划电价
    visible: false,
    infoVisible: false,
    isEdit: false,
    obj: {},
    isNoStationPrice: false // 当能量单元时要获取电站下是否存在电价
  }

  componentDidMount() {

    // console.log(moment('2019-09-12 13:59:59').format('YYYY-MM-DD HH:00'))

    const { stationId, modalType, energyUnitInfo } = this.props
    // console.log('stationId', stationId)
    this.props.action('getPriceMap')
    if (stationId) {
      this.props.action('fetchStationEnergyList', { stationId, activity: true })
      // this.props.action('getPrice', { stationId, isFuture: false, modalType })
      this.props.action('getEnergyUnits', { stationId })
      energyUnitInfo ? this.props.action('getPrice', { energyUnitId: energyUnitInfo.id, isFuture: true, modalType }) : this.props.action('getPrice', { stationId, isFuture: true, modalType })
      if (energyUnitInfo) this.getStationPrice()
    }
  }

  componentDidUpdate(preProps) {
    if (preProps.stationId !== this.props.stationId && this.props.stationId) {
      const { stationId, modalType, energyUnitInfo } = this.props
      this.props.action('fetchStationEnergyList', { stationId, activity: true })
      this.props.action('getEnergyUnits', { stationId })
      energyUnitInfo ? this.props.action('getPrice', { energyUnitId: energyUnitInfo.id, isFuture: true, modalType }) : this.props.action('getPrice', { stationId, isFuture: true, modalType })
      if (energyUnitInfo) this.getStationPrice()
    }
    if (preProps.modalType !== this.props.modalType && this.props.modalType) {
      const { stationId, modalType, energyUnitInfo } = this.props
      energyUnitInfo ? this.props.action('getPrice', { energyUnitId: energyUnitInfo.id, isFuture: true, modalType }) : this.props.action('getPrice', { stationId, isFuture: true, modalType })
      if (energyUnitInfo) this.getStationPrice()
    }
    if (!_.isEqual(preProps.energyUnitInfo, this.props.energyUnitInfo) && this.props.energyUnitInfo) {
      const { stationId, modalType, energyUnitInfo } = this.props
      this.props.action('getPrice', { energyUnitId: energyUnitInfo.id, isFuture: true, modalType })
    }
  }

  componentWillUnmount() {
    this.props.action('updateState', { nowPrice: {}, planPrice: {} })
  }

  // 获取电站电价
  getStationPrice = async () => {
    const { stationId, modalType } = this.props
    const isNoStationPrice = await this.props.action('getPrice', { stationId, isFuture: false, modalType, needStationPrice: true })
    this.setState({ isNoStationPrice })
  }

  // 打开删除框
  openDelete = () => {
    this.setState({ visible: true })
  }

  // 删除电价
  deletePrice = () => {
    const { stationId, energyUnitInfo, modalType } = this.props
    //TODO 添加删除
    if (energyUnitInfo) {
      this.props.action('removePrice', { energyUnitId: energyUnitInfo.id, modalType })
    } else {
      this.props.action('removePrice', { stationId, modalType })
    }

    this.setState({ visible: false })

  }

  // 初始化添加计划电价
  addInitPlanPrice = () => {
    const { energyUnitInfo } = this.props
    const result = {
      "effectiveDate": moment().add(1, 'h').format('YYYY-MM-DD HH:mm'), // 生效时间
      "failureDate": "9999-01-01 00:00", // 失效时间
      "generate": formatPrice({ // 售电
        "rangeType": energyUnitInfo ? 1 : 0, // 0： 全电站 1：能量单元
        "electricityPriceDetails": [
          {
            dealers: [{
              dealers: [],
              id: [],
              monthsList: [{}],
            }],
            energyUnits: []
          }
        ]
      }),
      "cost": formatPrice({ // 售电
        "rangeType": energyUnitInfo ? 1 : 0, // 0： 全电站 1：能量单元
        "electricityPriceDetails": [
          {
            dealers: [{
              dealers: [],
              id: [],
              monthsList: [{}],
            }],
            energyUnits: []
          }
        ]
  })
}

this.props.action('updateToView', {
  planPrice: result
})
  }

getElectricityPriceDetails = (electricityPriceDetails) => {
  // console.log('this.props.energyUnitInfo', this.props.energyUnitInfo)
  if (this.props.energyUnitInfo) {
    return electricityPriceDetails || undefined ? electricityPriceDetails.map(item => ({ ...item, energyUnits: [this.props.energyUnitInfo.id] })) : undefined
  }
  return electricityPriceDetails || undefined
}

// 保存
handleSave = (form, callBack) => {
  const { stationId, planPrice, modalType, energyUnitInfo, onCancel } = this.props
  if (planPrice.effectiveDate) { // 编辑
    form.validateFields()
      .then(value => {
        if (value.generate?.electricityPriceDetails?.length && value.generate?.electricityPriceDetails?.[0]?.dealers
          || value.cost?.electricityPriceDetails?.length && value.cost?.electricityPriceDetails?.[0]?.dealers) {
          this.props.action('editPrice', { ...(energyUnitInfo ? { energyUnitId: energyUnitInfo.id } : { stationId }), data: value, modalType }).then(
            () => {
              callBack && callBack()
              onCancel && onCancel()
            }
          );
        } else {
          message.error(utils.intl('请完善售电价格或者购电价格'))
        }
      })
  } else { // 新增
    if (energyUnitInfo)
      form.setFieldsValue({
        [modalType === 'cost' ? 'cost' : 'generate']: {
          rangeType: 1,
          electricityPriceDetails: this.getElectricityPriceDetails(form.getFieldsValue()[modalType === 'cost' ? 'cost' : 'generate']?.electricityPriceDetails)
        }
      })
    form.validateFields()
      .then(value => {
        if (value.generate?.electricityPriceDetails?.length && value.generate?.electricityPriceDetails?.[0]?.dealers || value.cost?.electricityPriceDetails?.length && value.cost?.electricityPriceDetails?.[0]?.dealers) {
          // const newValue = energyUnitInfo ? value[modalType === 'cost' ? 'cost' : 'generate'].electricityPriceDetails.map(item => ({ ...item, energyUnits: [energyUnitInfo.id] })) : value
          this.props.action('addPrice', { ...(energyUnitInfo ? { energyUnitId: energyUnitInfo.id } : { stationId }), data: value, modalType }).then(
            () => {
              callBack && callBack()
              onCancel && onCancel()
            }
          )
        } else {
          message.error(utils.intl('请完善售电价格或者购电价格'))
        }
      })
  }

}

clickRealInfo = (obj) => {
  // console.log(obj)
  this.props.action('getSpotCurve', { id: obj.value });
  this.setState({
    infoVisible: true,
    obj
  })
}

render() {
  const { basicInfo, realTimePriceMap_Generate, realTimePriceMap_Cost, multipleTypeMap, stationId, nowPrice, planPrice, priceObjMap, searchLoading, addLoading, modalType, time, energyUnits_Generate, energyUnits_Cost, energyUnitInfo, stationPrice, theme } = this.props
  const { type, visible, infoVisible, obj, isNoStationPrice } = this.state
  const incomeChart = { ...this.props.spotCurve, series: [{ name: utils.intl("实时电价"), unit: utils.intl("澳元/MWh") }], };
  const timeZone = sessionStorage.getItem('timeZone')
  const baseTime = transfromZoneTime(time?.time && time?.time !== '' ? moment(`${time?.time}:00`, 'HH:mm:ss') : moment(), timeZone, basicInfo.timeZone)
  const data = { ...incomeChart, dividing: [getTimeNearly(baseTime)] }

  return (
    <div className="tab-price-new-box">
      {/* <BorderHeader btnsStyle={{ marginTop: 8, height: '100%' }} style={{ minHeight: 433 }} title={!type ? utils.intl('当前执行电价') : utils.intl('计划执行电价')}> */}
      {/* <div className="tab-price-new-box-href" onClick={() => {
            energyUnitInfo ? this.props.action('getPrice', { energyUnitId: energyUnitInfo.id, isFuture: !this.state.type, modalType }) : this.props.action('getPrice', { stationId, isFuture: !this.state.type, modalType })
            this.setState({ type: !this.state.type })
          }}>{!type ? utils.intl('查看计划电价') + ' >' : utils.intl('查看当前电价') + ' >'}</div> */}
      {
        !type ?
          nowPrice && (<PriceTags
            isNow
            key="now"
            price={nowPrice}
            loading={searchLoading}
            basicInfo={basicInfo}
            modalType={modalType}
            isNoStationPrice={isNoStationPrice}
            theme={theme}
            maps={{
              realTimePriceMap_Generate,
              realTimePriceMap_Cost,
              multipleTypeMap,
              priceObjMap,
            }}
            time={time}
            energyUnitInfo={energyUnitInfo}
            energyUnitListCost={energyUnitInfo ? [energyUnitInfo] : energyUnits_Cost}
            energyUnitListGenerate={energyUnitInfo ? [energyUnitInfo] : energyUnits_Generate}
            clickRealInfo={this.clickRealInfo}
            onCancel={this.props.onCancel}
          />)
          : planPrice && (<PriceTags
            isNow={false}
            key="plan"
            handleDelete={this.openDelete}
            price={planPrice}
            nowPrice={nowPrice}
            modalType={modalType}
            loading={searchLoading}
            isNoStationPrice={isNoStationPrice}
            stationPrice={stationPrice}
            theme={theme}
            onCancel={this.props.onCancel}
            maps={{
              realTimePriceMap_Generate,
              realTimePriceMap_Cost,
              multipleTypeMap,
              priceObjMap,
            }}
            energyUnitInfo={energyUnitInfo}
            energyUnitListCost={energyUnitInfo ? [energyUnitInfo] : energyUnits_Cost}
            energyUnitListGenerate={energyUnitInfo ? [energyUnitInfo] : energyUnits_Generate}
            addInitPlanPrice={this.addInitPlanPrice}
            addLoading={addLoading}
            handleSave={this.handleSave}
            clickRealInfo={this.clickRealInfo}
            time={time}
            basicInfo={basicInfo}
            onEditChange={isEdit => {
              if (!isEdit) {
                const { stationId, modalType, energyUnitInfo } = this.props
                this.props.action('getPriceMap')
                this.props.action('updateToView', {
                  planPrice: {}
                })
                if (stationId) {
                  this.props.action('fetchStationEnergyList', { stationId, activity: true })
                  this.props.action('getEnergyUnits', { stationId })
                  energyUnitInfo ? this.props.action('getPrice', { energyUnitId: energyUnitInfo.id, isFuture: false, modalType }) : this.props.action('getPrice', { stationId, isFuture: false, modalType })
                  if (energyUnitInfo) this.getStationPrice()
                }
              }
            }}
          />)
      }
      {/* </BorderHeader> */}
      {type ? <div className={'buttonDiv'} /> : null}
      <Modal
        width={350}
        visible={visible}
        title={null}
        closable={false}
        okText={utils.intl("确定")}
        onCancel={() => this.setState({ visible: false })}
        onOk={this.deletePrice}
      >
        <div className="delete-modal-body">
          <ExclamationCircleOutlined style={{ color: "#d32029", fontSize: 48 }} />
          <div style={{ textAlign: "center", marginTop: 10 }}>{utils.intl("确认删除计划执行电价吗？删除操作不可恢复")}</div>
        </div>
      </Modal>
      <Modal
        width={1200}
        title={utils.intl("实时电价详情")}
        visible={infoVisible}
        onCancel={() => {
          this.setState({ infoVisible: false })
        }}
        destroyOnClose
        footer={null}
        className="price-detail-dialog"
      >
        <div className="" style={{ height: '380px', display: 'flex', flexDirection: 'column' }}>
          <Row>
            <span>{utils.intl("电价名称") + '：' + obj?.label}</span><span style={{ marginLeft: '30px' }}>{utils.intl("适用地区") + '：' + obj?.area}</span>
          </Row>
          <div className="flex1 e-pt10 f-pr">
            <RealTimeChart data={data} theme={this.props.theme} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
}

const RealTimeChart = ({ data, theme }) => {
  // console.log('data', data)
  const { option } = useEchartsOption<CustomChartOption.SplitLineChart>({
    type: 'splitLine',
    colorList: ["#0062ff"],
    showUnit: true,
    showLegend: true,
    disableZoom: true,
    data,
    formatLabel: value => {
      return value.split(' ').slice(-1)[0]
    },
    fillLabelAxis: getTimeRange('detail'),
    customOption: {
      legend: {
        textStyle: {
          color: theme === 'dark' ? '#ccc' : '#333'
        },
        inactiveColor: theme === 'dark' ? '#555' : '#ccc',
      },
    }
  });

  return (
    <CommonEcharts option={option} />
  )
}
