import React, { useEffect } from 'react'
import Page from "../../components/Page"
import PageProps from "../../interfaces/PageProps"
import ListIndicator from './ListIndicator'
import { IndicatorConfigState } from './models/indicator-config-list'
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { makeConnect } from "../umi.helper"
import { indicator_config } from "../constants"
import SearchBox from "../../components/layout/SearchBox"
import FullContainer from "../../components/layout/FullContainer"
import { Button, Input } from 'wanke-gui'
import AddIndicatorDialog from './AddIndicatorDialog'
import moment from 'moment'
import Tools from "../../components/layout/Tools"
import Export from "../../components/layout/Export"
import { CrumbsPortal } from '../../frameset/Crumbs'
import utils from '../../public/js/utils'
import FormLayout from '../../components/FormLayout'
import "./index.less"

const { FieldItem } = FormLayout

interface Props extends PageProps, IndicatorConfigState, MakeConnectProps<IndicatorConfigState> {
  loading: boolean;
  configLoading: boolean
  curTime: string;
}

const IndicatorConfig: React.FC<Props> = function (this: null, props) {
  const onAdd = () => {
    props.updateState({
      showAdd: true,
      configId: null,
      stationId: null,
      stationScale: null,
      scaleDisplay: '',
      scaleUnit: null,
      dailyChargeTarget: null,
      dailyDischargeTarget: null,
      dailyProfitTarget: null,
      profitDeviationThreshold: null,
      effectTime: null
    })
  }

  const onEdit = (record) => {
    const {
      id, stationId, stationScale, stationScaleUnit, dailyChargeTarget, stationScaleDisplay,
      dailyDischargeTarget, dailyProfitTarget, profitDeviationThreshold, effectTime
    } = record
    props.updateState({
      showAdd: true,
      configId: id,
      stationId,
      stationScale,
      scaleDisplay: stationScaleDisplay,
      scaleUnit: stationScaleUnit,
      dailyChargeTarget,
      dailyDischargeTarget,
      dailyProfitTarget,
      profitDeviationThreshold,
      effectTime: effectTime ? moment(effectTime) : null,
    })
  }

  const onDelete = (id) => {
    props.action('deleteIndexConfig', { id })
  }

  const onSearch = () => {
    props.updateQuery({ page: 1 })
    props.action('fetchList')
  }

  useEffect(() => {
    props.action('reset')
    props.action('fetchList')
    props.action('fetchStationList')
  }, [])

  const disableColumnOperation = (record) => {
    if (!record.effectTime) return false
    if (record.effectTime && moment(record.effectTime).add(14, 'days').isBefore(props.curTime)) return true
    return false
  }

  const { query, totalCount } = props

  return (
    <Page
      pageId={props.pageId}
    // style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}
    >
      <CrumbsPortal>
        <Button type="primary" onClick={onAdd}>{utils.intl('新增')}</Button>
        <Button style={{ marginLeft: '16px' }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      {
        props.showAdd && (
          <AddIndicatorDialog
            updateState={props.updateState}
            action={props.action}
            configId={props.configId}
            stationList={props.stationList}
            stationId={props.stationId}
            stationScale={props.stationScale}
            scaleUnit={props.scaleUnit}
            scaleDisplay={props.scaleDisplay}
            dailyChargeTarget={props.dailyChargeTarget}
            dailyDischargeTarget={props.dailyDischargeTarget}
            dailyProfitTarget={props.dailyProfitTarget}
            profitDeviationThreshold={props.profitDeviationThreshold}
            effectTime={props.effectTime}

            addConfig={() => props.action('addIndexConfig')}
            updateConfig={() => props.action('updateIndexConfig')}
            confirmLoading={props.configLoading}
            visible={props.showAdd}
            onExited={() => props.updateState({ showAdd: false })}
          />
        )
      }
      {/* <FormLayout onSearch={onSearch} onReset={() => props.updateQuery({ queryStr: undefined })}>
        <FieldItem label={utils.intl('关键字')}>
          <Input value={query.queryStr} placeholder={utils.intl('请输入关键字查询')} onChange={(e) => props.updateQuery({ queryStr: e.target.value })} />
        </FieldItem>
      </FormLayout> */}
      <FullContainer
      // className="page-sub-container"
      >
        <div className="h-space page-header-line">
          <SearchBox searchKey={query.queryStr} onChange={v => props.updateQuery({ queryStr: v })} onSearch={onSearch} />
        </div>
        <div className="flex1" style={{ flex: 1, borderRadius: 4, padding: 16 }}>
          <ListIndicator
            loading={props.loading}
            page={query.page} size={query.size} onPageChange={props.onPageChange('fetchList')}
            onEdit={onEdit} onDelete={onDelete} total={totalCount}
            disableColumnOperation={disableColumnOperation}
            dataSource={props.list} />
        </div>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading, state) {
  const { time } = state.global
  return {
    ...model,
    loading: getLoading('fetchList'),
    configLoading: getLoading('addIndexConfig') || getLoading('updateIndexConfig'),
    curTime: `${time.year}-${time.month}-${time.day}`
  }
}

export default makeConnect(indicator_config, mapStateToProps)(IndicatorConfig)
