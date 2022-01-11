import React, { useEffect } from 'react'
import Page from "../../components/Page"
import PageProps from "../../interfaces/PageProps"
import FullContainer from "../../components/layout/FullContainer"
import { Button } from 'wanke-gui'
import Tools from "../../components/layout/Tools"
import Back1 from "../../components/layout/Back1"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { FeeQueryResultState } from './models/fee-result'
import { makeConnect } from "../umi.helper"
import { fee_query_fee_result } from "../constants"
import { FullLoading } from "wanke-gui"
import { CrumbsPortal } from '../../frameset/Crumbs'
import utils from '../../public/js/utils'

interface Props extends PageProps, MakeConnectProps<FeeQueryResultState>, FeeQueryResultState {
  recordId: number
  stationId: number
  loading: boolean
}

const EntryFeeResult: React.FC<Props> = function (this: null, props) {
  useEffect(() => {
    props.action('reset')
    props.action('fetchFeeResult', { recordId: props.recordId, stationId: props.stationId })
  }, [])

  let exportPdf = () => {
    window.open('/api/report-management?format=pdf&reportName=report_electricity_bill' +
      `&recordId=${props.recordId}&stationId=${props.stationId}&access-token=${sessionStorage.getItem('token')}&language=${localStorage.getItem('language') || 'zh'}`)
  }

  return (
    <Page pageId={props.pageId} pageTitle={utils.intl('结算账单')} style={{ padding: 15 }}>
      <CrumbsPortal pageName={'fee-result'}>
        <Button style={{ marginLeft: '16px' }} onClick={exportPdf} type="primary">
          {utils.intl('导出PDF')}
        </Button>
      </CrumbsPortal>
      <FullContainer>
        <FullContainer className="flex1" style={{ position: 'relative' }}>
          {
            props.loading && (<FullLoading />)
          }
          <div className="flex1" dangerouslySetInnerHTML={{ __html: props.html }} style={{ overflow: 'auto' }}>
          </div>
        </FullContainer>
      </FullContainer>
    </Page>
  )
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('fetchFeeResult')
  }
}

export default makeConnect(fee_query_fee_result, mapStateToProps)(EntryFeeResult)
