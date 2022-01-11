import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { Modal, Row, Col, Tabs, LineChart, Button } from 'wanke-gui'
import { DatePicker } from 'antd'
import utils from '../../../public/js/utils'
import { makeConnect } from '../../umi.helper'
import { settingNS, stationListNS, stationUpdateNS } from '../../constants'
import { fillPrice24HoursData } from '../station.helper'
import { getDateStr, isBigThanToday, transfromZoneTime } from '../../../util/dateUtil'
import { LeftSquareOutlined, RightSquareOutlined } from 'wanke-icon'
import DetailFormItem from '../../../components/DetailFormItem'

//最外层电价查看弹窗
const { TabPane } = Tabs

interface Props {
  loading: boolean
  visible: boolean
  onCancel: () => void
  currentTimeZone: string
  recordInfo: any;
  action: any;
  nowPrice: any;
  priceChartData: any[]
  dealersEnums: any[]
  energyUnits_Generate: any[]
  energyUnits_Cost: any[]
  priceModalTabsVisible: boolean[]
}

const ShowElectrityDialog: React.FC<Props> = props => {
  const [tabNum, setTabNum] = useState(props.priceModalTabsVisible[0] ? 'Generation' : 'Cost')
  const [date, setDate] = useState(moment())
  const { recordInfo, nowPrice } = props

  const onChange = (e) => {
    if (e === tabNum) return
    setTabNum(e)
    props.updateState({ priceChartData: [] })
  }

  useEffect(() => {
    if (props.visible) props.dispatch({
      type: `${stationUpdateNS}/getEnergyUnits`,
      payload: { stationId: recordInfo.id, activity: true }
    })
  }, [props.visible])

  useEffect(() => {
    let day = getDateStr(date)
    if (tabNum == 'Generation') {
      props.action(`getNowGenerationPrice`, { stationId: recordInfo.id })
      props.action(`fetchPriceChartData`, {
        stationId: recordInfo.id,
        type: tabNum,
        dtime: `${day} 00:00:00,${day} 23:59:59`
      })
    } else {
      props.action(`getNowCostPrice`, { stationId: recordInfo.id })
      props.action(`fetchPriceChartData`, {
        stationId: recordInfo.id,
        type: tabNum,
        dtime: `${day} 00:00:00,${day} 23:59:59`
      })
    }
  }, [tabNum, date])

  let unit = recordInfo.currency == 'AUD' ? utils.intl('澳元/MWh') : utils.intl('元/kWh')

  return (
    <Modal title={utils.intl('当前执行电价')}
      visible={props.visible}
      onCancel={props.onCancel}
      width={'75%'}
      footer={null} className="electrict-detail-dialog"
      bodyStyle={{ height: 500, overflow: 'auto' }}
    >
      <div className="f-df flex-column" style={{ position: 'relative', height: '100%' }}>
        <div className="electric-detail-header" style={{ flexShrink: 0 }}>
          <div className="electric-detail-header-left">
            <Button
              style={{ marginRight: 8 }}
              onClick={() => {
                setDate(date.subtract(1, 'day').clone())
              }}
              disabled={getDateStr(date) <= getDateStr(moment(nowPrice.effectiveDate))}
            >{utils.intl('icon.前一天')}</Button>
            <DatePicker value={date} onChange={setDate} disabledDate={(date) => {
              let left = getDateStr(moment(nowPrice.effectiveDate))
              let right = getDateStr(moment())
              let now = getDateStr(date)
              return now < left || now > right
            }} allowClear={false} />
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => setDate(date.add(1, 'day').clone())}
              disabled={getDateStr(date) >= getDateStr(moment())}
            >{utils.intl('icon.后一天')}</Button>
          </div>
          <div className="electric-detail-header-right">
            <DetailFormItem
              noMargin
              label={utils.intl('生效时间')}
              value={<span style={{ color: '#ff974a' }}>{nowPrice.effectiveDate}</span>}
            />
            <div className="electric-detail-split-line wanke-split-line-color" />
            <DetailFormItem
              noMargin
              label={utils.intl('失效时间')}
              value={nowPrice.failureDate}
            />
          </div>
        </div>
        <Tabs className="origin-tab" onChange={onChange} type="card" activeKey={tabNum} style={{ flexShrink: 0 }}>
          {props.priceModalTabsVisible[0] ? (
            <TabPane tab={utils.intl('上网电价')} key="Generation">
            </TabPane>
          ) : null}
          {props.priceModalTabsVisible[1] ? (
            <TabPane tab={utils.intl('用电电价')} key="Cost">
            </TabPane>
          ) : null}
        </Tabs>
        <div className="f-df flex-column" style={{ height: '100%', position: 'relative', overflow: 'auto' }}>
          <div className="flex1 flex-wrap"
            style={{ width: '100%', height: '100%', position: 'relative', minHeight: '250px', overflow: 'auto' }}>
            {
              props.priceChartData.map((item, index) => {
                let grid = fillPrice24HoursData(item.grid || [], date)
                let noGrid = fillPrice24HoursData(item.nonGrid || [], date)
                return (
                  <div key={index} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                    {/* {
                      nowPrice.rangeType === 1 && (
                        <div>{utils.intl('能量单元')}：{
                          item.objectTitles.map((title, index) => {
                            return (
                              <span key={index} style={{margin: '0 7px'}}>{title}</span>
                            )
                          })
                        }
                        </div>
                      )
                    } */}
                    <LineChart
                      loading={props.loading}
                      series={tabNum === 'Generation' ? [{ name: utils.intl('上网电价'), unit }] : [{ name: utils.intl('用电电价'), unit }]}
                      xData={[grid.map(d => d.dtime)]}
                      yData={[grid.map(d => d.val)]}
                      options={{
                        startDate: date.startOf('day').valueOf(),
                        endDate: date.endOf('day').valueOf(),
                        dashList: [
                          [
                            transfromZoneTime(getDateStr(moment(), 'YYYY-MM-DD HH:mm:ss'), props.currentTimeZone, recordInfo.timeZone).valueOf(),
                            moment().endOf('day').valueOf()
                          ]
                        ]
                      }}
                    />
                  </div>
                )
              })
            }
          </div>
        </div>

      </div>
    </Modal>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  const { energyUnits_Generate, energyUnits_Cost } = state[stationUpdateNS]
  return {
    ...model,
    energyUnits_Generate, energyUnits_Cost,
    currentTimeZone: state[settingNS].timeZone,
    loading: getLoading('fetchPriceChartData')
  }
}

export default makeConnect(stationListNS, mapStateToProps)(ShowElectrityDialog)
