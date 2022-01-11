import React, { useEffect, useState } from 'react'
import { FullContainer, Input } from 'wanke-gui'

import MakeConnectProps from '../../interfaces/MakeConnectProps'
import PageProps from '../../interfaces/PageProps'
import { RunStrategyModel } from './models/data'
import Page from '../../components/Page'
import { storage_run_strategy } from '../constants'
import { makeConnect } from '../umi.helper'
import List1 from './item/List1'
import usePageSize from '../../hooks/usePageSize'

import utils from '../../public/js/utils'
import FormLayout from '../../components/FormLayout'
import { isMicrogrid } from '../../core/env'

const { FieldItem } = FormLayout
const SearchInput = Input.Search

interface Props extends PageProps, MakeConnectProps<RunStrategyModel>, RunStrategyModel {
  loading: boolean
}

const StationStrategyList: React.FC<Props> = function (this: null, props) {
  const [pageSize, setPageSize] = usePageSize()
  const [searchKey, setSearchKey] = useState('')

  const toDetail = (index) => {
    props.forward('station-strategy-detail', { stationId: props.list[index].stationId, stationName: props.list[index].stationTitle })
  }

  const onSearch = () => {
    setPageSize(1, pageSize.size)
  }

  const onNeedUpdate = () => {
    fetchList()
  }

  const fetchList = () => {
    props.action('fetchStationStrategyList', {
      queryStr: searchKey,
      page: pageSize.page,
      size: pageSize.size,
      stationTypeName: isMicrogrid() ? 'Microgrid' : 'Storage'
    })
  }

  useEffect(() => {
    fetchList()
  }, [pageSize])

  return (
    <Page
      pageId={props.pageId}
      className={'run-strategy-page'}
      onNeedUpdate={onNeedUpdate}
      style={{ background: "transparent", display: "flex", flexDirection: "column" }}
    >
      <FullContainer className="page-sub-container has-filter-header" style={{ marginTop: 0 }}>
        <div className="filter-header">
          <SearchInput
            style={{ width: 260 }}
            value={searchKey}
            placeholder={utils.intl('请输入关键字查询')}
            onChange={e => setSearchKey(e.target.value)}
            onSearch={onSearch}
          />
        </div>
        <div className="flex1">
          <List1
            loading={props.loading}
            pageSize={pageSize}
            dataSource={props.list}
            total={props.total}
            setPageSize={setPageSize}
            toDetail={toDetail}
          />
        </div>
      </FullContainer>
    </Page>
  )
}

const mapStateToProps = (model, { getLoading, isSuccess }) => {
  return {
    ...model,
    loading: getLoading('fetchStationStrategyList')
  }
}

export default makeConnect(storage_run_strategy, mapStateToProps)(StationStrategyList)
