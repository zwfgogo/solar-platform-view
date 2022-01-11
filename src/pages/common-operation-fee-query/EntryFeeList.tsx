import React, { useEffect } from 'react'
import PageProps from "../../interfaces/PageProps"
import Page from "../../components/Page"
import FullContainer from "../../components/layout/FullContainer"
import { makeConnect } from "../umi.helper"
import { fee_query_fee_list } from "../constants"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import ListFee from './ListFee'
import SearchBox from "../../components/layout/SearchBox"
import { FeeQueryStationListState } from './models/station-list'
import Tools from "../../components/layout/Tools"
import Export from "../../components/layout/Export"
import Back1 from "../../components/layout/Back1"
import { isTerminalSystem } from '../../core/env'
import { Button } from 'wanke-gui'
import { CrumbsPortal } from '../../frameset/Crumbs'
import utils from '../../public/js/utils'

interface Props extends PageProps, FeeQueryStationListState, MakeConnectProps<FeeQueryStationListState> {
  stationId: number
  pageTitle: string
  loading: boolean
}

const EntryFeeList: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.action('fetchFeeList', { stationId: props.stationId })
  }, [])

  const onPageChange = (page, size) => {
    props.updateQuery({ page, size })
    props.action('fetchFeeList', { stationId: props.stationId })
  }

  const { query } = props
  return (
    <Page pageId={props.pageId} pageTitle={props.pageTitle} style={{ padding: 15 }}>
      <CrumbsPortal pageName={'fee-list'}>
        <Button style={{ marginLeft: '16px' }} onClick={() => props.action('onExport', { stationId: props.stationId })} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <FullContainer>
        <div className="flex1">
          <ListFee
            stationId={props.stationId}
            loading={props.loading}
            lookMonth={(record) => props.forward('month-list', { stationId: record.stationId, dtime: record.startTime, pageTitle: record.billName })}
            lookResult={(record) => props.forward('fee-result', { stationId: props.stationId, recordId: record.id })}
            dataSource={props.list}
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
    loading: getLoading('fetchFeeList')
  }
}

export default makeConnect(fee_query_fee_list, mapStateToProps)(EntryFeeList)
