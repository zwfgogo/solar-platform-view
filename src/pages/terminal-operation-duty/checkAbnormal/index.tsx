import React from 'react'
import { Button, Row, Col, Input, Radio, Table2 } from 'wanke-gui'
import RangePicker from '../../../components/rangepicker/index'
import moment from 'moment'
import OrderModal from './component/orderFrom'
import columns from './component/columns'
import historyColumns from './component/historyColumns'
import IgnoreModal from './component/ignore'
import Page from '../../../components/Page'
import { getDate } from '../../../util/dateUtil'
import { makeConnect } from '../../umi.helper'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import { AbnormalQueryModal } from './model'
import PageProps from '../../../interfaces/PageProps'
import FullContainer from '../../../components/layout/FullContainer'
import Tools from '../../../components/layout/Tools'
import Export from '../../../components/layout/Export'
import {getQueryString} from '../../../util/utils'
import {t_check_abnormal} from '../../constants'

const RadioGroup = Radio.Group

interface Props extends MakeConnectProps<AbnormalQueryModal>, AbnormalQueryModal, PageProps {
  loading: boolean;
  historyLoading?: boolean;
  location: any
}

class operationList extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.action('reset')
    if (location.search.indexOf('?') !== -1) {
      this.props.action("getListDetail", { id: getQueryString('id') })
    } else {
      this.props.action('getList')
    }
    this.props.action('fetchStationList')
    this.getEnums()
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.location) !== JSON.stringify(nextProps.location)) {
      if (location.search.indexOf('?') !== -1) {
        this.props.action("getListDetail", { id: getQueryString('id') })
      } else {
        this.props.action('getList')
      }
    }
  }
  getEnums = () => {
    this.props.action("getEnums")
  }

  radioChange = (v) => {
    this.props.action("updateState", {
      abnormalCode: v.target.value, startDate: moment().subtract(29, 'day').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD')
    })
    this.props.action("pageChange", { page: 1, size: 20, listType: v.target.value })
  }
  disabledDate = (current) => {
    let d = new Date()
    let date = d.getFullYear() + '-' + (d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' + (d.getDate() < 10 ? '0' + d.getDate() : d.getDate())
    return current > moment(date, 'YYYY-MM-DD').endOf('day')
  }
  search = () => {
    const { query } = this.props
    this.pageChange(1, query.size, 2)
  }
  pageChange = (page, size, e) => {
    this.props.action("pageChange", { page, size, listType: e })
  }

  sizeChange = (page, size, e) => {
    this.props.action("pageChange", { page, size, listType: e })
  }
  //搜索框的值改变
  searchChange = (type, data) => {
    this.props.action("stringChange", { [type]: data })
  }
  dateChange = (date, dateString) => {
    const { query } = this.props
    this.props.action("updateState", { startDate: dateString[0], endDate: dateString[1] })
    this.pageChange(1, query.size, 2)
  }

  render() {
    const { list, loading, orderModal, abnormalCode, ignoreModal, startDate, endDate, historyLoading, query, total } = this.props
    console.log(list)
    return (
      <Page className="e-p10">
        <FullContainer>
          <Row className="e-mt10 e-pl10">
            <Col span={24}>
              <RadioGroup onChange={this.radioChange} value={abnormalCode}>
                <Radio value={1}>当前异常</Radio>
                <Radio value={2}>历史异常</Radio>
              </RadioGroup>
            </Col>
          </Row>
          {abnormalCode === 1 ?
            <div className="flex1 e-pt10 f-pr">
              <Table2 dataSource={list} columns={columns(this.props)}
                loading={loading}
                rowKey="num"
                page={query.page}
                size={query.size}
                total={total}
                onPageChange={(page, size) => this.pageChange(page, size, 1)}
              />
            </div>
            :
            <div className="flex1 e-pt10 f-pr f-df flex-column">
              <Row className="e-mt10 e-pl10">
                <Col span={8} style={{ minWidth: '500px' }}>
                  <div>
                    <span>发生时间：</span>
                    <RangePicker
                      disabledDate={this.disabledDate}
                      maxLength={90}
                      onChange={this.dateChange}
                      value={[getDate(startDate), getDate(endDate)]}
                    />
                  </div>
                </Col>
                <Col span={6}>
                  <Input.Search placeholder={'设备对象/异常名称/异常详情'}
                    onChange={(e) => this.searchChange('queryStr', e.target.value)}
                    onPressEnter={this.search}
                    onSearch={this.search}
                  />
                </Col>
              </Row>
              <div className="flex1 e-pt10 f-pr">
                <Table2
                  x={1400}
                  dataSource={list}
                  columns={historyColumns(this.props.stationOptions)}
                  loading={historyLoading}
                  rowKey="num"
                  page={query.page}
                  size={query.size}
                  total={total}
                  onPageChange={(page, size) => this.pageChange(page, size, 2)}
                />
              </div>
            </div>
          }
          <Tools>
            <Export onExport={() => this.props.action('onExport')} />
          </Tools>
          {orderModal ? <OrderModal /> : ''}
          {ignoreModal ? <IgnoreModal /> : ''}
        </FullContainer>
      </Page>
    )
  }
}

function mapStateToProps(model, getLoading) {
  return {
    ...model,
    loading: getLoading('getList'),
    historyLoading: getLoading('getHistoryList')
  }
}

export default makeConnect(t_check_abnormal, mapStateToProps)(operationList)
