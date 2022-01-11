import React from 'react';
import { Button, Row, Col, Select, Input, Table } from 'wanke-gui';
import { connect } from 'dva';
import Header from '../../../components/Header/index';
import styles from './index.less';
import WhiteBox from './component/Box/index';
import moment from 'moment';
import Page from "../../../components/Page";
import ListItemDelete from '../../../components/ListItemDelete/index'
import Forward from "../../../public/components/Forward/index";
import LineChart from '../../../components/charts/LineChart'
import _ from 'lodash'
import { Socket_Port } from '../../../pages/constants'

import SocketClient from 'socket.io-client';
let socketClient;
//VPP点击图进入的页面
class VppEchartDetail extends React.Component<any> {
    a = {
        xData: [], yData: [[], [], []], series: [{
            name: '可用输出功率',
            unit: 'kW'
        },
        {
            name: '可用输入功率',
            unit: 'kW'
        },
        {
            name: '调度功率',
            unit: 'kW'
        }]
    };
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'vppEchartDetail/getDetail',
        }).then(res => {
            this.socketStart();
        });
        // window.echartTimer = setInterval(function () {
        //     dispatch({
        //         type: 'vppEchartDetail/getDetail',
        //     });
        //     dispatch({
        //         type: 'vppEchartDetail/getCurve',
        //     });
        // }, 5000);
    }
    socketStart = () => {
        const { detail, dispatch, stationId, echartList } = this.props;
        socketClient = SocketClient(Socket_Port + '/vpp-detail', {
            transports: ['websocket'],
            'query': 'token=' + sessionStorage.getItem('token') + '&language=zh'
        });
        // socketClient.emit('summary', { id: stationId });

        // 监听发送消息
        socketClient.on('summary', (data) => {
            let res = JSON.parse(data);
            dispatch({
                type: 'vppEchartDetail/updateState',
                payload: {
                    detail: { ...detail, ...res.results }
                },
            });
        });
        // socketClient.emit('powerCurve', { id: stationId });
        // 监听发送消息
        socketClient.on('powerCurve', (data) => {
            let res = JSON.parse(data);
            if (res.results.activePower && res.results.activePower.length) {
                let arr = _.clone(this.a)
                for (let o of res.results.activePower) {
                    if (arr.xData.indexOf(o.dtime) === -1) {
                        arr.xData = arr.xData.concat(o.dtime)
                    }
                    arr.yData[2] = arr.yData[2].concat(o.val)
                }
                this.a = arr;
                dispatch({
                    type: 'vppEchartDetail/updateState',
                    payload: {
                        echartList: this.a
                    },
                });
            } else if (res.results.avlInputPower && res.results.avlInputPower.length) {
                let arr = _.clone(this.a)
                for (let o of res.results.avlInputPower) {
                    if (arr.xData.indexOf(o.dtime) === -1) {
                        arr.xData = arr.xData.concat(o.dtime)
                    }
                    arr.yData[1] = arr.yData[1].concat(o.val)
                }
                this.a = arr;
                dispatch({
                    type: 'vppEchartDetail/updateState',
                    payload: {
                        echartList: this.a
                    },
                });
            } else if (res.results.avlOutputPower && res.results.avlOutputPower.length) {
                let arr = _.clone(this.a)
                for (let o of res.results.avlOutputPower) {
                    if (arr.xData.indexOf(o.dtime) === -1) {
                        arr.xData = arr.xData.concat(o.dtime)
                    }
                    arr.yData[0] = arr.yData[0].concat(o.val)
                }
                this.a = arr;
                dispatch({
                    type: 'vppEchartDetail/updateState',
                    payload: {
                        echartList: this.a
                    },
                });
            }
        });
        // socketClient.on('error', (err) => {});
        socketClient.on('serverError', (err) => { });
        // socketClient.on('connect_error', (err) => {
        // });
        socketClient.on('reconnect', (data) => {
            //  .emit('updateUser', localStorage.getItem('access-token'));
            // this.props.showSpin();
            // socketClient.emit('server', this.cellsubmit);
            // this.socketStart();
        });
        socketClient.on('connect', (data) => {
            //  .emit('updateUser', localStorage.getItem('access-token'));
            // this.props.showSpin();
            // socketClient.emit('server', this.cellsubmit);
            // this.socketStart();
            socketClient.emit('summary', { id: stationId });
            socketClient.emit('powerCurve', { id: stationId });
        });
        socketClient.on('connect_timeout', (err) => {
        });
        socketClient.on('authenticated', function () {
            //token校验成功
        });
        socketClient.on('unauthorized', function (msg) {
            //token校验失败
        });
    }

    componentWillUnmount() {
        // window.clearInterval(window.echartTimer)
        // 关闭socket连接
        if (socketClient) {
            socketClient.close();
        }
    }
    render() {
        const { loading, query, total, pageId, pageTitle, detail, echartList } = this.props;
        return (
            <Page className="bf-br10" pageId={pageId} pageTitle={pageTitle}>
                <div className="bf-br10 f-df flex-column" style={{ height: '100%', backgroundColor: '#f0f2f5' }}>
                    <div className="f-df f-pr" style={{ height: '100px' }}>
                        <div className="flex1 f-pr bf-br10 e-mr10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/jiang.png')} />
                            </div>
                            <div className={styles.detail}>
                                <p style={{ fontSize: '30px' }}>{detail.exportPower.value}<span style={{ fontSize: '14px' }}>{detail.exportPower.unit}</span></p>
                                <p style={{ fontSize: '14px' }}>可用输出功率</p>
                            </div>
                        </div>
                        <div className="flex1 f-pr bf-br10 e-mr10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/sheng.png')} />
                            </div>
                            <div className={styles.detail}>
                                <p style={{ fontSize: '30px' }}>{detail.importPower.value}<span style={{ fontSize: '14px' }}>{detail.importPower.unit}</span></p>
                                <p style={{ fontSize: '14px' }}>可用输入功率</p>
                            </div>
                        </div>
                        <div className="flex1 f-pr bf-br10 e-mr10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/maidong.png')} />
                            </div>
                            <div className={styles.detail}>
                                <p style={{ fontSize: '30px' }}>{detail.dispatchPower.value}<span style={{ fontSize: '14px' }}>{detail.dispatchPower.unit}</span></p>
                                <p style={{ fontSize: '14px' }}>调度功率</p>
                            </div>
                        </div>
                        <div className="flex1 f-pr bf-br10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/dian.png')} />
                            </div>
                            <div className={styles.detail}>
                                <p style={{ fontSize: '30px' }}>{detail.dispatchEnergy.value}<span style={{ fontSize: '14px' }}>{detail.dispatchEnergy.unit}</span></p>
                                <p style={{ fontSize: '14px' }}>调度能量</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex1 f-pr e-mt10 bf-br10 f-df flex-column">
                        <Row className="e-p10">
                            <Col span={22} className="f-tal">

                            </Col>
                            <Col span={2} className="f-tar">
                                <Forward to={'vppRecord'} data={{ action: 2 }}>
                                    <span style={{ cursor: 'pointer', position: 'relative', right: '15px' }}>
                                        <img src={require('../../../static/img/record.png')} />
                                        <span style={{ textDecoration: 'underline', color: '#669eff', position: 'relative', top: '2px', left: '10px' }}>记录</span>
                                    </span>
                                </Forward>
                            </Col>
                        </Row>
                        <div className="flex1 e-pt10 f-pr">
                            <LineChart series={echartList.series} xData={echartList.xData} yData={echartList.yData} loading={loading} />
                        </div>
                    </div>
                </div>
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.vppEchartDetail, loading: state.loading.effects['vppEchartDetail/getList'],
    };
}

export default connect(mapStateToProps)(VppEchartDetail);
