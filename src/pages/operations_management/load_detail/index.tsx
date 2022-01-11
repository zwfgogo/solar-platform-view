import React from 'react';
import { connect } from 'dva';
import { history } from 'umi';
import { Tabs } from 'wanke-gui';
import styles from './index.less';
import Header from '../../../components/Header';
import BasicForm from './component/basic_form';
import ControlForm from './component/control_form';

import { WankeReturnOutlined } from "wanke-icon";
import { WankeEditOutlined } from "wanke-icon";

const { TabPane } = Tabs;

class LoadDetail extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const { selectKey } = this.props;
    if (selectKey === 0) {
      history.push('/operation/load_management');
    } else {
      this.getLoadDetail(selectKey);
      this.getBreaker();
    }
  }

  getLoadDetail = (loadId) => {
    this.props.dispatch({
      type: 'loadDetail/getLoadDetail',
      payload: { id: loadId }
    });
  }

  basicUpdate = () => {
    const { dispatch, curLoad } = this.props;
    dispatch({
      type: 'loadDetail/updateToView',
      payload: {
        basicFormDisplay: true,
        record: curLoad
      }
    });
  }

  getBreaker = () => {
    const { dispatch, selectKey } = this.props;
    dispatch({
      type: 'loadDetail/getBreaker',
      payload: { deviceId: selectKey }
    })
  }

  controlUpdate = () => {
    const { dispatch, curLoad } = this.props;
    dispatch({
      type: 'loadDetail/updateToView',
      payload: {
        controlFormDisplay: true,
        record: JSON.parse(JSON.stringify(curLoad))
      }
    });
  }

  back = () => {
    history.goBack();
  }

  render() {
    const { loadList, selectKey, curLoad, basicFormDisplay, controlFormDisplay } = this.props;
    const times = [];
    if (JSON.stringify(curLoad) !== '{}') {
      for (let item of curLoad.controlTimes) {
        times.push(`${item.controlStartTime}～${item.controlEndTime}`);
      }
    }
    const controlTime = times.join(',');
    return (
      <div className={styles['load-detail'] + " f-df flex-column"}>
        <div onClick={this.back} className={styles.return + " vh-center"}>
          <WankeReturnOutlined style={{ fontSize: 25, color: "#fff" }} />
        </div>
        {
          loadList.length && JSON.stringify(curLoad) !== '{}'
            ? <Tabs
              activeKey={selectKey.toString()}
              onChange={this.getLoadDetail}>
              {
                loadList.map((item) => {
                  return (
                    <TabPane key={item.id.toString()} style={{ paddingLeft: 10, paddingRight: 10 }} tab={item.title} ></TabPane>
                  );
                })
              }
            </Tabs>
            : null
        }
        {
          JSON.stringify(curLoad) !== '{}'
            ? <div className={styles.content + " f-df flex-column"}>
              <div className={styles.basic}>
                <Header title={'基础信息'} btnsStyle={styles['fix-btn']}>
                  <WankeEditOutlined onClick={this.basicUpdate} style={{ color: "#3d7eff", fontSize: 25 }} />
                </Header>
                <div className={styles.row}>
                  <span className={styles.border}>负荷名称：{curLoad.title}</span>
                  <span className={styles.border}>负荷代号：{curLoad.name}</span>
                  <span>保电级别：{curLoad.level}</span>
                </div>
                <p style={{ marginBottom: 20 }}></p>
                <div className={styles.row}>
                  <span className={styles.border}>开关对象：{curLoad.breaker.title}</span>
                </div>
              </div>
              <div className={styles.basic}>
                <Header title={'控制信息'} btnsStyle={styles['fix-btn']}>
                  <WankeEditOutlined onClick={this.controlUpdate} style={{ color: "#3d7eff", fontSize: 25 }} />
                </Header>
                <div className={styles.row}>
                  <span className={styles.border}>控制轮次：{curLoad.controlRound}次</span>
                  <span className={styles.border}>功率定值：{curLoad.powerThreshold ? `${curLoad.powerThreshold}kW` : ''}</span>
                  <span>控制时段：{controlTime}</span>
                </div>
              </div>
            </div>
            : null
        }
        {basicFormDisplay ? <BasicForm></BasicForm> : null}
        {controlFormDisplay ? <ControlForm></ControlForm> : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let results = {
    ...state.loadDetail,
    selectKey: state.loadManagement ? state.loadManagement.selectKey : 0,
    loadList: state.loadManagement ? state.loadManagement.loadList : []
  };
  return results;
};

export default connect(mapStateToProps)(LoadDetail);
