import React from 'react';
import { Tabs } from 'wanke-gui'
import Page from "../../../components/Page";
import { makeConnect } from '../../umi.helper'
import { CaretLeftOutlined, CaretRightOutlined, CloseOutlined } from '@ant-design/icons';
import RealTime from "./component/RealTime";
import Warning from "./component/Warning";
import AccessRoad from "./component/AccessRoad";
import {
    WankeClearOutlined
} from 'wanke-icon'
import utils from '../../../public/js/utils';

import styles from "./index.less"

class TopologicalDetail extends React.Component<any> {
    componentDidMount() {
        const { dispatch, item, allDevice, stationDetail, deviceType,deviceNum } = this.props;
        this.props.updateState({ deviceId: item.id, deviceDetail: item, deviceArr: allDevice, stationDetail: stationDetail, deviceTypeId: deviceType,deviceDetailNum:deviceNum })
        dispatch({ type: 'topologicalDetail/getSelect' }).then(() => {
            dispatch({ type: 'topologicalDetail/init', payload: { dispatch } });
        })
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({ type: 'topologicalDetail/closeSocket' });
        dispatch({ type: 'topologicalDetail/reset' });
    }
    componentDidUpdate(prevProps: Readonly<any>) {
        const { stationDetail } = this.props;
        if (
            JSON.stringify(prevProps.stationDetail)!== '{}' && JSON.stringify(stationDetail) !== JSON.stringify(prevProps.stationDetail)
        ) {
            // this.props.action('reset');
            this.props.back()
            // this.props.updateState({deviceId: item.id, deviceDetail: item, deviceArr: allDevice, stationDetail: stationDetail})
            // this.props.action('emitSocket', { eventName: 'real_data', params: { deviceId: deviceId, type: type } });
            // this.props.action('emitSocket', { eventName: 'electric_current', params: { deviceId: deviceId, stationId: stationDetail.id } });
            // this.props.action('emitSocket', { eventName: 'status', params: { deviceId: deviceId } });
            // this.props.action('emitSocket', { eventName: 'abnormal', params: { deviceId: deviceId, stationId: stationDetail.id } });
        }
    }

    typeChange = (e) => {
        const { deviceId } = this.props;
        this.props.updateState({ type: e,realArr:[] })
        this.props.action('emitSocket', { eventName: 'real_data', params: { deviceId: deviceId, type: e } });
    }
    pageUp = () => {
        const { dispatch, deviceDetailNum, deviceArr, type, deviceId, stationDetail } = this.props;
        dispatch({
            type: 'topologicalDetail/updateState', payload: {
                deviceDetail: deviceArr[deviceDetailNum - 1], deviceId: deviceArr[deviceDetailNum - 1].id, deviceDetailNum: deviceDetailNum - 1
                , realArr: [], electricArr: [], abnormalArr: []
            }
        }).then(() => {
            this.props.action('emitSocket', { eventName: 'real_data', params: { deviceId: deviceArr[deviceDetailNum - 1].id, type: type } });
            this.props.action('emitSocket', { eventName: 'electric_current', params: { deviceId: deviceArr[deviceDetailNum - 1].id, stationId: stationDetail.id } });
            this.props.action('emitSocket', { eventName: 'status', params: { deviceId: deviceArr[deviceDetailNum - 1].id } });
            this.props.action('emitSocket', { eventName: 'abnormal', params: { deviceId: deviceArr[deviceDetailNum - 1].id, stationId: stationDetail.id } });
        });
    }
    pageDown = () => {
        const { dispatch, deviceDetailNum, deviceArr, type, stationDetail } = this.props;
        dispatch({
            type: 'topologicalDetail/updateState', payload: {
                deviceDetail: deviceArr[deviceDetailNum + 1], deviceId: deviceArr[deviceDetailNum + 1].id, deviceDetailNum: deviceDetailNum + 1
                , realArr: [], electricArr: [], abnormalArr: []
            }
        }).then(() => {
            this.props.action('emitSocket', { eventName: 'real_data', params: { deviceId: deviceArr[deviceDetailNum + 1].id, type: type } });
            this.props.action('emitSocket', { eventName: 'electric_current', params: { deviceId: deviceArr[deviceDetailNum + 1].id, stationId: stationDetail.id } });
            this.props.action('emitSocket', { eventName: 'status', params: { deviceId: deviceArr[deviceDetailNum + 1].id } });
            this.props.action('emitSocket', { eventName: 'abnormal', params: { deviceId: deviceArr[deviceDetailNum + 1].id, stationId: stationDetail.id } });
        });
    }
    render() {
        const { deviceDetail, loading, pageId, realArr, electricArr, abnormalArr, deviceArr, deviceStatus, typeArr,item } = this.props;
        return (
            <Page showStation pageId={pageId} pageTitle={'设备详情'}>
                <div className={styles['page'] + " br-bf5 f-df flex-column"} style={{ height: '100%' }}>
                    <div className={styles['header'] + " flex1 f-pr f-df"}>
                        <p>
                            <span>
                                {deviceArr.length && deviceArr[0].id === deviceDetail.id ? <CaretLeftOutlined style={{ color: '#92929d', cursor: 'not-allowed' }} /> : <CaretLeftOutlined style={{ cursor: 'pointer', color: '#000' }} onClick={this.pageUp} />}
                            </span><span style={{ fontSize: '16px', padding: '0 20px 0 20px' }}>{deviceDetail.title}</span>
                            <span>
                                {deviceArr.length && deviceArr[deviceArr.length - 1].id === deviceDetail.id ? <CaretRightOutlined style={{ color: '#92929d', cursor: 'not-allowed' }} /> : <CaretRightOutlined style={{ cursor: 'pointer', color: '#000' }} onClick={this.pageDown} />}
                            </span>
                            <WankeClearOutlined
                                onClick={() => this.props.back()}
                                style={{ position: 'absolute', right: '20px', fontSize: '20px', lineHeight: '46px', color: '#d5d5dc', cursor: 'pointer' }}
                            />
                        </p>
                    </div>
                    <div className="f-pr f-df flex-column" style={{ height: '110px', padding: '20px' }}>
                        <div className="flex1">
                            <span className={styles['status']} style={{color:deviceStatus === '在线'?'#3dd598':'#AAAAAA'}}>{utils.intl(deviceStatus)}</span>
                        </div>
                        <div className={`flex1 ${styles['device-basic-info']}`}>
                            <p className={styles.detail}>
                                <span>{utils.intl('生产厂家')}：{deviceDetail.manufactor}</span>
                                <span className="e-ml20">{utils.intl('型号')}：{deviceDetail.type}</span>
                                <span className="e-ml20">{utils.intl('序列号')}：{deviceDetail.SN}</span>
                                <span className="e-ml20">{utils.intl('备注')}：{deviceDetail.description}</span>
                            </p>
                        </div>
                    </div>
                    <div className="f-pr" style={{ padding: '0 20px 15px 20px' }}>
                        <RealTime typeArr={typeArr} opertion title={utils.intl('实时数据')} value={realArr} typeChange={this.typeChange} deviceStatus={deviceStatus} />
                    </div>
                    <div className="f-pr" style={{ padding: '0 20px 15px 20px' }}>
                        <Warning title={utils.intl('告警')} value={abnormalArr} />
                    </div>
                    <div className="f-pr" style={{ padding: '0 20px 20px 20px' }}>
                    {item.StringNumber >0 ? 
                        <AccessRoad title={utils.intl('支路信息')} value={electricArr} deviceStatus={deviceStatus}/>
                        :''}
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

export default makeConnect('topologicalDetail', mapStateToProps)(TopologicalDetail);