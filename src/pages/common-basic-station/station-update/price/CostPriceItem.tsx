import React, { useCallback, useEffect, useRef, useState } from 'react'
import PriceDetailDialog from './PriceDetailDialog'
import { FullLoading } from 'wanke-gui';
import RealTimeDialog from './RealTimeDialog'
import utils from '../../../../public/js/utils'
import SelectPriceInfo from './SelectPriceInfo'
import { GfPriceTitleOutlined } from 'wanke-icon';

interface Props {
  editable: boolean
  selectCost: any;
  priceRates: any[]
  onSelectCost: any;
  priceIdList: number;
  costPriceList: any[];
  fetchUsePriceListLoading: boolean
  onCostSearch: any;
  bindPriceSuccess: boolean
  fetchCostListLoading: boolean
  freshList: (type: string) => void
  getSpotCurve: (id: number) => void
  getSpotList: (type: string, query: string) => void
  spotPriceList: any[];
  fetchSpotListLoading: boolean;
  fetchPriceListLoading: boolean;
  spotCurve: any;
  getRealTimeData: any;
}

const CostPriceItem: React.FC<Props> = function (this: null, props) {
  const [showPriceDetail, setShowPriceDetail] = useState(false)
  const [showPriceSelect, setShowPriceSelect] = useState(false)
  const [showRealPriceDetail, setShowRealPriceDetail] = useState(false)

  useEffect(() => {
    if (props.bindPriceSuccess) {
      setShowPriceSelect(false)
    }
  }, [props.bindPriceSuccess])

  useEffect(() => {
    if (showPriceSelect) {
      props.freshList('Cost');
    }
  }, [showPriceSelect])

  useEffect(() => {
    if (showRealPriceDetail) {
      props.getSpotCurve(props.priceIdList)
    }
  }, [showRealPriceDetail])

  return (
    <div className="price-item">
      {
        showPriceDetail && (
          <PriceDetailDialog
            selectCost={props.selectCost}
            priceRates={props.priceRates}
            visible={showPriceDetail}
            onExited={() => setShowPriceDetail(false)}
          />
        )
      }
      {
        showRealPriceDetail && (
          <RealTimeDialog
            detail={props.selectCost}
            spotCurve={props.spotCurve}
            visible={showRealPriceDetail}
            onExited={() => setShowRealPriceDetail(false)}
          />
        )
      }
      {
        showPriceSelect && (
          <SelectPriceInfo
            costInfo={props.selectCost}
            // priceRates={props.priceRates}
            visible={showPriceSelect}
            onExited={() => setShowPriceSelect(false)}
            priceList={props.costPriceList}
            modelTitle={utils.intl("选择用电信息")}
            priceIdList={props.priceIdList}
            // loading={props.savePriceLoading}
            onSelectCost={props.onSelectCost}
            onCostSearch={props.onCostSearch}
            listLoading={props.fetchCostListLoading}
            getSpotList={props.getSpotList}
            spotList={props.spotPriceList}
            fetchSpotListLoading={props.fetchSpotListLoading}
          />
        )
      }
      {
        (props.fetchPriceListLoading || props.fetchUsePriceListLoading) && (<FullLoading />)
      }
      {
        props.selectCost?.id && (
          <>
            <div style={{ fontSize: 14, marginBottom: 5, position: 'absolute', width: '100%', left: 0, top: 0, borderBottom: '1px solid #dedede', height: 32 }}>
              <GfPriceTitleOutlined style={{ fontSize: 20, marginLeft: 20, top: 5, position: 'relative', color: '#177ddc' }} />
              <span style={{ marginLeft: 10, top: 3, position: 'relative' }}>{props.selectCost?.tabType}</span>
            </div>
            <a style={{ position: 'relative', top: '-7px', float: 'right', marginLeft: '5px' }} onClick={() => {
              if (props.selectCost?.tabType === utils.intl("固定电价")) {
                setShowPriceDetail(true)
              }
              else {
                setShowRealPriceDetail(true)
                props.getRealTimeData();
              }
            }}>{utils.intl("详情")}</a>
            <a style={{ position: 'relative', top: '-7px', float: 'right' }} onClick={() => setShowPriceSelect(true)}>{utils.intl("编辑")}</a>
          </>
        )
      }
      {props.selectCost?.id && (
        <div style={{ fontSize: 14, marginTop: 25 }}>{utils.intl("电价名称") + '：' + props.selectCost?.title}</div>

      )}
      {
        !props.selectCost?.id && (
          <div className="vh-center select-item">
            <div className="v-center" style={{ background: '#9B9B9B', borderRadius: 4 }}>
              <a className="select-item-text" onClick={() => { setShowPriceSelect(true) }}>{utils.intl("绑定")}</a>
              {/* <a style={{ margin: '0 7px' }} onClick={() => setShowPriceDetail(true)}>{utils.intl("详情")}</a> */}
            </div>
          </div>
        )
      }
      {/* {
        props.isSelect && (
          <div className="vh-center selected-item">
            <div>{utils.intl("当前选择")}</div>
          </div>
        )
      } */}
      {
        props.selectCost?.id && props.selectCost?.tabType === utils.intl("固定电价") && props.selectCost?.seasonPrices && props.selectCost?.seasonPrices.map(item => {
          return (
            <div className="month-item">
              <div className="month">{item.runMonth}{utils.intl("月")}</div>
              <div className="content flex-wrap">
                {
                  item.seasonPriceDetails.map((item, index) => {
                    return (
                      <div key={index} style={{ whiteSpace: 'nowrap' }}>
                        {item.startTime}-{item.endTime}：{item.price} {utils.intl(props.selectCost?.currency) + "/kWh"}
                      </div>
                    )
                  })
                }
              </div>
            </div>
          )
        })
      }
      {
        props.selectCost?.id && (
          <div style={{ fontSize: 14 }}>{utils.intl("适用地区")}：{props.selectCost?.area}</div>
        )
      }
    </div>
  )
}

export default CostPriceItem
