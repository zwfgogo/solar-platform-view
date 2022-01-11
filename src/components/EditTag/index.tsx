/** 可编辑的tags */

import React, { Component } from 'react'
import { Popover, Checkbox, Row, Col } from 'wanke-gui'
import { CloseOutlined, MinusCircleOutlined, PlusSquareOutlined } from 'wanke-icon';
import _ from 'lodash'
import "./index.less"

const { Group } = Checkbox

interface Props {
  dataSource: {value: number|string, label: string}[]; // 数据源
  readonly?: boolean; // 是否只读
  value?: (number|string)[]; // 当前选中的数据
  defaultValue?: (number|string)[]; // 当前选中的数据
  onChange?: (value: (number|string)[]) => void
}
interface State {
  value: (number|string)[],
  preValue: (number|string)[],
  visible: boolean,
}

export default class EditTag extends Component<Props, State> {
  
  static defaultProps = {
    dataSource: []
  }

  constructor(props: Props){
    super(props);
    const newValue = Array.from(new Set(props.value || props.defaultValue || []))
    this.state = {
      value:  newValue,
      preValue: newValue,
      visible: false,
    }
  }

  componentDidUpdate(preProps: Props){
    if(!_.isEqual(preProps.value, this.props.value)){
      const newValue = Array.from(new Set(this.props.value || []))
      this.setState({ value: newValue, preValue: newValue })
    }
  }

  // 全选
  allChecked = (e) => {
    const { dataSource, onChange } = this.props
    const { checked } = e.target
    const newValue = checked ? dataSource.map(item => item.value) : []
    this.setState({ preValue: newValue })
    // onChange && onChange(newValue)
  }

  // 单个复选框选择
  itemChecked = checkedValue => {
    const { onChange } = this.props
    this.setState({ preValue: checkedValue })
    // onChange && onChange(checkedValue)
  }

  // 删除
  minusItem = (val) => {
    const { onChange } = this.props
    const { value } = this.state
    const newValue = value.filter(item => item !== val)
    this.setState({ value: newValue, preValue: newValue })
    onChange && onChange(newValue)
  }

  // 确定 
  handleOk = () => {
    const { onChange } = this.props
    const { preValue } = this.state
    this.setState({ value: preValue, visible: false })
    onChange && onChange(preValue)
  }

  render() {
    const { dataSource, readonly } = this.props
    const { visible, value, preValue } = this.state
    // console.log(dataSource, dataSource.find(item => item.value === value[0])?.label)
    return (
      <div className="edit-tag-box">
        {
          value?.map((val, index) => (
            <div className="edit-tag-item-box" key={val}>
              {dataSource.find(item => item.value === val)?.label}
              {
                !readonly ? <MinusCircleOutlined onClick={() => this.minusItem(val)}/> : index < value.length -1  ? ',' : null
              }
              
            </div>
          ))
        }
        {
          !readonly && (
            <Popover 
              placement="bottomLeft" 
              visible={visible} 
              overlayClassName="edit-tag-popover-box"
              getPopupContainer={(triggerNode: HTMLElement) => triggerNode.parentNode as HTMLElement}
              title={<div className="edit-tag-popover-title">
                <Checkbox indeterminate={!!preValue.length && preValue.length < dataSource.length} checked={preValue.length === dataSource.length} onChange={this.allChecked}>全选</Checkbox>
                <CloseOutlined onClick={() => this.setState({ visible: false })}/>
              </div>} 
              content={
                <div className="edit-tag-popover-body">
                  <div className="edit-tag-popover-subBody">
                    <Group value={preValue} onChange={this.itemChecked}>
                      <Row>
                        {
                          dataSource?.map(item => (
                            <Col span={24} title={item.label}>
                              <Checkbox value={item.value}>{item.label}</Checkbox>
                            </Col>
                          ))
                        }
                      </Row>
                    </Group>
                  </div>
                  <div className="edit-tag-popover-footer">
                    <span className="edit-tag-popover-footer-title" onClick={this.handleOk}>确定</span>
                  </div>
                </div>
              }>
              <div className="edit-tag-add-btn" onClick={() => this.setState({ visible: true })}><PlusSquareOutlined />添加</div>
            </Popover>
          )
        }
      </div>
    )
  }
}
