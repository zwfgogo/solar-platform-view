import React, { useState } from 'react'
import { Button, Row, Col, Select, Input, Table, Tabs } from 'wanke-gui'
import { connect } from 'dva'
import Page from '../../components/Page'

const {TabPane} = Tabs
import PricePower from './pricePower/index'
import PriceUser from './priceUser/priceUserList/PriceUserList'
import styles from './index.less'
import FullContainer from '../../components/layout/FullContainer'
import utils from '../../public/js/utils'

class ElectricityPrice extends React.Component<any> {
  componentDidMount() {
    // const {dispatch} = this.props;
    // dispatch({
    //     type: 'pricePower/getList'
    // });
  }

  onChange = (e) => {
    const {dispatch} = this.props
    dispatch({
      type: 'price/updateState',
      payload: {TabNum: e}
    })
    if (e === '1') {
      dispatch({type: 'priceUser/updateQuery', payload: {queryStr: ''}})
      dispatch({
        type: 'pricePower/getList'
      })
    } else {
      dispatch({type: 'pricePower/updateQuery', payload: {queryStr: ''}})
      dispatch({
        type: 'priceUser/getList'
      })
    }
  }

  render() {
    const {TabNum} = this.props
    return (
      <Page className="bf-br10">
        <FullContainer className={'bf-br10 f-df flex-column ' + styles.tabCss}>
          <Tabs onChange={this.onChange} type="card" activeKey={TabNum}>
            <TabPane tab={utils.intl('上网电价')} key="1">
            </TabPane>
            <TabPane tab={utils.intl('用电电价')} key="2">
            </TabPane>
          </Tabs>

          <div className="flex1">
            {TabNum === '1' ? <PricePower/> : <PriceUser/>}
          </div>
        </FullContainer>
      </Page>
    )
  }
}

function mapStateToProps(state) {
  return {
    pricePower: state.pricePower, priceUser: state.priceUser, loading: state.loading.effects['vpp/getList'], ...state.price
  }
}

export default connect(mapStateToProps)(ElectricityPrice)
