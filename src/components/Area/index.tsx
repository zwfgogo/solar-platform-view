/**
 * create by liumengmei 2019年09月04日
 * value 的布尔值不能是 false
 */

import React, { useState, useEffect } from 'react';
import { Select } from 'wanke-gui';
import services from './services';
import pubService from '../../public/services'
import classnames from 'classnames';
import './index.less'

interface AreaProps {
  width?: number,
  nationWidth?: number;
  nationStyle?: any;
  onChange?: Function;
  selectNation?: Function;
  value?: {
    values: Array<any>;
    isSelected: boolean
  },
  exact?: boolean
  provinceList?: Array<any>,
  provinceListAll?: Array<any>
}
interface AreaState {
  dataSourceP: Array<any>;
  dataSourceN: any[];
  dataSourceC: Array<any>;
  dataSourceA: Array<any>;
  visible: boolean
}


class Area extends React.Component<AreaProps, AreaState> {
  constructor(props) {
    super(props);
    const { onChange, value } = props;
    const { values } = value;

    this.state = {
      dataSourceN: [],
      dataSourceP: [],
      dataSourceC: [],
      dataSourceA: [],
      visible: false
    }
  }
  static defaultProps = {
    exact: true
  }
  async componentDidMount() {
    const { exact } = this.props;
    const data0 = await pubService.memoGetTopArea({ hasAll: !exact });
    const { value } = this.props;
    const { values } = value;
    // 省级已选 并且有下级
    let data1 = [];
    if (1) {
      data1 = await services.getChildArea({ parentId: values[0], hasAll: !exact, parentType: 'country' })
    }
    let data2 = [];
    if (1) {
      data2 = await services.getChildArea({ parentId: values[1], hasAll: !exact, parentType: 'province' })
    }
    let data3 = [];
    // 市级已选 并且有下级
    if (1) {
      data3 = await services.getChildArea({ parentId: values[2], hasAll: !exact, parentType: 'city' })
    }
    this.setState({
      dataSourceN: data0,
      dataSourceP: data1,
      dataSourceC: data2,
      dataSourceA: data3,
    })
  }
  selectN = async (val, options) => {

    const { onChange, exact, selectNation } = this.props;
    if (selectNation) {
      selectNation(this.state.dataSourceN, val);
    }
    onChange({ values: [val, '', '', ''], isSelected: true });

    // 设置值
    // 将省的值设置为空 将市的值设置为空 将区的值设置为空
    // 请求市的下拉列表
    let data1 = await services.getChildArea({ parentId: val, hasAll: !exact, parentType: 'country' });
    if (!data1.length) {
      data1 = [];
      onChange({ values: [val, '', '', ''], isSelected: true })
    }
    else {
      if (!exact) {
        onChange({ values: [val, data1[0].value, '', ''], isSelected: true });
      }
      else {
        onChange({ values: [val, '', '', ''], isSelected: false });
      }
    }
    this.setState({
      dataSourceP: data1,
      dataSourceC: [],
      dataSourceA: [],
    })
  }

  selectP = async (val, options) => {

    const { onChange, value, exact } = this.props;
    const { values } = value;
    onChange({ values: [values[0], val, '', ''], isSelected: true });

    // 设置值
    // 将市的值设置为空 将区的值设置为空
    // 请求市的下拉列表
    let data2 = await services.getChildArea({ parentId: val, hasAll: !exact, parentType: 'province' });
    if (!data2.length) {
      data2 = [];
      onChange({ values: [values[0], val, '', ''], isSelected: true })
    }
    else {
      if (!exact) {
        onChange({ values: [values[0], val, data2[0].value, ''], isSelected: true });
      }
      else {
        onChange({ values: [values[0], val, '', ''], isSelected: false });
      }
    }
    this.setState({
      dataSourceC: data2,
      dataSourceA: [],
    })
  }
  selectC = async (val, options) => {
    const { onChange, value, exact } = this.props;
    const { values } = value;
    onChange({ values: [values[0], values[1], val, ''], isSelected: true })

    // 将区的值设置为空
    let isSlectedA = false;
    // 请求区的下拉列表
    let data3 = await services.getChildArea({ parentId: val, hasAll: !exact, parentType: 'city' });
    if (!data3.length) {
      onChange({ values: [values[0], values[1], val, ''], isSelected: true })
    }
    else {
      if (!exact) {
        onChange({ values: [values[0], values[1], val, data3[0].value], isSelected: true })
      }
      else {
        onChange({ values: [values[0], values[1], val, ''], isSelected: false })
      }
    }
    this.setState({
      dataSourceA: data3
    })
  }
  selectA = async (val, options) => {
    const { onChange, value } = this.props;
    const { values } = value;
    onChange({ values: [values[0], values[1], values[2], val], isSelected: true })
  }
  componentWillUnmount() {
    this.setState = () => {
    }
  }
  render() {
    const { value, width, nationWidth, nationStyle } = this.props;
    const { values } = value;
    const { dataSourceP, dataSourceC, dataSourceA, visible, dataSourceN } = this.state;
    return (
      <React.Fragment>
        <span className={classnames({ 'f-dn': visible }) + 'areaSelect'}>
          <Select style={{ ...nationStyle, width: nationWidth }} dataSource={dataSourceN} className='f-wa' value={values[0]} onSelect={this.selectN} />
          <Select style={{ width }} dataSource={dataSourceP} className={classnames('e-ml5 f-wa', { 'f-dn': !dataSourceP.length })} value={values[1]} onSelect={this.selectP} />
          <Select style={{ width }} className={classnames('e-ml5 f-wa', { 'f-dn': !dataSourceC.length })} dataSource={dataSourceC} disabled={!dataSourceC.length} value={values[2]} onSelect={this.selectC} />
          <Select style={{ width }} className={classnames('e-ml5 f-wa', { 'f-dn': !dataSourceA.length })} dataSource={dataSourceA} disabled={!dataSourceA.length} value={values[3]} onSelect={this.selectA} />
        </span>
      </React.Fragment>
    );
  }
}


export default Area;