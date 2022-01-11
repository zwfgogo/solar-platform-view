import React from 'react';
import { Button, Row, Col, Select, Input, Table, Modal } from 'wanke-gui';
import { connect } from 'dva';
import Header from '../../../components/Header/index';
import styles from './index.less';
import WhiteBox from './component/Box/index';
import moment from 'moment';
import Page from "../../../components/Page";
import ListItemDelete from '../../../components/ListItemDelete/index'
import Forward from "../../../public/components/Forward/index";
import VppModal from "./component/vppFrom";
import LineChart from '../../../components/charts/LineChart'
const { confirm } = Modal
import _ from 'lodash'
import {Socket_Port, globalNS} from '../../../pages/constants'

import SocketClient from 'socket.io-client';
let socketClient;
//VPP监控主页面
class VppMonitor extends React.Component<any> {
    componentWillUnmount() {
        const { dispatch } = this.props;
        // window.clearInterval(window.svgTimer)
        // 关闭socket连接
        dispatch({ type: "vppMonitor/closeSocket" });
        dispatch({
            type: 'vppMonitor/updateState',
            payload: {
                echartList:{xData:[],yData:[[],[],[]],series:[{
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
                   }]}}
        });
    }
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'vppMonitor/getDetail',
        });
        dispatch({
            type: 'vppMonitor/getSite',
        }).then(res=>{
            dispatch({ type: "vppMonitor/initSocket", payload: { dispatch, id: this.props.id } })
            // this.socketStart();
        });
        // dispatch({
        //     type: 'vppMonitor/getCurve',
        // }).then(res=>{
        //     this.socketStart();
        // });
        // window.svgTimer = setInterval(function () {
        //     dispatch({
        //         type: 'vppMonitor/getDetail',
        //     });
        //     dispatch({
        //         type: 'vppMonitor/getSite',
        //     });
        //     dispatch({
        //         type: 'vppMonitor/getCurve',
        //     });
        // }, 30000);
    }

    showConfirm = () => {
        const { dispatch } = this.props;
        confirm({
            title: '您确定要停止吗',
            content: '',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                dispatch({
                    type: 'vppMonitor/deleteVpp',
                });
            },
            onCancel() { },
        });
    }
    showModal = (e) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'vppMonitor/getDetail',
        });
        if (e.target.innerText === '输 出') {
            dispatch({
                type: 'vppMonitor/updateState',
                payload: {
                    vppModal: true, modalTitle: '输出调度指令'
                },
            });
        } else if (e.target.innerText === '输 入') {
            dispatch({
                type: 'vppMonitor/updateState',
                payload: {
                    vppModal: true, modalTitle: '输入调度指令'
                },
            });
        } else {
            this.showConfirm(); 
        }
    };
    render() {
        const { query, total, vppModal, inType, outType, pageId, pageTitle, detail, site, echartList, loading, dispatch } = this.props;
        let canDispatch = false;
        let houseDom = site.map((o, i) => {
            let status = '断开连接'
            if(o.heartBeatAnalog === 1){
                status = '已连接'
            }else{
                status = '断开连接'
            }
            if(o.dispatchStatusAnalog === 1){
                status = '调度中'
            }
            if (status !== '断开连接' || (inType === '停止' || outType === '停止')) {
                canDispatch = true;
            }
            return (
                <div style={{ width: '25%', height: '100%', float: 'left' }} className={(i + 1) % 4 ? "e-pr10 e-pt10" : "e-pt10"}>
                    <WhiteBox dispatchname={dispatch} style={{ width: '100%', height: '100%', float: 'left' }} 
                    className="flex1 f-pr bf-br10" title={o.title} status={status} page={o.isLink ? 'vppEchartDetail' : ''} id={o.id}>
                        {o.xData && o.xData.length ?
                            <div style={{ height: '90%' }}>
                                <LineChart series={o.series} xData={o.xData} yData={o.yData} />
                            </div>
                            :
                            <div style={{ textAlign: 'center', position: 'relative', top: '50%', transform: 'translate(0px, -50%)', fontSize: '30px' }}>
                                无数据
                            </div>
                        }
                    </WhiteBox>
                </div>
            )
        })
        return (
            <Page className="page-bg1" pageId={pageId} pageTitle={pageTitle}>
                <div className=" f-df flex-column" style={{ height: '100%' }}>
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
                                <Button disabled={inType === '停止' || canDispatch === false} type="primary" onClick={(e) => this.showModal(e)}
                                    style={{
                                        backgroundColor: outType === '停止' ? '#dedede' : '', color: outType === '停止' ? '#000' : '',
                                        border: outType === '停止' ? '1px solid #dedede' : ''
                                    }}>{outType === '停止' ? '停止' : '输出'}</Button>
                                <Button disabled={outType === '停止' || canDispatch === false} className={'e-ml10'} type="primary" onClick={this.showModal}
                                    style={{
                                        backgroundColor: inType === '停止' ? '#dedede' : '', color: inType === '停止' ? '#000' : '',
                                        border: inType === '停止' ? '1px solid #dedede' : ''
                                    }}>{inType === '停止' ? '停止' : '输入'}</Button>
                            </Col>
                            <Col span={2} className="f-tar">
                                <Forward to={'vppRecord'} data={{ action: 1 }}>
                                    <span style={{ cursor: 'pointer', position: 'relative', right: '15px' }}>
                                        <img src={require('../../../static/img/record.png')} />
                                        <span style={{ textDecoration: 'underline', color: '#669eff', position: 'relative', top: '2px', left: '10px' }}>记录</span>
                                    </span>
                                </Forward>
                            </Col>
                        </Row>
                        <div className={"flex1 e-pt10 f-pr " + styles.LineChart}>
                            <LineChart series={echartList.series} xData={echartList.xData} yData={echartList.yData} />
                        </div>
                    </div>
                    <div className="flex1 f-pr " style={{height:'366px'}}>
                        {houseDom}
                    </div>
                    {vppModal ? <VppModal /> : ''}
                </div>
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.vppMonitor, loading: state.loading.effects['vppMonitor/getCurve'],
        time: state[globalNS].time
    };
}

export default connect(mapStateToProps)(VppMonitor);
