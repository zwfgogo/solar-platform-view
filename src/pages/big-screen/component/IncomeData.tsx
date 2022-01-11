import React, { useEffect } from "react";
import { connect } from "dva";
import { LineChart } from "wanke-gui";
import PieChart from "./PieChart"
import styles from "./style/incomeData.less";
import moment from 'moment';
import DataItem from './DataItem';
import {
    GfStationSignalOutlined
} from 'wanke-icon'
import { unitValueChange, valueUnitChange } from '../../page.helper'

const colorArray = [
    '#0bfffc'
]

interface Props {
    profitChart: any;
    generalSituation: any;
}

const IncomeData: React.FC<Props> = props => {
    const {
        profitChart,
        generalSituation
    } = props;

    useEffect(() => {
    }, [])
    const getColor = (count, index) => {
        return colorArray[index]
    }

    let powerDateFormat, abnormalChart;
    powerDateFormat = {
        dateFormat: (d) => { return moment(d).format('MM-DD') },
        tooltipDateFormat: 'MM-DD',
        endDate: moment().startOf('day'),
        startDate: moment().subtract(6, 'day').startOf('day'),
        getColor: getColor,
        tickWidth: 40,
        // tickValues: arrRange(7)
    }
    abnormalChart = [
        { name: '储能', value: generalSituation.storageProfitDistribution, unit: '元' },
        { name: '光伏', value: generalSituation.solarProfitDistribution, unit: '元' },
        { name: '其他', value: generalSituation.otherProfitDistribution, unit: '元' },
    ]
    let sum = (generalSituation.storageProfitDistribution + generalSituation.solarProfitDistribution + generalSituation.otherProfitDistribution) ?
        (generalSituation.storageProfitDistribution + generalSituation.solarProfitDistribution + generalSituation.otherProfitDistribution) : 100
    return (
        <div className={'flex1 f-df flex-column'} style={{ flex: 0.28 }}>
            <div className={styles['top'] + ' flex1 f-df flex-column'} style={{ flex: 0.75 }}>
                <div className={styles['title']} style={{ height: '76px', padding: '30px 0 0 30px' }}>
                    <h1 style={{ fontSize: '20px' }}>收益概况</h1>
                </div>
                <div className={styles['data'] + ' flex1 f-df'} style={{ flex: 0.16, padding: '0 0 0 30px', marginBottom: '10px' }}>
                    <div className={styles['income'] + ' f-df flex-column'}>
                        <DataItem title={'今日收益'} value={unitValueChange(generalSituation.profitDay, '元')} unit={valueUnitChange(generalSituation.profitDay, '元')} />
                    </div>
                    <div className={styles['income'] + ' f-df flex-column'}>
                        <DataItem title={'本月收益'} value={unitValueChange(generalSituation.profitMonth, '元')} unit={valueUnitChange(generalSituation.profitMonth, '元')} />
                    </div>
                    <div className={styles['income'] + ' f-df flex-column'}>
                        <DataItem title={'累计收益'} value={unitValueChange(generalSituation.profitAmount, '元')} unit={valueUnitChange(generalSituation.profitAmount, '元')} />
                    </div>
                </div>
                <div className={styles['data'] + ' flex1'} style={{ flex: 0.5, padding: '30px 30px 0 20px' }}>
                    <LineChart series={profitChart.series} xData={profitChart.xData} yData={profitChart.yData} options={powerDateFormat} />
                </div>
                <div className={styles['data'] + ' flex1'} style={{ flex: 0.34, padding: '70px 30px 26px 0' }}>
                    <PieChart
                        abnormalChart={abnormalChart}
                        sum={sum}
                    />
                </div>
            </div>
            <div className={styles['bottom'] + ' flex1 f-df flex-column'} style={{ marginTop: '20px', flex: 0.25 }}>
                <div className={styles['title']} style={{ height: '76px', padding: '26px 0 0 30px' }}>
                    <h1 style={{ fontSize: '20px' }}>节能减排</h1>
                </div>
                <div className={styles['content'] + ' flex1 f-df'}>
                    <div className={styles['data'] + ' flex1 f-df flex-column'}>
                        <div className={styles['cdm']} style={{ flex: 0.35 }}>
                            <div style={{ width: '100%', height: '100%', textAlign: 'center', position: 'relative', top: '8px' }}>
                                <div className={styles['circle']}>
                                </div>
                                <img src={require('../img/reduce.png')} style={{ width: '14px', height: '19px', position: 'absolute', top: '10px', left: '50%', transform: 'translate(-50%, 0px)' }} />
                            </div>
                        </div>
                        <div className={styles['cdm'] + ' f-df flex-column'} style={{ flex: 0.55, textAlign: 'center' }}>
                            <DataItem title={'累计减排'} value={unitValueChange(generalSituation.CO2ReductionAmount, 'kg', 2)} unit={'吨'} />
                        </div>
                    </div>
                    <div className={styles['data'] + ' flex1 f-df flex-column'}>
                        <div className={styles['cdm']} style={{ flex: 0.35 }}>
                            <div style={{ width: '100%', height: '100%', textAlign: 'center', position: 'relative', top: '8px' }}>
                                <div className={styles['circle']}>
                                </div>
                                <img src={require('../img/coal.png')} style={{ width: '14px', height: '19px', position: 'absolute', top: '10px', left: '50%', transform: 'translate(-50%, 0px)' }} />
                            </div>
                        </div>
                        <div className={styles['cdm'] + ' f-df flex-column'} style={{ flex: 0.55, textAlign: 'center' }}>
                            <DataItem title={'节约标煤'} value={unitValueChange(generalSituation.saveStandardCoalAmount, 'kg', 2)} unit={'吨'} />
                        </div>
                    </div>
                    <div className={styles['data'] + ' flex1 f-df flex-column'}>
                        <div className={styles['cdm']} style={{ flex: 0.35 }}>
                            <div style={{ width: '100%', height: '100%', textAlign: 'center', position: 'relative', top: '8px' }}>
                                <div className={styles['circle']}>
                                </div>
                                <img src={require('../img/plant.png')} style={{ width: '14px', height: '19px', position: 'absolute', top: '10px', left: '50%', transform: 'translate(-50%, 0px)' }} />
                            </div>
                        </div>
                        <div className={styles['cdm'] + ' f-df flex-column'} style={{ flex: 0.55, textAlign: 'center' }}>
                            <DataItem title={'等效植树'} value={unitValueChange(generalSituation.treePlantAmount, 'kg')} unit={valueUnitChange(generalSituation.treePlantAmount, '棵')} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({ ...state.screenPage });
export default connect(mapStateToProps)(IncomeData);
