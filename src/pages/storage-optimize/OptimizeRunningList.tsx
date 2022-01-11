import React from 'react'
import ListStrategy from './ListStrategy'
import { OptimizeRunningModel } from './models/list'
import Page from '../../components/Page'
import { makeConnect } from '../umi.helper'
import { optimize_running_list } from '../constants'
import PageProps from '../../interfaces/PageProps'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import SearchBox from '../../components/layout/SearchBox'
import FullContainer from '../../components/layout/FullContainer'
import FormLayout from '../../components/FormLayout'
import utils from '../../public/js/utils'
import { Input, SearchInput } from 'wanke-gui'

const { FieldItem } = FormLayout
interface Props extends OptimizeRunningModel, PageProps, MakeConnectProps<OptimizeRunningModel> {
  loading: boolean
}

class OptimizeRunningList extends React.Component<Props> {
  onEdit = (record) => {
    this.props.forward('strategyMaintenance', { stationId: record.id, _pageTitle: record.title, _record: record })
  }

  onSearch = () => {
    this.props.updateQuery({ page: 1 })
    this.props.action('fetchList')
  }

  componentDidMount() {
    this.props.action('reset')
    this.props.action('fetchList')
  }

  render() {
    const { loading, totalCount, list, query } = this.props
    return (
      <Page pageId={this.props.pageId} style={{ background: "transparent", display: "flex", flexDirection: "column" }} className="optimize-running-list-page"
        onNeedUpdate={() => this.props.action('fetchList')} onActivity={() => this.props.action('fetchList')}
      >
        <FormLayout
          onSearch={this.onSearch}
          onReset={() => {
            this.props.updateQuery({
              queryStr: '',
            })
          }}>
          <FieldItem label={utils.intl('关键字')}>
            <Input
              // searchSize="small"
              placeholder={utils.intl('请输入关键字')}
              onChange={e => this.props.updateQuery({ queryStr: e.target.value })}
              // onSearch={this.onSearch}
              value={query.queryStr}
            />
          </FieldItem>
        </FormLayout>
        <FullContainer className="page-sub-container">
          <div className="flex1">
            <ListStrategy
              loading={loading}
              page={query.page} total={totalCount} size={query.size}
              dataSource={list} onPageChange={this.props.onPageChange('fetchList')}
              onEdit={this.onEdit}
            />
          </div>
        </FullContainer>
      </Page>
    )
  }
}

const mapStateToProps = (model, getLoading) => {
  return {
    ...model,
    loading: getLoading('fetchList')
  }
}

export default makeConnect(optimize_running_list, mapStateToProps)(OptimizeRunningList)
