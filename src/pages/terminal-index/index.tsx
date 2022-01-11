import React from 'react';
import { Tabs, Row, Col, MultiLineChart } from 'wanke-gui';
import {
    WankeTempatureOutlined,
    WankeStation1Outlined,
    WankeSecurityOutlined,
    WankeOpacityOutlined,
    WankeRate1Outlined,
    WankeStationInfoOutlined,
    WankeWarning2Filled,
    WankeAirConditionFilled,
    WankeGeneratorOutlined
} from 'wanke-icon';
import Page from "../../components/Page";
import styles from './index.less'
import { makeConnect } from '../umi.helper'
import InfoCard from './components/InfoCard';
import RunningCard from './components/RunningCard';
import classnames from 'classnames';
import EnvironmentCard from './components/EnvironmentCard';
import { Terminal_SocketUrl, t_index } from '../constants'
import _ from 'lodash'
import SocketClient from 'socket.io-client';
import { getImageUrl } from '../page.helper';
let socketClient;

function getColor(count, index) {
    const colorList = [
        '#408cff', '#00b28a', '#e84f68', '#c652cb', '#f29e79', '#7ff041', '#c23531', '#2f4554', '#61a0a8', '#d48265'
    ]
    return colorList[index];
}

declare global {
    interface Window { echartTimer: any; }
}
window.echartTimer = window.echartTimer || {};

class Index extends React.Component<any> {
    electricalWarehouseObj = { series: [{ name: "温度", unit: "℃" }, { name: "湿度", unit: "%" }], xData: [], yData: [[], []] };
    batteryWarehouseObj = { series: [{ name: "温度", unit: "℃" }, { name: "湿度", unit: "%" }], xData: [], yData: [[], []] };
    //初始化
    init = () => {
        this.props.action("stationOverviewInfo");
        this.props.action("getStoragesCodeAxios").then(res => {
            this.initState();
        });
    };
    //初始化电站的运行
    initState = () => {
        const { dispatch } = this.props;
        // dispatch({
        //     type: 'indexPage/getEcharts',
        // });
        // this.runStatus('');
        this.socketStart();
    };

    // //运行状态
    // runStatus = (key) => {
    //     const { dispatch, statusCode, environmentCode, nowCode } = this.props;
    //     var runStatusKey = 0;
    //     var runEnvironmentKey;

    //     if (key === '' && environmentCode === undefined) {
    //         runEnvironmentKey = 0;
    //     } else {
    //         runEnvironmentKey = environmentCode;
    //     }
    //     if (nowCode.length) {
    //         // dispatch({
    //         //     type: 'indexPage/runStatusAxios',
    //         //     payload: { devCode: nowCode[runStatusKey].value }
    //         // });
    //         // dispatch({
    //         //     type: 'indexPage/runEnvironmentAxios',
    //         //     payload: { devCode: nowCode[runEnvironmentKey].value }
    //         // });
    //         // runStatusAxios({devCode:this.state.nowCode[runStatusKey].value})
    //         //     .then(res => {
    //         //         if(this.mounted && res.data.results) {
    //         //             this.setState({
    //         //                 runStatus: res.data.results
    //         //             })
    //         //         }
    //         //     })
    //         // runEnvironmentAxios({devCode: this.state.nowCode[runEnvironmentKey].value})
    //         //     .then(res => {
    //         //         if(this.mounted && res.data.results) {
    //         //             this.setState({
    //         //                 runEnvironment: res.data.results
    //         //             })
    //         //         }
    //         //     })
    //     }
    // };
    statusChange = (key) => {
        const { dispatch } = this.props;
        this.props.action("updateState", { statusCode: key });

    }
    socketStart = () => {
        const { detail, dispatch, site, id, echartList, statusCode, runStatus, runEnvironment } = this.props;
        // 如果存在连接 则先关闭
        if (socketClient) {
            socketClient.close()
        }
        socketClient = SocketClient(Terminal_SocketUrl + '/overview', {
            transports: ['websocket'],
            'query': 'token=' + sessionStorage.getItem('token') + '&language=zh',
            forceNew: true,
            reconnectionDelayMax: 10000,
            reconnectionDelay: 10000,
            reconnectionAttempts: 5
        });

        // socketClient.emit('runStatus', { id: statusCode });
        // 监听发送消息
        socketClient.on('runStatus', (data) => {
            let res = JSON.parse(data);
            if (res.results.WorkStatus) {
                let arr = _.clone(runStatus);
                arr[0].value = res.results.WorkStatus
                this.props.action("updateState", {
                    runStatus: arr
                });
            } else if (res.results.Power) {
                let arr = _.clone(runStatus);
                arr[1].value = res.results.Power
                this.props.action("updateState", {
                    runStatus: arr
                });
            } else if (res.results.SOC) {
                let arr = _.clone(runStatus);
                arr[2].value = res.results.SOC
                this.props.action("updateState", {
                    runStatus: arr
                });
            } else if (res.results.SOH) {
                let arr = _.clone(runStatus);
                arr[3].value = res.results.SOH
                this.props.action("updateState", {
                    runStatus: arr
                });
            } else {
                this.props.action("updateState", {
                    runEnvironment: { ...runEnvironment, ...res.results }
                });
            }
        });

        // socketClient.emit('curve', { id: statusCode });
        // 监听发送消息
        socketClient.on('curve', (data) => {
            let res = JSON.parse(data);
            console.log(res)
            if (res.results.EsTemp && res.results.EsTemp.length) {
                let arr = _.clone(this.electricalWarehouseObj)
                console.log(arr)
                for (let o of res.results.EsTemp) {
                    if (arr.xData.indexOf(o.dtime) === -1) {
                        arr.xData = arr.xData.concat(o.dtime)
                    }
                    arr.yData = arr.yData.slice();
                    arr.yData[0] = arr.yData[0].concat(o.val)
                }
                this.electricalWarehouseObj = arr;
                this.props.action("updateState", {
                    electricalWarehouse: this.electricalWarehouseObj
                });
            } else if (res.results.EsHumi && res.results.EsHumi.length) {
                let arr = _.clone(this.electricalWarehouseObj)
                for (let o of res.results.EsHumi) {
                    if (arr.xData.indexOf(o.dtime) === -1) {
                        arr.xData = arr.xData.concat(o.dtime)
                    }
                    arr.yData = arr.yData.slice();
                    arr.yData[1] = arr.yData[1].concat(o.val)
                }
                this.electricalWarehouseObj = arr;
                this.props.action("updateState", {
                    electricalWarehouse: this.electricalWarehouseObj
                });
            } else if (res.results.BcTemp && res.results.BcTemp.length) {
                let arr = _.clone(this.batteryWarehouseObj)
                for (let o of res.results.BcTemp) {
                    if (arr.xData.indexOf(o.dtime) === -1) {
                        arr.xData = arr.xData.concat(o.dtime)
                    }
                    arr.yData = arr.yData.slice();
                    arr.yData[0] = arr.yData[0].concat(o.val)
                }
                this.batteryWarehouseObj = arr;
                this.props.action("updateState", {
                    batteryWarehouse: this.batteryWarehouseObj
                });
            } else if (res.results.BcHumi && res.results.BcHumi.length) {
                let arr = _.clone(this.batteryWarehouseObj)
                for (let o of res.results.BcHumi) {
                    if (arr.xData.indexOf(o.dtime) === -1) {
                        arr.xData = arr.xData.concat(o.dtime)
                    }
                    arr.yData = arr.yData.slice();
                    arr.yData[1] = arr.yData[1].concat(o.val)
                }
                this.batteryWarehouseObj = arr;
                this.props.action("updateState", {
                    batteryWarehouse: this.batteryWarehouseObj
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
            socketClient.emit('runStatus', { id: statusCode });
            socketClient.emit('curve', { id: statusCode });
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
    componentWillMount() {
        // this.init();
    };

    componentDidMount() {
        this.init();
        // window.echartTimer = setInterval(() => { this.init() }, 5000);
    };
    componentWillUnmount() {
        if (socketClient) {
            socketClient.close()
        }
        window.clearInterval(window.echartTimer);
    }
    render() {
        const { runStatus, labelArr, nowCode, runEnvironment, stationOverviewInfo, electricalWarehouse, batteryWarehouse } = this.props;
        const TabPane = Tabs.TabPane;
        let unitArr = ['', 'kW', '%', '%'];
        let labelAll = labelArr.map((o, i) => {
            return (
                <div className={styles.labelItems} key={i}>
                    {o}
                </div>
            )
        });
        let siteRunEnvironment = nowCode.map((o, i) => {
            return (
                <TabPane tab={o.name} key={i}>
                    <div className={styles['running-board']}>
                        <div className={styles['status']}>
                            {runStatus.map((item, index) => (
                                <RunningCard title={item.name} content={`${item.value}${unitArr[index]}`} />
                            ))}
                        </div>
                        <div className={styles['environment']}>
                            <EnvironmentCard
                                title='变压器'
                                icon={[
                                    <WankeTempatureOutlined style={{ fontSize: 20 }} />,
                                    <WankeAirConditionFilled style={{ fontSize: 20 }} />
                                ]}
                                iconExtra={runEnvironment.airConditionerPowerSupport}
                                temperature={runEnvironment.transformerTemp}
                                desc='空调供电'
                                isWarning={runEnvironment.airConditionerPowerSupport !== '正常' && runEnvironment.airConditionerPowerSupport !== ''}
                            />
                            <EnvironmentCard
                                title='电控柜'
                                icon={[
                                    <WankeTempatureOutlined style={{ fontSize: 20 }} />,
                                    <WankeWarning2Filled style={{ fontSize: 20 }} />
                                ]}
                                iconExtra={runEnvironment.fireAlarm}
                                temperature={runEnvironment.electricControlTemp}
                                desc='消防警报'
                                isWarning={runEnvironment.fireAlarm !== '正常' && runEnvironment.fireAlarm !== ''}
                            />
                        </div>
                        <div className={classnames(styles['chart'], styles['first'])}>
                            <div className={styles['chart-info']}>
                                <p className={styles['chart-title']}>电气仓</p>
                                <p className={styles['chart-status']}>
                                    <span>当前温度：<span className={styles.value}>{runEnvironment.electricalWarehouseTemp}</span>℃</span>
                                    <span>当前湿度：<span className={styles.value}>{runEnvironment.electricalWarehouseHumidity}</span>%</span>
                                </p>
                            </div>
                            <div className={styles['chart-content']}>
                                <div className={styles['chart-warp']}>
                                    <MultiLineChart
                                        options={{
                                            getColor,
                                            showSeries: true
                                        }}
                                        series={electricalWarehouse.series}
                                        xData={electricalWarehouse.xData}
                                        yData={electricalWarehouse.yData}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles['chart']}>
                            <div className={styles['chart-info']}>
                                <p className={styles['chart-title']}>电池仓</p>
                                <p className={styles['chart-status']}>
                                    <span>当前温度：<span className={styles.value}>{runEnvironment.batteryWarehouseTemp}</span>℃</span>
                                    <span>当前湿度：<span className={styles.value}>{runEnvironment.batteryWarehouseHumidity}</span>%</span>
                                </p>
                            </div>
                            <div className={styles['chart-content']}>
                                <div className={styles['chart-warp']}>
                                    <MultiLineChart
                                        options={{
                                            getColor,
                                            showSeries: true
                                        }}
                                        series={batteryWarehouse.series}
                                        xData={batteryWarehouse.xData}
                                        yData={batteryWarehouse.yData}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPane>
            )
        });
        return (
            <Page className="bf-br10">
                <section className={styles['page-container']}>
                    <header className={styles['header']}>
                        {/* <div className={styles['title']}>{stationOverviewInfo.title}</div> */}
                        <div className={styles['station-info']}>
                            <div className={styles['station-img']}>
                                {stationOverviewInfo.img ? (
                                    <img className={styles['station-img']} src={getImageUrl(stationOverviewInfo.img)} />
                                ) : (
                                        <img className={styles['empty']} src={require('../../static/img/station-img.png')} />
                                    )}
                            </div>
                            <div className={styles['station-desc']}>{stationOverviewInfo.desc}</div>
                        </div>
                        <div className={styles['station-status']}>
                            <div className={styles['left']}>
                                <InfoCard
                                    icon={<WankeSecurityOutlined style={{ fontSize: 18, marginRight: 10, color: '#408cff' }} />}
                                    title={'安全运行天数'}
                                    position='middle'
                                >
                                    <div style={{ textAlign: 'center', width: '100%', lineHeight: 1 }}>
                                        <span style={{ fontSize: 80 }}>{stationOverviewInfo.safeRunDays}</span>
                                        <span style={{ fontSize: 16 }}>天</span>
                                    </div>
                                </InfoCard>
                            </div>
                            <section className={styles['right']}>
                                <Row className={styles['status']} gutter={10}>
                                    <Col span={8}>
                                        <InfoCard
                                            icon={<WankeOpacityOutlined style={{ fontSize: 18, marginRight: 10, color: '#408cff' }} />}
                                            title={'装机容量'}
                                        >{stationOverviewInfo.capacity}</InfoCard>
                                    </Col>
                                    <Col span={8}>
                                        <InfoCard
                                            icon={<WankeRate1Outlined style={{ fontSize: 18, marginRight: 10, color: '#408cff' }} />}
                                            title={'额定功率'}
                                        >{stationOverviewInfo.power}</InfoCard>
                                    </Col>
                                    <Col span={8}>
                                        <InfoCard
                                            icon={<WankeGeneratorOutlined style={{ fontSize: 18, marginRight: 10, color: '#408cff' }} />}
                                            title={'电站运维类型'}
                                        >{stationOverviewInfo.operationType}</InfoCard>
                                    </Col>
                                    {/* <Col span={6}>
                                        <InfoCard
                                            icon={<WankeStationInfoOutlined style={{ fontSize: 18, marginRight: 10, color: '#408cff' }} />}
                                            title={'特色标签'}
                                        >
                                            <div className={styles['label-container']}>{labelAll.length ? labelAll : '暂无'}</div>
                                        </InfoCard>
                                    </Col> */}
                                </Row>
                                <footer className={styles['address']}>
                                    <InfoCard
                                        icon={<WankeStation1Outlined style={{ fontSize: 18, marginRight: 10, color: '#408cff' }} />}
                                        title={`电站地址：${stationOverviewInfo.address || ''}`}
                                    />
                                </footer>
                            </section>
                        </div>
                    </header>
                    <footer className={styles['footer']}>
                        <span className={styles['title']}>电站运行环境</span>
                        <Tabs defaultActiveKey='0' onChange={this.statusChange}>
                            {siteRunEnvironment}
                        </Tabs>
                    </footer>
                </section>
            </Page>
        );
    }
}

function mapStateToProps(model, getLoading) {
    const { list } = model
    return {
        ...model, loading: getLoading('getList')
    }
}

export default makeConnect(t_index, mapStateToProps)(Index);
