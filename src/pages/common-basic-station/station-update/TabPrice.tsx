import React, { useCallback, useEffect, useRef, useState } from 'react'
import { message } from 'wanke-gui'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import Header from '../../../components/Header'
import GeneratePriceItem from './price/GeneratePriceItem'
import CostPriceItem from './price/CostPriceItem'
import FullContainer from '../../../components/layout/FullContainer'
import Tools from '../../../components/layout/Tools'
import Back1 from '../../../components/layout/Back1'
import utils from '../../../public/js/utils'

//电价页签 弃用
interface Props extends ActionProp {
  editable: boolean
  stationId: number
  costPriceList: any[]
  generatePriceList: any[]
  priceRates: any[]
  fetchPriceRates: () => void
  bindSuccess: boolean
  costId: number
  generateId: number
  fetchStationPriceInfoSuccess: boolean
  back: () => void
  price: any;
  // priceList: any[];
  action: any;
  generation: any;
  fetchUsePriceListLoading: boolean
  fetchPriceGenerateListLoading: boolean
  fetchCostListLoading: boolean
  fetchGenerateListLoading: boolean
  costSpotPriceList: any[];
  generateSpotPriceList: any[];
  fetchSpotListLoading: boolean;
  fetchPriceListSuccess: boolean;
  fetchPriceListLoading: boolean;
  spotCurve: any;
  
}
const TabPrice: React.FC<Props> = function (this: null, props) {
  const [hoverId, setHoverId] = useState(null)
  const [selectCostId, setSelectCostId] = useState(null)
  const [selectGenerateId, setSelectGenerateId] = useState(null)
  const newSelectInfo = useRef<{ type: string, id: number }>()
  const [costInfo, setCostInfo] = useState(null)
  const [generateInfo, setGenerateInfo] = useState(null)

  useEffect(() => {
    props.fetchPriceRates()
    props.action('fetchAllPriceList');
  }, [])

  useEffect(() => {
    if (props.fetchStationPriceInfoSuccess) {
      setSelectCostId(props.costId)
      setSelectGenerateId(props.generateId)
    }
  }, [props.fetchStationPriceInfoSuccess])

  useEffect(() => {
    if (props.fetchPriceListSuccess) {
      props.action('fetchStationPriceInfo', { stationId: props.stationId })
    }
  }, [props.fetchPriceListSuccess])

  useEffect(() => {
    if (props.costPriceList.find(item => item.id === props.costId)) {
      setCostInfo({ ...props.costPriceList.find(item => item.id === props.costId), tabType: utils.intl("固定电价") })
    } else {
      setCostInfo({ ...props.costSpotPriceList.find(item => item.id === props.costId), tabType: utils.intl("实时电价") })
    }
  }, [props.fetchStationPriceInfoSuccess])

  useEffect(() => {
    if (props.generatePriceList.find(item => item.id === props.generateId)) {
      setGenerateInfo({ ...props.generatePriceList.find(item => item.id === props.generateId), tabType: utils.intl("固定电价") })
    } else {
      setGenerateInfo({ ...props.generateSpotPriceList.find(item => item.id === props.generateId), tabType: utils.intl("实时电价") })
    }
  }, [props.fetchStationPriceInfoSuccess])

  useEffect(() => {
    if (props.bindSuccess) {
      props.action('fetchStationPriceInfo', { stationId: props.stationId })
      const { type, id, } = newSelectInfo.current
      if (type == 'cost') {
        setSelectCostId(id)
        // setCostInfo(costInfo)
      } else if (type == 'generate') {
        setSelectGenerateId(id)
        // setGenerateInfo(generateInfo);
      }
      message.success(utils.intl('绑定成功'))
    }
  }, [props.bindSuccess])

  const onSelectCost = useCallback((obj, string) => {
    newSelectInfo.current = { type: 'cost', id: obj.id }
    props.action('bindStationAndPrice', { stationId: props.stationId, type: 'cost', priceId: obj.id, tabType: string })
  }, [])

  const onSelectGenerate = useCallback((obj, string) => {
    newSelectInfo.current = { type: 'generate', id: obj.id }
    props.action('bindStationAndPrice', { stationId: props.stationId, type: 'generate', priceId: obj.id, tabType: string })
  }, [])

  const onCostSearch = (queryStr) => {
    props.action('fetchUsePriceList', { queryStr });
  }

  const onGenerateSearch = (queryStr) => {
    props.action('fetchPriceGenerateList', { queryStr });
  }

  const freshList = (string) => {
    props.action('fetchPriceList', { string });
  }

  const getSpotCurve = (id) => {
    props.action('getSpotCurve', { id: id });
  }

  const getSpotList = (string, queryStr) => {
    props.action('getSpotList', { string, queryStr });
  }

  const getRealTimeData = (string, queryStr) => {
    props.action('fetchRealTime');
  }
  return (
    <FullContainer>
      <div className="flex1" style={{ overflowY: 'auto', padding: 15 }}>
        <Header title={utils.intl("用电信息")}></Header>
        <div className="flex-wrap">
          {/* {
            props.costPriceList.map(price => {
              return (
                <CostPriceItem
                  key={price.id}
                  editable={props.editable}
                  id={price.id}
                  title={price.title}
                  isSelect={selectCostId == price.id}
                  isHover={hoverId == price.id}
                  onHover={setHoverId}
                  onSelect={onSelectCost}
                  seasonPrices={price.seasonPrices}
                  priceRates={props.priceRates}
                  loading={props.bindStationAndPriceLoading && newSelectInfo?.current?.id == price.id}
                />
              )
            })
          } */}
          <CostPriceItem
            costPriceList={props.costPriceList}
            editable={props.editable}
            // isSelect={selectCostId == props.price.id}
            // isHover={hoverId == props.price.id}
            // onHover={setHoverId}
            bindPriceSuccess={props.bindSuccess}
            onCostSearch={onCostSearch}
            onSelectCost={onSelectCost}
            selectCost={costInfo}
            // seasonPrices={props.costPriceList.find(item => item.id === selectCostId) ?.seasonPrices}
            priceRates={props.priceRates}
            priceIdList={selectCostId}
            fetchUsePriceListLoading={props.fetchUsePriceListLoading}
            fetchCostListLoading={props.fetchCostListLoading}
            freshList={freshList}
            getSpotCurve={getSpotCurve}
            getSpotList={getSpotList}
            spotPriceList={props.costSpotPriceList}
            fetchSpotListLoading={props.fetchSpotListLoading}
            fetchPriceListLoading={props.fetchPriceListLoading}
            spotCurve={props.spotCurve}
            getRealTimeData={getRealTimeData}
          />
        </div>

        <Header title={utils.intl("发电信息")}></Header>
        <div className="flex-wrap">
          {/* {
            props.generatePriceList.map(price => {
              return (
                <GeneratePriceItem
                  key={price.id}
                  editable={props.editable}
                  id={price.id}
                  title={price.title}
                  pvPrice={price.pvPrice}
                  windPrice={price.windPrice}
                  isSelect={selectGenerateId == price.id}
                  isHover={hoverId == price.id}
                  onHover={setHoverId}
                  onSelect={onSelectGenerate}
                  loading={props.bindStationAndPriceLoading && newSelectInfo ?.current ?.id == price.id}
                />
              )
            })
          } */}
          <GeneratePriceItem
            editable={props.editable}
            generatePriceList={props.generatePriceList}
            onGenerateSearch={onGenerateSearch}
            bindPriceSuccess={props.bindSuccess}
            selectGenerate={generateInfo}
            // isSelect={selectGenerateId == props.generation.id}
            // isHover={hoverId == props.generation.id}
            // onHover={setHoverId}
            onSelectGenerate={onSelectGenerate}
            priceIdList={selectGenerateId}
            fetchPriceGenerateListLoading={props.fetchPriceGenerateListLoading}
            fetchGenerateListLoading={props.fetchGenerateListLoading}
            freshList={freshList}
            getSpotCurve={getSpotCurve}
            spotPriceList={props.generateSpotPriceList}
            getSpotList={getSpotList}
            fetchSpotListLoading={props.fetchSpotListLoading}
            fetchPriceListLoading={props.fetchPriceListLoading}
            spotCurve={props.spotCurve}
            getRealTimeData={getRealTimeData}
          />
        </div>
      </div>
      <Tools height={40}>
        {/* <Back1 back={props.back} /> */}
      </Tools>
    </FullContainer>
  )
}

export default TabPrice