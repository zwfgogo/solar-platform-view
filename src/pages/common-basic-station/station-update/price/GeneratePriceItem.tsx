import React, { useCallback, useEffect, useRef, useState } from 'react'
import utils from '../../../../public/js/utils'
import PriceDetailDialog from './PriceDetailDialog'
import SelectPriceInfo from './SelectPriceInfo'
import { GfPriceTitleOutlined } from 'wanke-icon';
import { FullLoading } from 'wanke-gui';
import RealTimeDialog from './RealTimeDialog'

interface Props {
  editable: boolean
  priceIdList: number;
  fetchPriceGenerateListLoading: boolean
  onSelectGenerate: any;
  selectGenerate: any;
  generatePriceList: any;
  onGenerateSearch: any;
  bindPriceSuccess: any;
  fetchGenerateListLoading?: boolean;
  freshList: (type: string) => void
  getSpotList: (type: string, query: string) => void
  spotPriceList: any[];
  fetchSpotListLoading: boolean;
  fetchPriceListLoading: boolean;
  getSpotCurve: (id: number) => void
  spotCurve: any;
  getRealTimeData: any;
}

const GeneratePriceItem: React.FC<Props> = function (this: null, props) {
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
      props.freshList('Generation');
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
            // title={props.title}
            selectGenerate={props.selectGenerate}
            visible={showPriceDetail}
            onExited={() => setShowPriceDetail(false)}
          />
        )
      }
      {
        showRealPriceDetail && (
          <RealTimeDialog
            detail={props.selectGenerate}
            spotCurve={props.spotCurve}
            visible={showRealPriceDetail}
            onExited={() => setShowRealPriceDetail(false)}
          />
        )
      }
      {(props.fetchPriceListLoading || props.fetchPriceGenerateListLoading) && (<FullLoading />)}
      {
        showPriceSelect && (
          <SelectPriceInfo
            // title={props.title}
            visible={showPriceSelect}
            onExited={() => setShowPriceSelect(false)}
            priceList={props.generatePriceList}
            modelTitle={utils.intl("选择发电信息")}
            priceIdList={props.priceIdList}
            onSelectGenerate={props.onSelectGenerate}
            onGenerateSearch={props.onGenerateSearch}
            spotList={props.spotPriceList}
            listLoading={props.fetchGenerateListLoading}
            getSpotList={props.getSpotList}
            fetchSpotListLoading={props.fetchSpotListLoading}
            generateInfo={props.selectGenerate}
          />
        )
      }
      {
        !props.selectGenerate?.id && (
          <div className="vh-center select-item">
            <div className="select-item-text" onClick={() => { setShowPriceSelect(true) }}>{utils.intl("绑定")}</div>
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
        props.selectGenerate?.id && (
          <>
            <div style={{ fontSize: 14, marginBottom: 5, position: 'absolute', width: '100%', left: 0, top: 0, borderBottom: '1px solid #dedede', height: 32 }}>
              <GfPriceTitleOutlined style={{ fontSize: 20, marginLeft: 20, top: 5, position: 'relative', color: '#177ddc' }} />
              <span style={{ marginLeft: 10, top: 3, position: 'relative' }}>{props.selectGenerate?.tabType}</span>
            </div>
            <a style={{ position: 'relative', top: '-7px', float: 'right', marginLeft: '5px' }} onClick={() => {
              if (props.selectGenerate?.tabType === utils.intl("固定电价")) {
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
      {props.selectGenerate?.id && (
        <div style={{ fontSize: 14, marginTop: 25 }}>{utils.intl("电价名称") + '：' + props.selectGenerate?.title}</div>
      )}
      {
        props.selectGenerate?.id && props.selectGenerate?.tabType === utils.intl("固定电价") && (
          <div>
            <section>{`${utils.intl("光伏发电")}：`}{props.selectGenerate?.pvPrice}{utils.intl(props.selectGenerate?.currency) + "/kWh"}</section>
            <section>{`${utils.intl("风力发电")}：`}{props.selectGenerate?.windPrice}{utils.intl(props.selectGenerate?.currency) + "/kWh"}</section>
          </div>
        )
      }
      {
        props.selectGenerate?.id && (
          <div style={{ fontSize: 14 }}>{utils.intl("适用地区")}：{props.selectGenerate?.area}</div>
        )
      }
    </div>
  )
}

export default GeneratePriceItem
