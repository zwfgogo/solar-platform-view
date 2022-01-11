import React, { useEffect } from 'react'
import { Input, Row, Col, Button } from 'wanke-gui'

import { c_station_list } from '../constants'

import { getActionType, makeConnect } from '../umi.helper'
import Page from '../../components/Page'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import { CustomerStationState } from './models/customer-station-list'
import PageProps from '../../interfaces/PageProps'
import List2 from './List2'
import ExportAndBack from '../../components/layout/ExportAndBack'
import utils from '../../public/js/utils'
import { CrumbsPortal } from '../../frameset/Crumbs'

const { Search } = Input

interface Props extends PageProps, MakeConnectProps<CustomerStationState>, CustomerStationState {
  pageTitle: string
  _firmId: number
}

function Layout(this: null, props: Props) {
  const { list, _firmId, query, total } = props
  const handleSearch = () => {
    props.action('pageChange', { page: 1, size: 20 })
    props.action('$getList')
  }

  useEffect(() => {
    props.action('reset')
    props.updateQuery({ curFirmId: _firmId })
    props.action('$getList')
  }, [])

  return (
    <Page pageId={props.pageId} pageTitle={props.pageTitle} className={'customer-station-info'}>
      <CrumbsPortal pageName='stationList'>
        <Button style={{ marginLeft: 16 }} onClick={() => props.action('onExport')} type="primary">
          {utils.intl('导出')}
        </Button>
      </CrumbsPortal>
      <div className="f-df flex-column" style={{ padding: 16 }}>
        <Row>
          <Col span={20}>
            <Search
              onChange={e => {
                props.action('updateQuery', {
                  queryStr: e.target.value
                })
              }}
              onSearch={handleSearch}
              name="search"
              style={{ width: '300px' }}
              placeholder={utils.intl('请输入关键字查询')}
              autoComplete="off"
            />
          </Col>
        </Row>
        <div className="flex1 e-pt10 f-pr">
          <List2
            dataSource={list}
            total={total} page={query.page} size={query.size} onPageChange={props.onPageChange('$getList')}
          />
        </div>
      </div>
    </Page>
  )
}

const mapStateToProps = (model, getLoading) => {
  return {
    ...model
  }
}

export default makeConnect(c_station_list, mapStateToProps)(Layout)
