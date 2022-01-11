import React from 'react'
import { Modal } from 'wanke-gui'
import utils from '../../../../public/js/utils'

interface Props {
  visible: boolean
  onExited: () => void
  priceRates?: any[]
  title?: string
  seasonPrices?: any[]
  selectGenerate?: any;
  selectCost?: any;
}

const PriceDetailDialog: React.FC<Props> = function (this: null, props) {
  const getPeriodName = id => {
    let match = props.priceRates.find(e => e.value == id)
    if (match) {
      return match.name
    }
  }

  return (
    <Modal
      width={550}
      title={utils.intl("固定电价详情")}
      visible={props.visible}
      onCancel={props.onExited}
      footer={null}
      className="price-detail-dialog"
    >
      <div className="">
        {props.selectCost?.seasonPrices && <span className="month" style={{ fontSize: 14 }}>{utils.intl("适用地区")}：{props.selectCost?.area}</span>}
        {
          props.selectCost?.seasonPrices && props.selectCost?.seasonPrices.map(item => {
            return (
              <div className="month-item">
                <div className="month">{item.runMonth}{utils.intl("月")}</div>
                <div className="content flex-wrap">
                  {item.seasonPriceDetails.map((item, index) => {
                    return (
                      <div key={index} style={{ minWidth: 230, whiteSpace: 'nowrap' }}>
                        {item.startTime}-{item.endTime}：{item.price} {utils.intl(props.selectCost?.currency) + "/kWh"}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        }
        {
          props.selectGenerate && (
            <div className="month-item">
              <div className="month">{props.selectGenerate.title}<span style={{ fontSize: 14, marginLeft: '20px' }}>{utils.intl("适用地区")}：{props.selectGenerate?.area}</span></div>
              <div className="content flex-wrap">
                <section style={{ width: '100%' }}>{`${utils.intl("光伏发电")}：`}{props.selectGenerate?.pvPrice}{utils.intl(props.selectGenerate?.currency) + "/kWh"}</section>
                <section style={{ width: '100%' }}>{`${utils.intl("风力发电")}：`}{props.selectGenerate?.windPrice}{utils.intl(props.selectGenerate?.currency) + "/kWh"}</section>
              </div>
            </div>
          )
        }
      </div>
    </Modal>
  )
}

export default PriceDetailDialog
