/**
 * 当前电价查看页面
 */

import React, { useEffect } from 'react'
import utils from '../../../public/js/utils'
import "./styles/price-look.less"
import { monthList, priceRate } from './tab-price-component/dataCfg'

interface Props {
  price: any; // 电价对象
  priceTitle?: string; // 电价名称
  priceTypeTitle: string; // 电价类型名称
  extraTitle: string;
  maps: any; // 相关枚举
  onExtraTitleClick?: () => void
}

const PriceLook: React.FC<Props> = (props) => {
  const { price = {}, priceTypeTitle, priceTitle, extraTitle, maps, onExtraTitleClick } = props
  // useEffect(() => {
  //   console.log('price', price)
  // }, [JSON.stringify(price)])
  return (
    <div className="price-look-box">
      {
        onExtraTitleClick ? (
          <div className="price-look-header">
            {priceTypeTitle}
            <div className="price-look-header-right" onClick={() => onExtraTitleClick()}>{extraTitle}</div>
          </div>
        ) : null
      }
      <div className="price-look-body">
        {
          priceTitle ? (
            <div className="price-look-body-header">
              {priceTitle}
            </div>
          ) : (
            <div className="price-look-body-item" style={{ display: "inline-block" }}>
              <span>{utils.intl('电价名称')}</span>
              <div className="price-look-body-item-value">{price.title}</div>
            </div>
          )
        }
        <div className="price-look-body-item" style={{ display: "inline-block" }}>
          <span>{utils.intl('生效时间')}</span>
          <div className="price-look-body-item-value">{price.effectiveDate}</div>
        </div>
        <div className="price-look-body-item" style={{ display: "inline-block" }}>
          <span>{utils.intl('失效时间')}</span>
          <div className="price-look-body-item-value">{price.failureDate}</div>
        </div>
        {
          price.electricityPriceDetails?.[0]?.dealers?.[0]?.monthsList?.map(item => (
            <div className="month-list-item">
              <div className="price-look-body-item">
                <span>{utils.intl('适用月份')}</span>
                <div className="price-look-body-item-value">{monthList.filter(i => (item.months ?? []).indexOf(i.value) > -1).map(i => i.label).join('；')}</div>
              </div>
              <div className="price-look-body-item">
                <span>{utils.intl('电价模式')}</span>
                <div className="price-look-body-item-value">{priceRate.find(i => i.value === item.type)?.label}</div>
              </div>
              {
                item.type === 'Single' ? // 单费率
                  (
                    <div className="price-look-body-item">
                      <span>{priceTypeTitle}</span>
                      <div className="price-look-body-item-value">{item.price} {utils.intl('元')}/kWh</div>
                    </div>
                  ) : item.type === "RealTime" ? // 实时电价
                    (
                      <div className="price-look-body-item">
                        <span>{priceTypeTitle}</span>
                        <div className="price-look-body-item-value">{maps.realTimePriceMap?.find(i => i.value === item.realTimePrice)?.label}</div>
                      </div>
                    ) : item.type === "Multiple" ? // 复费率
                      (
                        <>
                          <div className="price-look-body-item">
                            <span>{utils.intl('费率分段')}</span>
                            <div className="price-look-body-item-value">{maps.multipleTypeMap?.filter(i => Object.keys(item.priceDetails ?? {}).indexOf(`${i.value}`) > -1).map(i => i.label).join('；')}</div>
                          </div>
                          {
                            Object.keys(item.priceDetails ?? {}).map(key =>{
                              const i = item.priceDetails[key];
                              const title = maps.multipleTypeMap?.find(ii => `${ii.value}` === key)?.label;
                              const timeRange =  i.timeRange?.map(t => t.startTime ? `${t.startTime.format('HH:mm:ss')}~${t.endTime.format('HH:mm:ss')}` : t)?.join('；')
                              return (
                                  <div>
                                    <div className="price-look-body-item" style={{ display: "inline-block" }}>
                                      <span>{utils.intl(`${title}${utils.intl('price.价格')}`)}</span>
                                      <div className="price-look-body-item-value">{i.price} {utils.intl('元')}/kWh</div>
                                    </div>
                                    <div className="price-look-body-item" style={{ display: "inline-block" }}>
                                      <span>{utils.intl("时段")}</span>
                                      <div className="price-look-body-item-value">{timeRange}</div>
                                    </div>
                                  </div>
                                )
                            })
                            // Object.values(item.priceDetails ?? {}).map(i => (
                            //   <div>
                            //     <div className="price-look-body-item" style={{ display: "inline-block" }}>
                            //       <span>{utils.intl(`${i.priceRate?.title ?? }价格`)}</span>
                            //       <div className="price-look-body-item-value">{i.price} {utils.intl('元')}/kWh</div>
                            //     </div>
                            //     <div className="price-look-body-item" style={{ display: "inline-block" }}>
                            //       <span>{utils.intl("时段")}</span>
                            //       <div className="price-look-body-item-value">{i.timeRange?.join('；')}</div>
                            //     </div>
                            //   </div>
                            // ))
                          }
                        </>
                      ) : null
              }
            </div>
          )) ?? null
        }
      </div>
    </div>
  )
}

export default PriceLook
