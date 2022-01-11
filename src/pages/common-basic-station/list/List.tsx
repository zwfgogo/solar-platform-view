import React, { useEffect, useState } from 'react'
import { Select, Button, Row, Col, message, Input } from 'wanke-gui'
import ShowElectrityDialog from './ShowElectrityDialog'
import { withAll } from '../../../public/js/utils'
import utils from '../../../public/js/utils'
import { getAction, makeConnect } from '../../umi.helper'
import { enumsNS, globalNS, Mode, stationListNS } from '../../constants'
import Page from '../../../components/Page'
import List10 from './List10'
import FullContainer from '../../../components/layout/FullContainer'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { StationListState } from '../models/station-list'
import AddStationDialog from './AddStationDialog'
import { ValueName } from '../../../interfaces/CommonInterface'
import usePageSize from '../../../hooks/usePageSize'
import { CrumbsPortal } from '../../../frameset/Crumbs'
import FormLayout from '../../../components/FormLayout'
import { patchStationAuthority } from '../../../services/global2'
import { isZh } from '../../../core/env'

// 最外层页面
const { FieldItem } = FormLayout
interface Props extends PageProps, MakeConnectProps<StationListState>, StationListState {
  stationTypes: ValueName[]
  loading: boolean
  exportLoading: boolean
  detailLoading: boolean
  statusChangeSuccess: boolean
  roleName: string
  firm: any
}

const Layout: React.FC<Props> = function (this: null, props) {
  const [stationStatus, setStationStatus] = useState(-1)
  const [searchText, setSearchText] = useState('')
  const [pageSize, setPageSize] = usePageSize()
  const [showPriceDialog, setShowPriceDialog] = useState(false)
  const [showAddStationDialog, setShowAddStationDialog] = useState(false)
  const [recordInfo, setRecordInfo] = useState({})

  const handleStatusChange = (stationId, status) => {
    props.action('statusChange', { stationId, status })
  }

  const handlePlatformChange = (stationId, flag) => {
    patchStationAuthority({
      id: stationId,
      hasBatteryHealthPlatform: flag,
    }).then(data => {
      message.success(utils.intl('操作成功'))
      fetchList()
      props.dispatch({ type: `${globalNS}/fetchStationList` })
    })
  }

  const onExport = () => {
    props.action('onExport', {
      stationStatusId: stationStatus == -1 ? null : stationStatus,
      queryStr: searchText,
      // 展示建设中的
      started: false,
    })
  }

  const fetchList = () => {
    props.action('fetchList', {
      page: pageSize.page,
      size: pageSize.size,
      stationStatusId: stationStatus == -1 ? null : stationStatus,
      queryStr: searchText,
      // 展示建设中的
      started: false,
      queryFields: 'title,operatorTitle,stationTypeTitle'
    })
  }

  const lookStation = station => {
    setRecordInfo(station)
    props.action('initPriceModal', { stationId: station.id }).then(() => {
      setShowPriceDialog(true)
    })
  }

  const toAddStation = (stationType) => {
    setShowAddStationDialog(false)
    props.forward('stationUpdate', { energyUnitStatusOptions: props.energyUnitStatusOptions, stationStatusOptions: props.stationStatusOptions, mode: Mode.add, stationType })
  }

  useEffect(() => {
    props.action('fetchStationStatus')
    props.action('fetchEnergyUnitStatus')
    // props.action('$getStationStatusOperationMap')
    props.action('fetchElectricityPeriodEnum')
    // fetchList()
  }, [])

  useEffect(() => {
    fetchList()
  }, [pageSize])

  // useEffect(() => {
  //   if (props.statusChangeSuccess) {
  //     message.success(utils.intl('切换状态成功'))
  //     fetchList()
  //   }
  // }, [props.statusChangeSuccess])

  // render
  let { list, periodEnumList, rules1, rules2, stationStatusOptions, loading } = props
  const { total } = props

  return (
    <Page
      pageId={props.pageId}
      className={'station-list-page no-limit-filter-item'}
      onNeedUpdate={() => setPageSize(1, pageSize.size)}
      onActivity={fetchList}
      style={{ background: "transparent", display: "flex", flexDirection: "column" }}
    >
      <CrumbsPortal pageName="list">
        <Button style={{ marginLeft: 16 }} type="primary" onClick={() => setShowAddStationDialog(true)}>
          {utils.intl('新增')}
        </Button>
        <Button style={{ marginLeft: 16 }} type="primary" onClick={onExport}>
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      {
        showAddStationDialog && (
          <AddStationDialog
            visible={showAddStationDialog}
            fetchStationTypes={() => props.dispatch(getAction(enumsNS, 'fetchStationTypes'))}
            stationTypes={props.stationTypes}
            onExited={() => setShowAddStationDialog(false)}
            onConfirm={toAddStation}
          />
        )
      }
      {
        showPriceDialog && (
          <ShowElectrityDialog
            priceModalTabsVisible={props.priceModalTabsVisible}
            loading={props.detailLoading}
            visible={showPriceDialog}
            onCancel={() => setShowPriceDialog(false)}
            recordInfo={recordInfo}
          />
        )
      }
      <FormLayout
        onSearch={fetchList}
        onReset={() => {
          setStationStatus(-1)
          setSearchText('')
        }}>
        <FieldItem label={utils.intl('电站状态')}>
          <Select
            value={stationStatus}
            onChange={setStationStatus}
            style={{ minWidth: isZh() ? 163 : 145 }}
            dataSource={withAll(stationStatusOptions, { value: -1, name: utils.intl('全部') })}
          ></Select>
        </FieldItem>
        <FieldItem label={utils.intl('关键字')}>
          <Input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder={utils.intl('请输入关键字查询')}
          />
        </FieldItem>
      </FormLayout>
      <FullContainer className="page-sub-container">
        <div className="flex1">
          <List10
            roleName={props.roleName}
            firm={props.firm}
            loading={loading} dataSource={list}
            total={total} page={pageSize.page} size={pageSize.size} onPageChange={setPageSize}
            lookStation={lookStation}
            handleStatusChange={handleStatusChange}
            stationStatusOptions={props.stationStatusOptions}
            stationStatusMap={props.stationStatusMap}
            action={props.action}
            energyUnitStatusOptions={props.energyUnitStatusOptions}
            handlePlatformChange={handlePlatformChange}
          />
        </div>
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    roleName: state[globalNS].roleName,
    firm: state[globalNS].firm,
    stationTypes: state[enumsNS].stationTypes,
    loading: getLoading('fetchList'),
    exportLoading: getLoading('onExport'),
    detailLoading: getLoading('fetchStationDetail'),
    statusChangeSuccess: isSuccess('statusChange')
  }
}

export default makeConnect(stationListNS, mapStateToProps)(Layout)
