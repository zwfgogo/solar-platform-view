import React from 'react'
import ListStrategy from '../ListStrategy'
import { OptimizeMaintenanceModel } from '../models/maintenance'
import Page from '../../../components/Page'
import { makeConnect } from '../../umi.helper'
import { optimize_running_list } from '../../constants'
import PageProps from '../../../interfaces/PageProps'
import MakeConnectProps from '../../../interfaces/MakeConnectProps'
import SearchBox from '../../../components/layout/SearchBox'
import FullContainer from '../../../components/layout/FullContainer'
import FormLayout from '../../../components/FormLayout'
import utils from '../../../public/js/utils'
import { Col, Input, Row, SearchInput, Table2 } from 'wanke-gui'
import style from './strategyMaintenance.less'
import { extractByKey } from '../../page.helper'
import ListItemDelete from '../../../components/ListItemDelete'
import SpecifyParameters from './SpecifyParameters'
import { ActionProp } from '../../../interfaces/MakeConnectProps'
import { isZh } from '../../../core/env'

const { FieldItem } = FormLayout
interface Props extends ActionProp, OptimizeMaintenanceModel, PageProps, MakeConnectProps<OptimizeMaintenanceModel> {
  loading: boolean
  dataSource: any;
  page: any;
  size: any;
  total: any;
  _pageTitle: string;
  _record: any;
  bindStrategies: any;
  specifyParametersModal: boolean
  strategyId: any;
  strategyParams: any;
  strategyName: any;
  getStrategyParamsSuccess: boolean;
  selectId: any;
  theme: any;
}

class OptimizeRunningList extends React.Component<Props> {

  componentDidMount() {
    const { _record } = this.props
    this.props.action('reset')
    this.props.action('fetchList', { stationId: _record.id })
  }

  onPageChange = (page, size) => {
    const { _record } = this.props
    this.props.updateQuery({ page, size })
    this.props.action('fetchList', { stationId: _record.id })
  }

  start = (id, bind) => {
    const { _record } = this.props
    this.props.action('putStrategy', { id, stationId: _record.id, bind })
  }

  stop = (id, bind) => {
    const { _record } = this.props
    this.props.action('putStrategy', { id, stationId: _record.id, bind })
  }

  openModal = (record) => {
    this.props.updateState({ specifyParametersModal: true, strategyId: record.id, strategyName: record.name })
  }

  cancelModal = () => {
    this.props.updateState({ specifyParametersModal: false })
  }

  render() {
    const { loading, totalCount, query, dataSource, strategyParams, strategyName, theme,
      updateState, _pageTitle, _record, bindStrategies, specifyParametersModal, strategyId, action
      , getStrategyParamsSuccess, selectId } = this.props
    const columns: any = [
      { title: utils.intl('序号'), width: 65, dataIndex: 'num' },
      { title: utils.intl('策略代号'), width: 300, dataIndex: 'name' },
      { title: utils.intl('策略名称'), width: 200, dataIndex: 'title' },
      {
        title: utils.intl('控制模式'), dataIndex: 'controlModes',
        render: (value) => {
          return <span>{extractByKey(value || [], 'title')}</span>
        }
      },
      {
        title: utils.intl('指定参数'), width: 200,
        render: (value, record) => {
          return <span onClick={this.openModal.bind(this, record)} style={{ color: 'rgba(61, 126, 255, 0.85)', cursor: 'pointer' }}>{utils.intl('查看')}</span>
        }
      },
      {
        title: utils.intl('启用状态'), width: 200, dataIndex: 'id',
        render: (value) => {
          if (bindStrategies.indexOf(value) !== -1) {
            return (
              <>
                <span className="wanke-circle-icon wanke-color-green"></span>
                <span style={{ color: '#86CE63' }}>{utils.intl('已启用')}</span>
              </>
            )
          } else {
            return (
              <>
                <span className="wanke-circle-icon grey-icon"></span>
                <span>{utils.intl('未启用')}</span>
              </>
            )
          }
        }
      },
      {
        title: utils.intl('操作'), width: 200, dataIndex: 'id', align: 'right',
        render: (value, record) => {
          if (bindStrategies.indexOf(value) !== -1) {
            return (
              <ListItemDelete onConfirm={this.stop.bind(this, record.id, false)} tip={utils.intl('停止策略且无备用策略，将导致电站无策略运行，您确定要这样做吗？')}>
                <span style={{ color: 'rgba(61, 126, 255, 0.85)', cursor: 'pointer' }}>{utils.intl('停止')}</span>
              </ListItemDelete>
            )
          } else {
            return (
              <ListItemDelete onConfirm={this.start.bind(this, record.id, true)} tip={utils.intl('启用该策略后将自动停止正在使用的策略，您确定要这样做吗？')}>
                <span style={{ color: 'rgba(61, 126, 255, 0.85)', cursor: 'pointer' }}>{utils.intl('启用')}</span>
              </ListItemDelete>
            )
          }
        }
      },
    ]

    return (
      <Page pageId={this.props.pageId} style={{ display: "flex", flexDirection: "column" }} className="optimize-maintenance"
        pageTitle={utils.intl(_pageTitle) + (isZh() ? '' : ' ') + utils.intl('策略维护')}
      >
        {specifyParametersModal ?
          <SpecifyParameters
            cancel={() => { this.cancelModal(); }}
            visible={specifyParametersModal}
            stationId={_record.id}
            strategyId={strategyId}
            action={action}
            strategyParams={strategyParams}
            strategyName={strategyName}
            updateState={updateState}
            getStrategyParamsSuccess={getStrategyParamsSuccess}
            selectId={selectId}
          /> : ''}
        <Row className="e-pl10" style={{ backgroundColor: theme === 'light-theme' ? '#fff' : '#0e1321', borderBottom: '1px solid rgba(5,10,25,0.10)', padding: '10px 16px', height: 64, lineHeight: '43px' }}>
          <Col span={24} style={{ minWidth: '500px' }}>
            <span className={style['topTitle']}>{utils.intl('电站')}：<span className={style['topValue']}>{utils.intl(_pageTitle)}</span></span>

            <span className={style['topTitle']} style={{ marginLeft: 32 }}>{utils.intl('运营商')}：<span className={style['topValue']}>{utils.intl(_record.operator?.title)}</span></span>

          </Col>
        </Row>
        <FullContainer className="page-sub-container" style={{ marginTop: 0, borderRadius: 0 }}>
          <div className="flex1">
            <Table2
              key="num"
              loading={loading}
              dataSource={dataSource}
              columns={columns}
              page={query.page}
              size={query.size}
              total={totalCount}
              onPageChange={this.onPageChange}
            />
          </div>
        </FullContainer>
      </Page >
    )
  }
}

const mapStateToProps = (model, { getLoading, isSuccess }, state) => {
  return {
    ...model,
    loading: getLoading('fetchList'),
    theme: state.global.theme,
    getStrategyParamsSuccess: isSuccess('getStrategyParams')
  }
}

export default makeConnect('strategy_maintenance', mapStateToProps)(OptimizeRunningList)
