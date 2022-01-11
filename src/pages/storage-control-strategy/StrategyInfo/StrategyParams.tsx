import React, { Component } from 'react';
import { Table1, Button } from 'wanke-gui'
import { InputNumber } from 'antd'
import classNames from 'classnames'

export interface StrategyParamsProps {
  loading: boolean
  dataSource: any[]
  onCancle: () => void
  onSave: (paramDatas: any[]) => void
}

interface StrategyParamsState {
  isEdit: boolean,
  paramDatas: any[]
  isInputError: [boolean, boolean][]
}

class StrategyParams extends Component<StrategyParamsProps, StrategyParamsState> {

  constructor(props) {
    super(props)
    this.state = {
      isEdit: false,
      paramDatas: [],
      isInputError: []
    }
  }

  componentDidMount() {
    if (this.props.dataSource?.length)
      this.setState({
        paramDatas: this.props.dataSource.map(item => ({ id: item.id, socLowerLimit: item.socLowerLimit, socUpperLimit: item.socUpperLimit })),
        isInputError: this.props.dataSource.map(item => [false, false])
      })
  }

  componentDidUpdate(prevProps) {
    if (!_.isEqual(this.props.dataSource, prevProps.dataSource))
      this.setState({
        paramDatas: this.props.dataSource.map(item => ({ id: item.id, socLowerLimit: item.socLowerLimit, socUpperLimit: item.socUpperLimit })),
        isInputError: this.props.dataSource.map(item => [false, false])
      })
  }

  // 保存表格数据
  save = () => {
    const { onSave } = this.props
    const { paramDatas, isInputError } = this.state
    const newIsInputError = isInputError.map((item, index) => 
    [!paramDatas[index].socLowerLimit || paramDatas[index].socLowerLimit > paramDatas[index].socUpperLimit || paramDatas[index].socLowerLimit < 0 || paramDatas[index].socLowerLimit > 100, 
    !paramDatas[index].socUpperLimit || paramDatas[index].socLowerLimit > paramDatas[index].socUpperLimit || paramDatas[index].socUpperLimit < 0 || paramDatas[index].socUpperLimit > 100]
    )
    // console.log('newIsInputError', newIsInputError)
    this.setState({ isInputError: newIsInputError})
    if (newIsInputError.every(item => !item[0] && !item[1] )) {
      onSave && onSave(paramDatas)
    }
  }

  // 表格数据修改
  tableInput = (value: string, index: number, paramsName: string) => {
    const { paramDatas } = this.state
    this.setState({ paramDatas: paramDatas.map((item, ind) => ind === index ? { ...item, [paramsName]: value } : item) })
  }

  render() {
    const { loading, dataSource, onCancle } = this.props
    const { isEdit, paramDatas, isInputError } = this.state
    const columns = [{
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      width: 70,
      align: 'center',
      render: (value, record, index) => index + 1
    }, {
      title: '储能单元',
      dataIndex: 'title',
      key: 'title',
      align: 'left',
    }, {
      title: 'SOC下限',
      dataIndex: 'socLowerLimit',
      key: 'socLowerLimit',
      align: 'right',
      width: 250,
      render: (value, record, index) => isEdit ? <InputNumber
        size="small"
        style={{ borderColor: isInputError[index][0] ? "#ff4d4f" : undefined }}
        formatter={value => `${value}`.indexOf('.') >= 0 && `${value}`.length > `${value}`.indexOf('.') + 2 ? `${parseFloat(value).toFixed(1)}%` : `${value}%`}
        parser={value => value.replace('%', '')}
        className="strategy-table-input"
        value={paramDatas[index]?.socLowerLimit}
        step={0.1}
        onChange={(e) => this.tableInput(e, index, 'socLowerLimit')} /> : `${value || ''}%`
    }, {
      title: 'SOC上限',
      dataIndex: 'socUpperLimit',
      key: 'socUpperLimit',
      width: 250,
      align: 'right',
      render: (value, record, index) => isEdit ? <InputNumber
        size="small"
        style={{ borderColor: isInputError[index][1] ? "#ff4d4f" : undefined }}
        formatter={value => `${value}`.indexOf('.') >= 0 && `${value}`.length > `${value}`.indexOf('.') + 2 ? `${parseFloat(value).toFixed(1)}%` : `${value}%`}
        parser={value => value.replace('%', '')}
        className="strategy-table-input"
        value={paramDatas[index]?.socUpperLimit}
        step={0.1}
        onChange={(e) => this.tableInput(e, index, 'socUpperLimit')} /> : `${value || ''}%`
      // render: value => <div className={`table-status-${value ?? ''}`}>{value === true ? '已启用' : value=== false ? '未启用' : '自动'}</div>
    }]

    return (
      <>
        <div className="strategy-info-sub-params-body">
          <Table1
            x={580}
            loading={loading}
            dataSource={dataSource}
            columns={columns}
          />
        </div>
        {
          dataSource && dataSource.length ?
            <div className="strategy-info-sub-footer">
              <Button onClick={() => !isEdit ? onCancle() : this.setState({ isEdit: false })}>取消</Button>
              <Button type="primary" onClick={() => !isEdit ? this.setState({ isEdit: true }) : this.save()}>{!isEdit ? "修改" : "确定"}</Button>
            </div>
            : null
        }
      </>

    );
  }
}

export default StrategyParams;
