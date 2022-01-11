import React, { useEffect } from 'react'
import PageProps from "../../interfaces/PageProps"
import Page from "../../components/Page"
import FullContainer from "../../components/layout/FullContainer"
import { makeConnect } from "../umi.helper"
import { fee_query_station_list } from "../constants"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import ListStation from './ListStation'
import SearchBox from "../../components/layout/SearchBox"
import { FeeQueryStationListState } from './models/station-list'
import Export from "../../components/layout/Export"
import Tools from "../../components/layout/Tools"
import { Button, Input } from 'wanke-gui'
import { CrumbsPortal } from '../../frameset/Crumbs'
import utils from '../../public/js/utils'
import FormLayout from '../../components/FormLayout'

const SearchInput = Input.Search

const { FieldItem } = FormLayout
interface Props extends PageProps, FeeQueryStationListState, MakeConnectProps<FeeQueryStationListState> {
  loading: boolean
}

const EntryStationList: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.action('reset')
    props.action('fetchStationList')
  }, [])

  const onPageChange = (page, size) => {
    props.updateQuery({ page, size })
    props.action('fetchStationList')
  }

  const onSearch = () => {
    props.updateQuery({ page: 1 })
    props.action('fetchStationList')
  }

  const { query } = props
  return (
    <Page pageId={props.pageId} style={{ background: "transparent", boxShadow: "none", display: "flex", flexDirection: "column" }}>
      <CrumbsPortal pageName={'list'}>
        <Button style={{ marginLeft: '16px' }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <FullContainer className="page-sub-container has-filter-header" style={{ marginTop: 0 }}>
        <div className="filter-header">
          <SearchInput
            style={{ width: 260 }}
            value={query.queryStr}
            placeholder={utils.intl('请输入关键字查询')}
            onChange={(e) => props.updateQuery({ queryStr: e.target.value })}
            onSearch={onSearch}
          />
        </div>
        <div className="flex1">
          <ListStation
            loading={props.loading}
            lookStation={(record) => props.forward('fee-list', { stationId: record.id, pageTitle: record.title })} dataSource={props.list}
            page={query.page} total={props.totalCount} size={query.size} onPageChange={onPageChange}
          />
        </div>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchStationList')
  }
}

export default makeConnect(fee_query_station_list, mapStateToProps)(EntryStationList)
