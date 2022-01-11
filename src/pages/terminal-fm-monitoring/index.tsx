import React from 'react'
import { Modal, LineChart, FullLoading, Dropdown } from 'wanke-gui'
import { Menu, Radio } from 'antd'
import classnames from 'classnames'
import Page from '../../components/Page'
import { makeConnect } from '../umi.helper'
import MakeConnectProps from '../../interfaces/MakeConnectProps'
import { fmMonitoringModal } from './model'
import PageProps from '../../interfaces/PageProps'
import FullContainer from '../../components/layout/FullContainer'
import styles from './index.less'
import { WankeLineOutlined, WankeSetting1Outlined } from 'wanke-icon'
import Card from '../../components/Card/index'
import { CaretDownOutlined } from '@ant-design/icons';
import InfiniteList from './component/infiniteList';
import { history } from 'umi'
import { isTerminalSystem, isStorageSystem, isZh } from '../../core/env'
import utils from '../../public/js/utils';
import AbsoluteFullDiv from '../../components/AbsoluteFullDiv'

interface Props extends MakeConnectProps<fmMonitoringModal>, fmMonitoringModal, PageProps {
    loading: boolean;
    explainModal: boolean;
    levelModal: boolean;
    AGCInstruction: any;
    mergeOutput: any;
    unitOutput: any;
    modalLoading: any;
    stationId: any;
    selectedStationId: any;
    selectedStation: any;
}
const stateColor = {
    '充电中': '#22d62f',
    '调试中': '#859fff',
    '故障中': '#d62237',
    '放电中': '#d6c322',
    '蓄电中': '#0062FF',
    '离线中': '#999999',
    '储能参与中': '#22d63b',
    '储能未参与': '#999999'
};//根据不同状态确定颜色
const stateBgColor = {
    '充电中': '#22d62f1a',
    '调试中': '#859fff1a',
    '故障中': '#d622371a',
    '放电中': '#d6c3221a',
    '蓄电中': '#0062FF1a',
    '离线中': '#9999991a',
    '储能参与中': '#22d63b1a',
    '储能未参与': '#9999991a'
};//根据不同状态确定颜色
const stateIcon = {
    '充电中': require('./img/wanke-sign-charge.svg'),
    '调试中': require('./img/wanke-sign-debug.svg'),
    '故障中': require('./img/wanke-sign-error.svg'),
    '放电中': require('./img/wanke-sign-discharge.svg'),
    '蓄电中': require('./img/wanke-sign-storage.svg'),
    '离线中': require('./img/wanke-sign-offline.svg'),
};//根据不同状态确定颜色

class FmMonitoring extends React.Component<Props> {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        const { dispatch, stationId, selectedStationId } = this.props;
        // const { dispatch } = this.props;
        // this.props.dispatch({ type: 'fmMonitoring/getCrews' }).then(res => {
        //     this.props.action('init', { dispatch });
        // });
        this.props.dispatch({ type: 'fmMonitoring/updateState', payload: { stationId: selectedStationId } });
        this.props.dispatch({ type: 'fmMonitoring/getCrews' }).then(res => {
            this.props.action('init', { dispatch });
        });
    }

    componentWillUnmount() {
        this.props.action('closeSocket');
        this.props.dispatch({ type: 'fmMonitoring/reset' });
    }
    componentDidUpdate() {
        const { dispatch, stationId, selectedStationId, devId, selectedStation } = this.props;
        if (selectedStationId !== stationId) {
            this.props.dispatch({ type: 'fmMonitoring/getCrews' }).then(res => {
                this.props.dispatch({
                    type: 'fmMonitoring/updateState', payload: {
                        conmandOutputChart: {
                            series: [{
                                name: utils.intl('AGC指令'),
                                unit: 'MW'
                            },
                            {
                                name: utils.intl('合并出力'),
                                unit: 'MW'
                            },
                            {
                                name: utils.intl('机组出力'),
                                unit: 'MW'
                            }]
                        },
                        mergeOutput: null,
                        AGCInstruction: null,
                        unitOutput: null,
                        data: []
                    }
                });

                dispatch({ type: "fmMonitoring/emitSocket", payload: { eventName: 'energyUnit-crew', params: { powerUnitIds: res } } })
                dispatch({ type: "fmMonitoring/emitSocket", payload: { eventName: 'cruve', params: { powerUnitIds: res, timeZone: selectedStation.timeZone, frequency: 'original' } } })
            });
        }
    }
    onCancel = () => {
        this.props.dispatch({ type: 'fmMonitoring/updateState', payload: { open: false } });
    };
    createModal = () => {
        const { open, modalLoading } = this.props;
        return (
            <Modal centered visible={!!open} wrapClassName={styles["detail-modal"]} width={480} title={utils.intl('储能单元状态')} footer={null} onCancel={this.onCancel}>
                <div className={styles["listContainer"]}>
                    {modalLoading && <FullLoading />}
                    {this.createCardList()}
                </div>
            </Modal>
        );
    }
    createCardList = () => {
        const { energyStorageData } = this.props;
        // 由长列表组件替代，后期删除
        let list = energyStorageData.map((v, i) => {
            return (
                <EnergyUnitCard data={v} key={i} />
            );
        });
        return list;
    };
    onMenuClick = ({ key }) => {
        const { energyStorageStation, dispatch, selectedStation } = this.props;
        dispatch({
            type: 'fmMonitoring/updateState', payload: {
                conmandOutputChart: {
                    series: [{
                        name: utils.intl('AGC指令'),
                        unit: 'MW'
                    },
                    {
                        name: utils.intl('合并出力'),
                        unit: 'MW'
                    },
                    {
                        name: utils.intl('机组出力'),
                        unit: 'MW'
                    }]
                },
                AGCInstruction: '', mergeOutput: '', unitOutput: ''
            }
        });
        energyStorageStation.forEach(element => {
            if (element.value === key) {
                dispatch({ type: 'fmMonitoring/updateState', payload: { devName: element.name, devId: element.value } });
                dispatch({ type: "fmMonitoring/emitSocket", payload: { eventName: 'energyUnit-crew', params: { powerUnitIds: element.value } } })
                dispatch({ type: "fmMonitoring/emitSocket", payload: { eventName: 'cruve', params: { powerUnitIds: element.value, timeZone: selectedStation.timeZone, frequency: 'original' } } })
            }
        });
        // this.props.dispatch({ type: 'fmMonitoring/updateState', payload: { devName: energyStorageStation.find(item => item.value + '' === key)?.name } });
        // if (key.split('~')[0] !== devId + '') {
        //     this.setState({
        //         devName: key.split('~')[1],
        //         devId: key.split('~')[0],
        //         index: key.split('~')[2],
        //         startTime: moment().add(-25, 'minute')
        //             .format('HH:mm:ss'),
        //         endTime: moment().add(5, 'minute')
        //             .format('HH:mm:ss')
        //     }, () => {
        //         this.getOutAnaysis();
        //     });
        // }
    };

    onOpen = () => {
        this.props.action('getEnergyUnitAll');
        this.props.dispatch({ type: 'fmMonitoring/updateState', payload: { open: true } });
    };

    render() {
        const { data, conmandOutputChart, devName, AGCInstruction, mergeOutput, unitOutput, energyStorageStation, devId, pageId } = this.props
        const columns = [
            { title: '编号', dataIndex: 'num', key: 'xh', width: '6%' },
            { title: '数据时间', dataIndex: 'dtime', key: 'sjsj', width: '14%' },
            { title: 'AGC指令（MW）', align: 'right', dataIndex: 'AGCInstruction', key: 'agczl', width: '20%' },
            { title: '合并出力（MW）', align: 'right', dataIndex: 'mergeOutput', key: 'hbcl', width: '20%' },
            { title: '机组出力（MW）', align: 'right', dataIndex: 'unitOutput', key: 'jzcl', width: '20%' },
            { title: '储能出力（MW）', align: 'right', dataIndex: 'energyStorageCapacity', key: 'cncl', width: '20%' }
        ]
        const menu = (
            <Menu onClick={this.onMenuClick}>
                {energyStorageStation.map((v, i) => {
                    return <Menu.Item key={v.value}>{v.name}</Menu.Item>;
                })}
            </Menu>
        );

        const firstItem = devId && devId !== '' && data.length ? data[0] : null

        return (
            <Page showStation={true} pageId={pageId}>
                <section className={styles["page-container"]}>
                    <div className={styles["menu"]}>
                        <Radio.Group value={devId} onChange={e => this.onMenuClick({ key: e.target.value })}>
                            {energyStorageStation.map((v, i) => {
                                return <Radio.Button value={v.value}>{v.name}</Radio.Button>
                            })}
                        </Radio.Group>
                    </div>
                    <div className={styles["header"]}>
                        <BorderCard
                            title={(
                                <>
                                    <span>{utils.intl('机组调频状态')}</span>
                                    <span className={styles['tag']} style={{ color: stateColor['储能参与中'], marginLeft: 8, backgroundColor: stateBgColor['储能参与中'] }}>{utils.intl('储能参与中')}</span>
                                </>
                            )}
                            className={styles["header-left"]}
                        >
                            <div className={styles["card"]} style={{ width: '27.3%', marginRight: 16, flexShrink: 0 }}>
                                <DetailCard
                                    title={utils.intl('AGC指令')}
                                    value={AGCInstruction}
                                    unit="MW"
                                />
                            </div>
                            <div className={styles["card"]} style={{ flexGrow: 1, display: 'flex', alignItems: 'center', paddingRight: 16 }}>
                                <div style={{ width: '35%', marginRight: 16, flexShrink: 0 }}>
                                    <DetailCard
                                        title={utils.intl('合并出力')}
                                        value={mergeOutput}
                                        unit="MW"
                                    />
                                </div>
                                <div className={styles["extra-desc"]}>
                                    <div className={styles["extra-desc-item"]}>
                                        <span>{utils.intl('机组出力')}:</span>
                                        <span>{unitOutput}</span>
                                        <span>MW</span>
                                    </div>
                                    <div className={styles["extra-desc-item"]}>
                                        <span>{utils.intl('储能出力')}:</span>
                                        <span>{unitOutput ? (mergeOutput - unitOutput).toFixed(2) : unitOutput}</span>
                                        <span>MW</span>
                                    </div>
                                </div>
                            </div>
                        </BorderCard>
                        <BorderCard
                            title={utils.intl('储能单元状态')}
                            className={styles["header-right"]}
                            aside={<span className={styles["btn"]} onClick={this.onOpen}>{utils.intl('汇总状态') + '>'}</span>}
                        >
                            {firstItem && (
                                <EnergyUnitCard data={firstItem} />
                            )}
                        </BorderCard>
                    </div>
                    <BorderCard
                        containerStyle={{ padding: '16px 0 0 0' }}
                        title={utils.intl('指令/出力曲线')}
                        className={styles["footer"]}
                        aside={(
                            <span
                                className={styles["btn"]}
                                onClick={() => {
                                    if (isTerminalSystem()) {
                                        history.push(`/analysis-query/command-output?powerUnitValue=` + devId);
                                    } else if (isStorageSystem()) {
                                        history.push(`/monographic-analysis/command-output?powerUnitValue=` + devId);
                                    }
                                }}
                            >{utils.intl('详细情况') + '>'}</span>
                        )}
                    >
                        <AbsoluteFullDiv style={{ height: 'calc(100% - 16px)' }}>
                            {this.props.socketLoading['cruve'] && <FullLoading />}
                            <LineChart
                                series={conmandOutputChart.series}
                                xData={conmandOutputChart.xData}
                                yData={conmandOutputChart.yData}
                                options={{yAxisScale: true}}
                            />
                        </AbsoluteFullDiv>
                    </BorderCard>
                </section>
                {this.createModal()}
            </Page>
        )
    }
}

function mapStateToProps(model, getLoading, state) {
    return {
        ...model,
        loading: getLoading('getList'),
        modalLoading: getLoading('getEnergyUnitAll'),
        selectedStationId: state.global.selectedStationId,
        selectedStation: state.global.selectedStation
    }
}

export default makeConnect('fmMonitoring', mapStateToProps)(FmMonitoring)

interface BorderCardProps {
    title: any
    aside?: any
    className?: string
    containerStyle?: React.CSSProperties
}

const BorderCard: React.FC<BorderCardProps> = (props) => {
    const { className } = props

    return (
        <div className={classnames(className, styles['border-card'])}>
            <div className={styles['border-card-title']}>
                <div>{props.title}</div>
                <div>{props.aside}</div>
            </div>
            <div className={styles['border-card-container']} style={props.containerStyle}>{props.children}</div>
        </div>
    )
}

interface DetailCardProps {
    title: string
    value: string
    unit: string
}

const DetailCard: React.FC<DetailCardProps> = (props) => {
    return (
        <div className={styles['detail-card']}>
            <div className={styles['detail-card-title']}>{props.title}</div>
            <div className={styles['detail-card-value']}>
                <span>{props.value}</span>
                <span>{props.unit}</span>
            </div>
        </div>
    )
}

interface EnergyUnitCardProps {
    data: any
    style?: React.CSSProperties
}

const EnergyUnitCard: React.FC<EnergyUnitCardProps> = ({ data = {}, style }) => {
    const iconUrl = stateIcon[data.WorkStatus]

    const renderTimeLasted = () => {
        if (isZh()) {
            return (
                <>
                    已持续
                    <span className={styles['tag-value']}>{data.time?.hour}</span>
                    时
                    <span className={styles['tag-value']}>{data.time?.minute}</span>
                    分钟
                </>
            )
        } else {
            return (
                <>
                    <span className={styles['tag-value']}>{data.time?.hour}</span>
                    h
                    <span> and </span>
                    <span className={styles['tag-value']}>{data.time?.minute}</span>
                    m lasted
                </>
            )
        }
    }
    
    return (
        <div className={styles["card"]} style={{ display: 'flex', justifyContent: 'space-between', ...style }}>
            <div style={{ width: 145, flexShrink: 0 }}>
                <DetailCard
                    title={data.title}
                    value={data.AGCInstruction}
                    unit="MW"
                />
            </div>
            <div className={styles["energy-detail"]}>
                <div className={styles["tag"]} style={{ color: stateColor[data.WorkStatus], backgroundColor: stateBgColor[data.WorkStatus] }}>
                    <span style={{ display: 'flex' }}>
                        {iconUrl ? <img src={iconUrl} style={{ marginRight: 8 }} /> : ''}
                        {data.WorkStatus ? utils.intl(`fm.${data.WorkStatus}`) : ''}
                    </span>
                    {!data.time ? '' : (
                        <span className={styles['tag-desc']} style={{ marginLeft: 8 }}>
                            {renderTimeLasted()}
                        </span>
                    )}
                </div>
                <div className={styles["info"]}>
                    <span>SOC:</span>
                    <span style={{ marginRight: 21 }}>{data.SOC || data.SOC === 0 ? parseFloat(data.SOC.toFixed(2)) : ''}%</span>
                    <span>SOH:</span>
                    <span style={{ marginRight: 16 }}>{data.SOH || data.SOH === 0 ? parseFloat(data.SOH.toFixed(2)) : ''}%</span>
                </div>
            </div>
        </div>
    )
}
