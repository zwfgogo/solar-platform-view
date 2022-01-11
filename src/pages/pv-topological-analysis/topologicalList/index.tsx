import React from 'react';
import classnames from 'classnames';
import { Tabs } from 'wanke-gui'
import Page from "../../../components/Page";
import Forward from "../../../public/components/Forward/index";
import { makeConnect } from '../../umi.helper'
import EmptyImg from '../../../components/emptyImg';
import styles from "./index.less"
import utils from '../../../public/js/utils';
import { getImageUrl } from '../../page.helper';

const { TabPane } = Tabs
class TopologicalList extends React.Component<any> {
    componentDidMount() {
        const { dispatch, stationDetail } = this.props;
        dispatch({ type: 'topological/updateState', payload: { stationDetail } }).then(() => {
            dispatch({ type: 'topological/getDeviceTab' }).then(() => {
                dispatch({ type: 'topological/init', payload: { dispatch } });
            });
        });
    }
    componentDidUpdate(prevProps: Readonly<any>) {
        const { stationDetail, TabNum, dispatch } = this.props;
        if (
            JSON.stringify(prevProps.stationDetail)!== '{}' && JSON.stringify(stationDetail) !== JSON.stringify(prevProps.stationDetail)
        ) {
            dispatch({ type: 'topological/reset' });
            dispatch({ type: 'topological/updateState', payload: { stationDetail } }).then(() => {
                dispatch({ type: 'topological/getDeviceTab' }).then((res)=>{
                    this.props.action('emitSocket', { eventName: 'device', params: { typeId: res, stationId: stationDetail.id } });
                    this.props.action('emitSocket', { eventName: 'base', params: { stationId: stationDetail.id } });
                });
            });
        }
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: 'topological/closeSocket' });
        dispatch({ type: 'topological/reset' });
    }

    onChange = (e) => {
        const { stationDetail } = this.props;
        this.props.updateState({ TabNum: e, deviceArr: [] })
        this.props.action('emitSocket', { eventName: 'device', params: { typeId: e, stationId: stationDetail.id } });
    }

    render() {
        const { stationDetail, detail, pageId, TabNum, deviceArr, deviceTabArr, abnormalChart,weather } = this.props;
        const colorList = ['#AAAAAA','#fc5a5a', '#ff974a', '#0062ff', '#3dd598'];
        let deviceDom = deviceArr.map((item, index) => {
            let status = item.WorkStatus ? item.WorkStatus.toString() : '';
            let deviceColor = '#3dd598'
            if (status === '2') {
                deviceColor = '#0062ff'
            } else if (status === '3') {
                deviceColor = '#ff974a'
            } else if (status === '1') {
                deviceColor = '#3dd598'
            } else if (status === '4') {
                deviceColor = '#fc5a5a'
            }else if (status === '5') {
                deviceColor = '#AAAAAA'
            }
            return (
                <Forward className={styles["bottomContent"] + ' e-p10'} to="topologicalDetail" data={{ item: item, allDevice: deviceArr, deviceNum: index,deviceType:TabNum }} style={{ textAlign: 'center', color: '#fff', backgroundColor: deviceColor }}>
                    <p style={{ paddingTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.title}>{item.title}</p>
                    <p>{!item.ActivePower || status === '5' ? '--': item.ActivePower}</p>
                </Forward>
            )
        })
        return (
            <Page showStation pageId={pageId} className={styles.page}>
                <div className="f-df flex-column" style={{ height: '100%' }}>
                    <div className="flex1 f-pr f-df" style={{ flex: 0.35, minHeight: '210px' }}>
                        <div className="bf-br5 flex1 f-pr" style={{ flex: 0.5 }}>
                            {
                                stationDetail.filePath ? (
                                    <img style={{ width: '100%', height: '100%' }} src={getImageUrl(stationDetail.filePath)} />
                                ) : (
                                        <div style={{ height: '100%' }}><EmptyImg /></div>
                                    )
                            }
                        </div>
                        <div className="bf-br5 flex1 f-pr e-ml10 f-df flex-column common-bg" style={{ padding: '20px 20px 20px 30px' }}>
                            <div className={classnames("flex1", styles.stationName)} style={{ flex: 0.4 }}>
                                <span style={{ fontSize: '20px' }}>{stationDetail.title}</span>
                            </div>
                            <div className={classnames("flex1 e-pt10", styles.stationInfo)}>
                                <p className={styles.detail}>
                                    <span>{utils.intl('建设规模')}：<span>{stationDetail.ratedPowerDisplay}/{stationDetail.scaleDisplay}</span></span>
                                    <span className="e-ml20">{utils.intl('天气')}：<span>{weather[detail.weatherStatus]}</span></span>
                                    <span className="e-ml20">{utils.intl('温度')}：<span>{detail.temperature}℃</span></span>
                                </p>
                                <p className={styles.detail}>
                                    <span>{utils.intl('实时发电功率')}：<span>{detail.PVPower}</span></span>
                                    <span className="e-ml20">{utils.intl('实时辐照强度')}：<span>{detail.irradiance}</span></span>
                                    <span className="e-ml20">{utils.intl('今日满发时长')}：<span>{detail.yieldDay}</span></span>
                                    <span className="e-ml20">{utils.intl('今日发电量')}：<span>{detail.generationDay}</span></span>
                                </p>
                                <p className={styles.detail}>
                                    <span>{utils.intl('地址')}：<span>{stationDetail.address}</span></span>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex1 e-pt10 f-pr">
                        <div className="bf-br5 common-bg" style={{ height: '100%' }}>
                            <Tabs onChange={this.onChange} type="card" activeKey={TabNum}>
                                {
                                    deviceTabArr.map((item, index) => (
                                        <TabPane tab={item.title+'('+item.count+')'} key={item.id}>
                                        </TabPane>
                                    ))
                                }
                            </Tabs>
                            <div style={{ width: '50%', height: '30px', position: 'absolute', right: '20px', top: '17px' }}>
                                <div className={styles["legend-container"]}>
                                    {
                                        abnormalChart.map((item, index) => (
                                            <div
                                                className={styles["legend"]}>
                                                <p className={styles["label"]}>
                                                    <span className={styles["icon"]} style={{ backgroundColor: colorList[index] }} />
                                                    <span className={styles["title"]}>{item.name}:   {item.value}{item.unit || ''}</span>
                                                </p>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className={'e-p10'} style={{ width: '100%', height: '88%', overflow: 'auto' }}>
                                {deviceDom}
                            </div>
                        </div>
                    </div>
                </div>
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        stationDetail: state.global.stationDetail
    };
}

export default makeConnect('topological', mapStateToProps)(TopologicalList);