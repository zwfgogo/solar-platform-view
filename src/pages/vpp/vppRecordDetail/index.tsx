import React from 'react';
import {Row, Col} from 'wanke-gui';
import {connect} from 'dva';
import styles from './index.less';
import Page from "../../../components/Page";
import LineChart from '../../../components/charts/LineChart'

//VPP记录点击时间进入的页面
class VppRecordDetail extends React.Component<any> {

    componentDidMount() {
        const {dispatch,data,actionNum} = this.props;
        dispatch({
            type: 'vppRecordDetail/updateState',
            payload: { record:data,actionDetailNum:actionNum }
        });
        dispatch({
            type: 'vppRecordDetail/getCurve',
        });
        dispatch({
            type: 'vppRecordDetail/getDetail',
        });
    }

    render() {
        const {loading,query,total,pageId,record,echartList,detail} = this.props;
        return (
            <Page className="bf-br10" pageId={pageId} pageTitle={'调度下发时间'}>
                <div className="bf-br10 f-df flex-column" style={{height: '100%', backgroundColor: '#f0f2f5'}}>
                    <div className="f-pr bf-br10" style={{height: '75px'}}>
                        <Row className="e-pl10" style={{lineHeight: '75px'}}>
                            <Col span={8} className="f-tal">
                                <div>
                                    <span>指令下发时间：</span>
                                    <span>{record.issueTime}</span>
                                </div>
                            </Col>
                            <Col span={8} className="f-tal">
                                <div>
                                    <span>下发调度功率：</span>
                                    <span>{record.power}</span>
                                </div>
                            </Col>
                            <Col span={8} className="f-tal">
                                <div>
                                    <span>调度时间：</span>
                                    <span>{record.dispatchTime}</span>
                                </div>
                            </Col>
                        </Row>
                    </div>
                    <div className="f-df f-pr e-mt10" style={{height: '100px'}}>
                        <div className="flex1 f-pr bf-br10 e-mr10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/jiang.png')}/>
                            </div>
                            <div className={styles.detail}>
                                <p style={{fontSize: '30px'}}>{detail.curPower.value}<span style={{fontSize: '14px'}}>{detail.curPower.unit}</span></p>
                                <p style={{fontSize: '14px'}}>当前调度功率</p>
                            </div>
                        </div>
                        <div className="flex1 f-pr bf-br10 e-mr10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/sheng.png')}/>
                            </div>
                            <div className={styles.detail}>
                                <p style={{fontSize: '30px'}}>{detail.maxPower.value}<span style={{fontSize: '14px'}}>{detail.maxPower.unit}</span></p>
                                <p style={{fontSize: '14px'}}>最大调度功率</p>
                            </div>
                        </div>
                        <div className="flex1 f-pr bf-br10 e-mr10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/maidong.png')}/>
                            </div>
                            <div className={styles.detail}>
                                <p style={{fontSize: '30px'}}>{detail.avgPower.value}<span style={{fontSize: '14px'}}>{detail.avgPower.unit}</span></p>
                                <p style={{fontSize: '14px'}}>平均调度功率</p>
                            </div>
                        </div>
                        <div className="flex1 f-pr bf-br10 e-mr10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/dian.png')}/>
                            </div>
                            <div className={styles.detail}>
                                <p style={{fontSize: '30px'}}>{detail.dispatchEnergy.value}<span style={{fontSize: '14px'}}>{detail.dispatchEnergy.unit}</span></p>
                                <p style={{fontSize: '14px'}}>调度能量</p>
                            </div>
                        </div>
                        <div className="flex1 f-pr bf-br10">
                            <div className={styles.picture}>
                                <img src={require('../../../static/img/qian.png')}/>
                            </div>
                            <div className={styles.detail}>
                                <p style={{fontSize: '30px'}}><span style={{fontSize: '14px'}}>{detail.revenue.unit}</span>{detail.revenue.value}</p>
                                <p style={{fontSize: '14px'}}>收益</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex1 f-pr e-mt10 bf-br10 e-p10">
                        {echartList?<LineChart series={echartList.series} xData={echartList.xData} yData={echartList.yData} loading={loading}/>:""}
                    </div>
                </div>
            </Page>
        )
    }
}

function mapStateToProps(state) {
    return {
        ...state.vppRecordDetail, loading: state.loading.effects['vppRecordDetail/getList'],
    };
}

export default connect(mapStateToProps)(VppRecordDetail);
