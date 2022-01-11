import React from 'react'
import { Button, Row, Col, Radio, Table1, FullLoading } from 'wanke-gui'
import DatePicker from "../../components/date-picker"
import RangePicker from "../../components/rangepicker/index"
import moment from 'moment'
import RunModal from './component/runFrom'
import ResModal from './component/resFrom'
import styles from './index.less'
import Echart from "../../components18/Echart1"
import Columns from './component/columns'
import Page from "../../components/Page"
import CommonStationTree from "../../components/common-station-tree/CommonStationTree"
import { getWindowSize } from "../../components/useWindowResize"
import { makeConnect } from "../umi.helper"
import MakeConnectProps from "../../interfaces/MakeConnectProps"
import { ElectricDiffState } from './model'
import { disabledDateAfterYesterday } from '../../util/dateUtil'
import utils from '../../public/js/utils'
import ElectricChart from './component/ElectricChart'

const RadioGroup = Radio.Group
const windowSize = getWindowSize()

interface Props extends MakeConnectProps<ElectricDiffState>, ElectricDiffState {
  getElectricChartLoading?: boolean
}

class operationList extends React.Component<Props> {
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    if(this.props.stationId){
      const { dispatch, stationId } = this.props
      dispatch({
        type: 'electricDifference/updateState',
        payload: { stationId }
      })
      this.props.action('getElectricCompare')
      this.props.action('getList')
    }
  }

  componentDidUpdate(preProps){
    if(preProps.stationId !== this.props.stationId){
      const { dispatch, stationId } = this.props
      dispatch({
        type: 'electricDifference/updateState',
        payload: { stationId }
      })
      this.props.action('getElectricCompare')
      this.props.action('getList')
    }
  }

  showRes = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'electricDifference/updateState',
      payload: { resModal: true, button: true }
    })
    dispatch({
      type: 'electricDifference/getResList'
    })
  }

  showXzgd = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'electricDifference/updateState',
      payload: { record: {}, runModal: true, type: 'new' }
    })
    dispatch({
      type: 'electricDifference/getResList'
    })
  }
  exportTable = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'electricDifference/onExport',
    })
  }
  exportTable2 = () => {
    const { dispatch } = this.props
    dispatch({
      type: 'electricDifference/onExport2',
    })
  }
  dateChange = (date, dateString, e) => {
    if (!date) return;
    const { dispatch } = this.props
    if (e === 'record') {
      dispatch({
        type: 'electricDifference/updateState',
        payload: { compareResDate: dateString, rangeDate: dateString }
      })
      dispatch({
        type: 'electricDifference/getList'
      })
    } else {
      dispatch({
        type: 'electricDifference/updateState',
        payload: { electricCompareDate: dateString }
      })
      dispatch({
        type: 'electricDifference/getElectricCompare'
      })
    }
  }
  rangeDateChange = (date, dateString) => {
    const { dispatch } = this.props
    dispatch({
      type: 'electricDifference/updateState',
      payload: { startDate: dateString[0], endDate: dateString[1] }
    })
  }

  radioChange = (v) => {
    const { dispatch } = this.props
    dispatch({
      type: 'electricDifference/updateState',
      payload: { radioType: v.target.value }
    })
    dispatch({
      type: 'electricDifference/getElectricCompare'
    })
  }

  render() {
    const columns = [
      {
        title: utils.intl('运行阶段'), dataIndex: 'title', key: 'runPhase'
      },
      {
        title: utils.intl('费率'), dataIndex: 'rate', key: 'rate'
      },
      {
        title: utils.intl('电量') + '(kWh)', dataIndex: 'value', key: 'ele',render: text => text?.toFixed(2)
      },
      {
        title: utils.intl('目标偏差') + '(%)', dataIndex: 'bias', key: 'bias', render: (text, record, index) => {
          return (
            <span style={{ color: text > 0 ? 'red' : 'green' }}>{text}</span>
          )
        }
      }
    ]
    const { radioType, compareResDate, startDate, endDate, list, loading, runModal,
      resModal, electricCompareDate, compareLoading, ElectricCompareList, stationId } = this.props
    return (
      <Page pageId={this.props.pageId}
      pageTitle="电量差异分析" showStation className={styles.pageElectricDifference}>
        <div className="f-df e-p16" style={{ height: '100%' }}>
          <div className="flex1 f-pr flex-column f-df ">
            <div className="flex1 f-pr f-df">
              <div className="flex1 e-mr16 f-pr flex-column f-df">
                <Row className="">
                  <Col span={20}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ flexShrink: 0 }}>{utils.intl('日期')}：</span>
                      <RangePicker
                        disabledDate={disabledDateAfterYesterday}
                        maxLength={90}
                        allowClear={false}
                        onChange={this.rangeDateChange}
                        value={[startDate ? moment(startDate, 'YYYY-MM-DD') : null, endDate ? moment(endDate, 'YYYY-MM-DD') : null]}
                      />
                    </div>
                  </Col>
                </Row>
                <div className="flex1 f-pr" style={{ marginLeft: -14, paddingTop: 10 }}>
                  {this.props.getElectricChartLoading ? <FullLoading /> : null}
                  <ElectricChart
                    stationId={stationId}
                    startTime={startDate + ' 00:00:00'}
                    endTime={endDate + ' 23:59:59'}
                  />
                </div>
              </div>
              <div className="flex1 f-pr f-df flex-column">
                <Row className="">
                  <Col span={20}>
                    <span>{utils.intl('日期')}：</span>
                    <DatePicker dropdownClassName={styles['without-time-input']} disabledDate={disabledDateAfterYesterday}
                      allowClear={false}
                      onChange={(date, dateString) => this.dateChange(date, dateString, 'detail')}
                      value={moment(electricCompareDate, 'YYYY-MM-DD')}
                    />
                  </Col>
                  <Col span={4} className="f-tar">
                    <Button type="primary" onClick={this.exportTable2}>{utils.intl('导出')}</Button>
                  </Col>
                </Row>
                <Row className="e-mt16">
                  <Col span={20}>
                    <RadioGroup onChange={this.radioChange} value={radioType}>
                      <Radio value={'charge'}><span style={{ marginLeft: 8 }}>{utils.intl('充电')}</span></Radio>
                      <Radio value={'disCharge'}><span style={{ marginLeft: 8 }}>{utils.intl('放电')}</span></Radio>
                    </RadioGroup>
                  </Col>
                </Row>
                <div className="flex1 e-pt16 f-pr">
                  <Table1 dataSource={ElectricCompareList} columns={columns} loading={compareLoading}
                    rowKey="num" pagination={false}
                  />
                </div>
              </div>
            </div>
            <div className="flex1 e-mt16 f-pr f-df flex-column">
              <Row className="">
                <Col span={10} style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ flexShrink: 0 }}>{utils.intl('日期')}：</span>
                  <DatePicker disabledDate={disabledDateAfterYesterday}
                    allowClear={false}
                    defaultValue={moment(compareResDate, 'YYYY-MM-DD')}
                    onChange={(date, dateString) => this.dateChange(date, dateString, 'record')}
                  />
                  <Button style={{ marginLeft: 16 }} type="primary" onClick={this.showRes}>{utils.intl('原因配置')}</Button>
                </Col>
                <Col span={14} className="f-tar">
                  <Button type="primary" onClick={this.exportTable} className="e-mr8">{utils.intl('导出')}</Button>
                  <Button type="primary" onClick={this.showXzgd} disabled={compareResDate < moment().subtract(15, 'day').format('YYYY-MM-DD')}>{utils.intl('新增')}</Button>
                </Col>
              </Row>
              <div className="flex1 e-pt16 f-pr">
                <Table1 dataSource={list} columns={Columns.apply(this)} loading={loading}
                  rowKey="num" pagination={false}
                />
              </div>
            </div>
          </div>
          {runModal ? <RunModal /> : ''}
          {resModal ? <ResModal /> : ''}
        </div>
      </Page>

    )
  }
}

function mapStateToProps(modal, getLoading, state) {
  return {
    ...modal,
    stationId: state.global.selectedStationId,
    loading: getLoading('getList'),
    compareLoading: getLoading('getElectricCompare'),
    getElectricChartLoading: getLoading('getElectricChart'),
  }
}

export default makeConnect('electricDifference', mapStateToProps)(operationList)
