import React from 'react'
import { Tabs, Select, FullLoading } from 'wanke-gui'
import classnames from 'classnames'
import { LineChart } from 'wanke-gui'
import RangePicker from '../../components/rangepicker/index'
import styles from './diagram.less'
import { disabledDateAfterToday } from '../../util/dateUtil'

import moment from 'moment'
import StationTree from './stationTree'
import TreeNodeExpand from '../../components/common-station-tree/TreeNodeExpand'
import AutoSizer from '../../components/AutoSizer'
import { AntdTreeRef } from '../../interfaces/CommonInterface'
import LimitChartCount from './components/LimitChartCount'
import { Tree } from 'wanke-gui'
import { t_diagram } from '../constants'

import { makeConnect } from '../umi.helper'

const { Option } = Select
const { TabPane } = Tabs

class Diagram extends React.Component<any> {
  treeContainerRef = React.createRef<HTMLDivElement>()
  treeRef = React.createRef<AntdTreeRef>()

  state = {
    hidedSeriesArray: []
  }

  componentDidMount() {
    const { startDate, endDate } = this.props
    this.props.action('getTree').then(res => {
      if (!res.typeId || !res.id) return
      this.props.action('getDeviceType', { deviceId: res.id }).then(result => {
        if (result) {
          this.props.action('getChart', {
            deviceId: res.id,
            dataTypeId: result,
            startDate: startDate,
            endDate: endDate
          })
        }
      })
    })
  }

  toggleSeriesDisplay = (index, hidedSeriesArray) => {
    this.setState({ hidedSeriesArray })
  }

  clearSeriesHided = () => {
    this.setState({ hidedSeriesArray: [] })
  }

  selectTree = (id, typeId, activity, key) => {
    const { endDate, startDate } = this.props
    if (typeId && activity) {
      this.props.action('clickTree', { id, key })
      this.props.action('getDeviceType', { deviceId: id }).then(result => {
        if (result) {
          this.clearSeriesHided();
          this.props.action('getChart', {
            deviceId: id,
            dataTypeId: result,
            startDate: startDate,
            endDate: endDate
          })
        }
      })
    }
  }
  dateChange = (date, dateString) => {
    const { dataTypeId } = this.props
    this.props.action('updateState', { startDate: dateString[0], endDate: dateString[1] }).then(res => {
      if (!dataTypeId) return
      this.getChart()
    })
  }
  getChart = () => {
    const { selectKey, dataTypeId, startDate, endDate } = this.props
    if (!selectKey) return
    this.props.action('getChart', {
      deviceId: selectKey,
      dataTypeId: dataTypeId,
      startDate: startDate,
      endDate: endDate
    })
  }
  tabsChange = key => {
    const { selectKey, startDate, endDate } = this.props
    if (!selectKey) return
    this.clearSeriesHided()
    this.props.action('getChart', {
      deviceId: selectKey,
      dataTypeId: key,
      startDate: startDate,
      endDate: endDate
    })
  }

  handleSearch = (val: string) => {
    this.props.action('updateState', { queryStr: val }).then(() => {
      this.props.action('getTree')
    })
  }

  scrollTopView = (key) => {
    if (this.treeRef) {
      this.treeRef.current.scrollTo({ key })
    }
  }

  hanldeSearchChange = (key, explandToNode) => {
    const { treeSearchList } = this.props
    const target = treeSearchList.find(item => item.key === key)
    if (target) {
      this.selectTree(target.id, target.typeId, !!target.activity, target.key)
      explandToNode(target.key)
      setTimeout(() => {
        this.scrollTopView(key)
      })
    }
  }

  componentWillUnmount() {
    this.props.action('reset')
  }


  render() {
    const {
      equipmentTree,
      activeKey,
      deviceTypeArr,
      startDate,
      endDate,
      dataTypeId,
      echartList,
      loading,
      treeLoading,
      treeSearchList
    } = this.props
    let deviceType = deviceTypeArr.map((o, i) => {
      return <TabPane tab={o.name} key={o.value}></TabPane>
    })
    return (
      <div
        className="f-df"
        style={{ height: '100%', paddingLeft: 270, position: 'relative' }}
      >
        <TreeNodeExpand defaultExpandAll keygen="key" nodeList={equipmentTree}>
          {(expanded, explandToNode, onExpand) => (
            <div
              className={classnames(
                'f-df f-pr bf-br10 e-p15',
                styles['tree-container']
              )}
              style={{ width: '270px', overflow: 'auto', borderRadius: 5, height: '100%' }}
            >
              <div className={styles['filter-box']}>
                <Select
                  value={'请输入关键字查询'}
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="请输入关键字查询"
                  optionFilterProp="children"
                  onChange={key => this.hanldeSearchChange(key, explandToNode)}
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {treeSearchList.map(item => (
                    <Option key={item.key} value={item.key} disabled={!item.activity || !item.typeId}>{item.title}</Option>
                  ))}
                </Select>
              </div>
              <div className={classnames(styles['tree-body'], 'horizontal-scroll-tree')} ref={this.treeContainerRef}>
                {treeLoading && <FullLoading />}
                <AutoSizer>
                  {({ height }) => (
                    <StationTree
                      ref={this.treeRef}
                      height={height}
                      expanded={expanded}
                      onExpand={onExpand}
                      equipmentTree={equipmentTree}
                      selectKey={activeKey}
                      onChildClick={this.selectTree.bind(this)}
                    />
                  )}
                </AutoSizer>
              </div>
            </div>
          )}
        </TreeNodeExpand>
        <div
          className="flex1 e-ml10 f-pr bf-br10 flex-column f-df "
          style={{ borderRadius: 5 }}
        >
          <div className={styles['diagram-tab-container']}>
            <Tabs
              onChange={this.tabsChange}
              activeKey={dataTypeId + ''}
            >
              {deviceType}
            </Tabs>
          </div>
          <LimitChartCount maxLength={9} chartData={echartList}>
            {({ chartData, treeData, treeSelectVisible, checkList, toggleCheckList }) => (
              <section className="flex1 f-df">
                {treeSelectVisible && (
                  <aside className={styles['tree-select-container']}>
                    <Tree
                      showLine
                      checkable
                      selectable={false}
                      checkedKeys={checkList}
                      onCheck={(list: any) => {
                        this.clearSeriesHided();
                        toggleCheckList(list)
                      }}
                      defaultExpandAll
                      treeData={treeData}
                    />
                  </aside>
                )}
                <div className="flex1 f-df flex-column">
                  <div style={{ paddingLeft: '20px' }}>
                    <span>日期：</span>
                    <RangePicker
                      disabledDate={disabledDateAfterToday}
                      maxLength={90}
                      allowClear={false}
                      onChange={this.dateChange}
                      value={[
                        moment(startDate, 'YYYY-MM-DD'),
                        moment(endDate, 'YYYY-MM-DD')
                      ]}
                    />
                  </div>
                  <div className="flex1 e-p10 f-pr">
                    <LineChart
                      series={chartData.series}
                      xData={chartData.xData}
                      yData={chartData.yData}
                      loading={loading}
                      hidedSeriesArray={this.state.hidedSeriesArray}
                      toggleSeriesDisplay={this.toggleSeriesDisplay}
                    />
                  </div>
                </div>
              </section>
            )}
          </LimitChartCount>
        </div>
      </div >
    )
  }
}

function mapStateToProps(model, { getLoading, isSuccess }, state) {
  return {
    ...model,
    loading: getLoading('getChart'),
    treeLoading: getLoading('getTree')
  }
}

export default makeConnect(t_diagram, mapStateToProps)(Diagram)
