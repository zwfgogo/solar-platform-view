import React, { useState } from 'react'
import { Button, Row, Col, Select, Input, Table, Tabs } from 'wanke-gui'
import { connect } from 'dva'
import Page from '../../components/Page'

const { TabPane } = Tabs
import DeviceModel from './deviceModel/Index'
import StationModel from './stationModel/Index'
import EnerguUnitModel from './energyUnitModel/Index'
// import PriceUser from './priceUser/priceUserList/PriceUserList'
// import './index.less'
import FullContainer from '../../components/layout/FullContainer'
import { makeConnect } from '../umi.helper'
import utils from '../../public/js/utils'

class ModelConfig extends React.Component<any> {
  componentDidMount() {
    // const {dispatch} = this.props;
    // dispatch({
    //     type: 'pricePower/getList'
    // });
  }
  componentWillUnmount() {
    this.props.action('reset')
  }

  onChange = (e) => {
    let modelType;
    if (e === '1') {
      modelType = '设备'
    } else if (e === '2') {
      modelType = '能量单元'
    } else {
      modelType = '电站'
    }
    this.props.updateState({ TabNum: e, modelType })

  }

  render() {
    const { TabNum } = this.props;
    let content;
    if (TabNum === '1') {
      content = <DeviceModel />;
    } else if (TabNum === '2') {
      content = <EnerguUnitModel />;
    } else {
      content = <StationModel />;
    }
    let color = this.props.theme === 'light-theme' ? '#fff' : '#050A19'
    return (
      <Page className="bf-br4" style={{ background: color }}>
        <FullContainer className={'bf-br4 f-df flex-column '}>
          <Tabs onChange={this.onChange} activeKey={TabNum}>
            <TabPane tab={utils.intl('设备模型')} key="1">
            </TabPane>
            <TabPane tab={utils.intl('能量单元模型')} key="2">
            </TabPane>
            <TabPane tab={utils.intl('电站模型')} key="3">
            </TabPane>
          </Tabs>
          <div className="flex1 e-p10 " style={{ paddingTop: '0px' }}>
            {content}
          </div>
        </FullContainer>
      </Page>
    )
  }
}

function mapStateToProps(model, getLoading, state) {
  return {
    ...model,
    theme: state.global.theme
  }
}

export default makeConnect('modelConfig', mapStateToProps)(ModelConfig)
