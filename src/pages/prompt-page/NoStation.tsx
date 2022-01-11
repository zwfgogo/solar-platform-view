import React from 'react';
import { DispatchProp } from 'dva'
import { history } from 'umi';
import { makeConnect, getAction } from '../umi.helper';
import MakeConnectProps from '../../interfaces/MakeConnectProps';
import { globalNS } from '../constants';
import styles from './no-station.less';
import { Button } from 'wanke-gui';
import { WankeNoDataOutlined } from 'wanke-icon';

interface Props extends MakeConnectProps<{}>, DispatchProp {}

const NoStation: React.FC<Props> = (props) => {
  const logout = () => {
    sessionStorage.clear()
    props.dispatch(getAction(globalNS, 'updateState', {userId: null}))
    // history.push('/')
  }

  return (
    <div className={styles['page-container']}>
      <div className={styles['header']}>
        <p className={styles['head-img']}><img src={require('../../frameset/must-reset-password.png')}/></p>
        <p className={styles['icon']}><WankeNoDataOutlined /></p>
        <p className={styles['label']}>欢迎您的访问，暂未查询到您拥有电站信息，请核对您的账户是否正确以及是否录入电站信息！</p>
        <Button onClick={logout} type="primary" danger>退出登录</Button>
      </div>
    </div>
  );
};

const mapStateToProps = (model, getLoading) => {
  return {}
}
export default makeConnect('no-station', mapStateToProps)(NoStation)