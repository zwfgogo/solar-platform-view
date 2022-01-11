import React, { useState, useEffect } from "react";
import styles from "./index.less";
import Page from "../../../components/Page";
import classnames from 'classnames';
import { LineChart, BarChart, Progress, Row, Col, Select, FullLoading } from 'wanke-gui'
import Card from "../../../components/Card/index";
import { makeConnect } from "../../umi.helper"
import BenefitChart from "../components/BenefitChart";
import PieChart from "../components/PieChart";
import { WankeBatteryHealthOutlined, DoubleRightOutlined } from "wanke-icon";
import Forward from "../../../public/components/Forward/index";
import stationLight from '../../../static/img/station_light.svg'
import stationDark from '../../../static/img/station_dark.svg'
import moment from 'moment'
import { getChartMax, getChartMin } from '../../page.helper'
import utils from '../../../public/js/utils';
import ScoreChart from "../components/ScoreChart";
import { history } from 'umi'

const { Option } = Select;
interface Props {
    dispatch: any;
    pageId: any;
    action: any;
    batteryCapacity1: any;
    batteryCapacity2: any[];
    batteryCapacity3: any[];
    deviceArr: any[];
    unitArr: any[];
    stationId: any;
    stations: any[];
    crumbs: any[];
    getHealthLoading: boolean;
    theme: any;
    selectedEnergyUnitId: any;
    selectArr: any[];
    selectUnit: any;
    batteryUnitArr: any[];
    selectUnitName: string;
    energyUnitList: any;
}

const Index: React.FC<Props> = props => {
    const {
        dispatch,
        pageId,
        batteryCapacity1,
        batteryCapacity2,
        batteryCapacity3,
        deviceArr,
        unitArr,
        stationId,
        stations,
        crumbs,
        getHealthLoading,
        theme,
        selectedEnergyUnitId,
        selectArr,
        selectUnit,
        batteryUnitArr,
        selectUnitName,
        energyUnitList
    } = props;

    let [ref, setRefDom] = useState(React.createRef());
    let [batteryArr, setBatteryArr] = useState([]);
    let [batteryCellArr, setBatteryCellArr] = useState([]);
    let [unitBoxplotArr, setUnitBoxplotArr] = useState([]);
    let [batteryUnitBoxplotArr, setBatteryUnitBoxplotArr] = useState([]);

    useEffect(() => {
        props.action('getStations');
        return () => {
            props.action('reset')
        }
    }, []);

    useEffect(() => {
        let newArr = [];
        newArr = deviceArr.slice(0, 10)
        setBatteryArr(deviceArr.length > 10 ? newArr : deviceArr)
    }, [JSON.stringify(deviceArr)]);

    useEffect(() => {
        let newArr = [];
        let boxplotArr = []
        newArr = unitArr.slice(0, 10)
        setBatteryCellArr(unitArr.length > 10 ? newArr : unitArr)
        let quarter = Math.floor(0.25 * unitArr.length)
        let half = Math.floor(0.5 * unitArr.length)
        let threeFourths = Math.floor(0.75 * unitArr.length)
        if (unitArr.length > 0) {
            boxplotArr = [unitArr[0].healthScore, unitArr[quarter > 0 ? quarter - 1 : 0].healthScore, unitArr[half > 0 ? half - 1 : 0].healthScore, unitArr[threeFourths > 0 ? threeFourths - 1 : 0].healthScore, unitArr[unitArr.length - 1].healthScore]
        }
        setUnitBoxplotArr(boxplotArr)
    }, [JSON.stringify(unitArr)]);

    useEffect(() => {
        let boxplotArr = []
        let quarter = Math.floor(0.25 * batteryUnitArr.length)
        let half = Math.floor(0.5 * batteryUnitArr.length)
        let threeFourths = Math.floor(0.75 * batteryUnitArr.length)
        if (batteryUnitArr.length > 0) {
            boxplotArr = [batteryUnitArr[0].healthScore, batteryUnitArr[quarter > 0 ? quarter - 1 : 0].healthScore, batteryUnitArr[half > 0 ? half - 1 : 0].healthScore, batteryUnitArr[threeFourths > 0 ? threeFourths - 1 : 0].healthScore, batteryUnitArr[batteryUnitArr.length - 1].healthScore]
        }
        setBatteryUnitBoxplotArr(boxplotArr)
    }, [JSON.stringify(batteryUnitArr)]);

    useEffect(() => {
        if (selectUnit) {
            props.action('getHealth', { selectedEnergyUnitId, batteryUnitId: selectUnit })
        }
    }, [selectUnit]);

    useEffect(() => {
        if (selectedEnergyUnitId) {
            props.action('getHealthArr', { selectedEnergyUnitId })
            props.action('getAllUnitHealth', { selectedEnergyUnitId })
            props.action('init', {
                energyUnitId: selectedEnergyUnitId,
                deviceTypeName: 'batteryUnit'
            })
        }
    }, [selectedEnergyUnitId]);

    const selectChange = (o, options) => {
        props.action('updateToView', { selectUnit: o, selectUnitName: options.title })
    }


    return (
        <Page pageId={pageId} className={classnames("page-bg1 e-mt5 room", styles.page)} showStation showEnergyUnit>
            <div className={styles['room'] + " f-df"} style={{ height: '100%' }}>
                <div style={{ width: '100%', height: '100%', position: 'relative', flex: 0.36 }}>
                    <Card
                        title={utils.intl('电池单元颗粒度评估统计')}
                        style={{ width: '100%', height: '100%' }}
                        showBorder
                    >
                        <div className="flex1 f-df" style={{ flex: 0.6 }}>
                            <BenefitChart data={batteryCapacity1} />
                        </div>
                        <div className="flex1 f-df" style={{ padding: 24, flex: 0.4 }}>
                            <Card
                                title={utils.intl('电池单元Bottom 10')}
                                style={{ width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.03)', position: 'relative' }}
                                className="flex1 f-df"
                            >
                                <div className="flex1 f-df" style={{ flexWrap: 'wrap', padding: '22px 20px 22px 10px' }}>
                                    {
                                        batteryArr.map((o, i) => {
                                            let color = ''
                                            if (o.healthScore < 50) {
                                                color = '#AE0E48';
                                            } else if (o.healthScore >= 50 && o.healthScore < 60) {
                                                color = '#E0252F';
                                            } else if (o.healthScore >= 60 && o.healthScore < 70) {
                                                color = '#FFAD38';
                                            } else if (o.healthScore >= 70 && o.healthScore < 80) {
                                                color = '#F8D835';
                                            } else if (o.healthScore >= 80 && o.healthScore < 90) {
                                                color = '#B0E869';
                                            } else if (o.healthScore >= 90 && o.healthScore <= 100) {
                                                color = '#62D56E';
                                            }
                                            return (
                                                <Forward to="problemBattery" data={{
                                                    _deviceId: o.deviceId, _type: 'BatteryUnit',
                                                    _healthScore: o.healthScore, _deviceTitle: o.deviceTitle,
                                                    _productionTime: energyUnitList.find((o, i) => o.id === selectedEnergyUnitId)?.productionTime
                                                }}>
                                                    <div className={styles['singleDiv']} style={{ border: `2px solid ${color}` }}>
                                                        <span className={styles['singleValue']}>{o.healthScore}{utils.intl('分')}</span>
                                                        <span className={styles['singleName']} title={o.deviceTitle} style={{ fontSize: 12 }}>{o.deviceTitle}</span>
                                                    </div>
                                                </Forward>
                                            )
                                        })
                                    }
                                </div>
                                <span onClick={() => {
                                    history.push('/information-room/roomDetail')
                                    props.dispatch({ type: 'roomDetail/updateToView', payload: { _selectedEnergyUnitId: selectedEnergyUnitId, _selectType: 'BatteryUnit' } })
                                }} style={{ cursor: 'pointer', color: 'rgba(61, 126, 255, 1)', position: 'absolute', top: '0', right: '30px', lineHeight: '48px' }} >
                                    {utils.intl('查看全部')}
                                </span>
                            </Card>
                        </div>
                    </Card>
                </div>
                <div style={{ width: '100%', height: '100%', marginLeft: '10px', position: 'relative', flex: 0.64 }}>
                    <Card
                        title={utils.intl('单体电池颗粒度评估统计')}
                        showBorder
                        style={{ width: '100%', height: '100%' }}>
                        <div className="f-df flex-column" style={{ height: '100%', padding: '0 24px' }}>
                            <Row className={styles['whiteBorderTitle']}>{utils.intl('全部电池单元汇总')}</Row>
                            <div className={"flex1 f-df " + styles['whiteBorder']}>
                                <div className="flex1 f-df" style={{ flex: 0.48 }}>
                                    <PieChart data={batteryCapacity2} />
                                </div>
                                <div className="flex1 f-df" style={{ padding: 24, flex: 0.52 }}>
                                    <Card
                                        title={utils.intl('单体电池Bottom 10')}
                                        style={{ width: '100%', height: '100%', background: 'rgba(255, 255, 255, 0.03)', position: 'relative', }}
                                    >
                                        <div className="flex1 f-df" style={{ flexWrap: 'wrap', padding: '22px 8px 22px 16px' }}>
                                            {
                                                batteryCellArr.map((o, i) => {
                                                    let color = ''
                                                    if (o.healthScore < 50) {
                                                        color = '#AE0E48';
                                                    } else if (o.healthScore >= 50 && o.healthScore < 60) {
                                                        color = '#E0252F';
                                                    } else if (o.healthScore >= 60 && o.healthScore < 70) {
                                                        color = '#FFAD38';
                                                    } else if (o.healthScore >= 70 && o.healthScore < 80) {
                                                        color = '#F8D835';
                                                    } else if (o.healthScore >= 80 && o.healthScore < 90) {
                                                        color = '#B0E869';
                                                    } else if (o.healthScore >= 90 && o.healthScore <= 100) {
                                                        color = '#62D56E';
                                                    }
                                                    return (
                                                        <Forward to="problemBattery" data={{
                                                            _deviceId: o.deviceId, _type: 'Cell',
                                                            _healthScore: o.healthScore, _deviceTitle: o.deviceTitle,
                                                        }}>
                                                            <div className={styles['singleDiv']} style={{ marginLeft: '10px', border: `2px solid ${color}` }}>
                                                                <span className={styles['singleValue']}>{o.healthScore}{utils.intl('分')}</span>
                                                                <span className={styles['singleName']} style={{ fontSize: 12 }}>{o.deviceTitle}</span>
                                                            </div>
                                                        </Forward>
                                                    )
                                                })
                                            }
                                        </div>
                                        <span onClick={() => {
                                            history.push('/information-room/roomDetail')
                                            props.dispatch({ type: 'roomDetail/updateToView', payload: { _selectedEnergyUnitId: selectedEnergyUnitId, _selectType: 'Cell' } })
                                        }} style={{ cursor: 'pointer', color: 'rgba(61, 126, 255, 1)', position: 'absolute', top: '0', right: '30px', lineHeight: '48px' }} >
                                            {utils.intl('查看全部')}
                                        </span>
                                    </Card>
                                </div>
                            </div>
                            <Row className={styles['whiteBorderTitle']}>
                                <span style={{ lineHeight: '32px' }}>{utils.intl('单个电池单元查询')}</span>
                                <div style={{ marginLeft: 16, float: 'left' }}>
                                    <Select value={selectUnit} onChange={selectChange} dataSource={selectArr}
                                        label={''} style={{ width: 192, display: 'inline-block' }} />
                                </div>
                            </Row>
                            <div className={"flex1 f-df " + styles['whiteBorder']} style={{}}>
                                <div className="flex1 f-df" style={{ flex: 0.48 }}>
                                    <PieChart data={batteryCapacity3} />
                                </div>
                                <div className="flex1 f-df" style={{ padding: 24, flex: 0.52 }}>
                                    <ScoreChart data={[unitBoxplotArr, batteryUnitBoxplotArr]} selectUnitName={selectUnitName} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* <div className="flex1 f-df flex-column" style={{ overflow: 'auto' }}>
                    <div className="flex1 f-df" style={{ width: '100%', height: '100%', position: 'relative', flex: 0.7 }}>
                        </div>
                    <div style={{ width: '100%', height: '100%', marginTop: '10px', position: 'relative', flex: 0.3, minHeight: '250px' }}>
                        <Card
                            title={utils.intl('问题电芯曝光台')}
                            style={{ width: '100%', height: '100%' }}
                            selectArr={selectArr}
                            selectValue={selectProblem}
                            selectChange={o => selectChange(o, 'Problem')}>
                            <div style={{ width: '100%', height: '100%', padding: '10px' }}>
                                <div className={styles["problemCell"]} ref={ref}>
                                    {getHealthLoading && <FullLoading />}
                                    {batteryDom}
                                </div>
                                <Forward to="batteryScore" style={{ position: 'absolute', top: '0', right: '30px', lineHeight: '48px' }} >
                                    {utils.intl('查看更多')}<DoubleRightOutlined />
                                </Forward>
                            </div>
                        </Card>
                    </div>
                </div> */}
            </div>
        </Page >
    );
};

const mapStateToProps = (model, getLoading, state) => {
    return {
        stationId: state.global.stationId,
        stations: state.global.stations,
        selectedEnergyUnitId: state.global.selectedEnergyUnitId,
        energyUnitList: state.global.energyUnitList,
        theme: state.global.theme,
        crumbs: state.crumbs.crumbs,
        getHealthLoading: getLoading('getHealthArr'),
        ...model,
    }
}

export default makeConnect('roomIndex', mapStateToProps)(Index)
