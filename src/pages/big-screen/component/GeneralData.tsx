import React, { useEffect } from "react";
import { connect } from "dva";
import { BarChart, BarAndLineChart } from "wanke-gui";
import styles from "./style/generalData.less";
import moment from 'moment';
import DataItem from './DataItem'
import { unitValueChange, valueUnitChange, arrRange } from '../../page.helper'

const colorGenerationArray = [
    ['#0ce1fa', '#0c86fb']
]

const colorArray = [
    ['#ffd43f', '#f08526'],
    ['#0ce1fa', '#0c86fb']
]

interface Props {
    dispatch: any;
    generalSituation: any;
    generationChart: any;
    storageElectricChart: any;
}

const GeneralData: React.FC<Props> = props => {
    const {
        dispatch,
        generationChart,
        generalSituation,
        storageElectricChart
    } = props;

    useEffect(() => {
    }, [])

    let powerDateFormat, generationChartFormat;
    generationChartFormat = {
        dateFormat: (d) => { return moment(d).format('MM-DD') },
        tooltipDateFormat: 'MM-DD',
        endDate: moment().startOf('day'),
        startDate: moment().subtract(6, 'day').startOf('day'),
        getColor2: (count, index) => {
            return colorGenerationArray[index]
        },
        tickWidth: 40,
        tickValues: arrRange(6)
    }
    powerDateFormat = {
        dateFormat: (d) => { return moment(d).format('MM-DD') },
        tooltipDateFormat: 'MM-DD',
        endDate: moment().startOf('day'),
        startDate: moment().subtract(6, 'day').startOf('day'),
        getColor2: (total, index)=> {
            return colorArray[index]
        },
        tickWidth: 40,
        tickValues: arrRange(6)
    }
    return (
        <div className={'flex1 f-df flex-column'} style={{ flex: 0.28 }}>
            <div className={styles['top'] + ' flex1 f-df flex-column'} style={{ flex: 0.52 }}>
                <div className={styles['title']} style={{ height: '76px', padding: '26px 0 0 30px' }}>
                    <h1 style={{ fontSize: '20px' }}>储能概况</h1>
                </div>
                <div className={styles['data'] + ' flex1 f-df'} style={{ flex: 0.4, padding: '0 0 0 30px', marginBottom: '40px' }}>
                    <div className={styles['storge'] + ' f-df flex-column'}>
                        <DataItem title={'今日充电量'} value={unitValueChange(generalSituation.chargeDay, 'kWh')} unit={valueUnitChange(generalSituation.chargeDay, 'kWh')} />
                    </div>
                    <div className={styles['storge'] + ' f-df flex-column'}>
                        <DataItem title={'本月充电量'} value={unitValueChange(generalSituation.chargeMonth, 'kWh')} unit={valueUnitChange(generalSituation.chargeMonth, 'kWh')} />
                    </div>
                    <div className={styles['storge'] + ' f-df flex-column'}>
                        <DataItem title={'累计充电量'} value={unitValueChange(generalSituation.chargeAmount, 'kWh')} unit={valueUnitChange(generalSituation.chargeAmount, 'kWh')} />
                    </div>
                    <div className={styles['storge'] + ' f-df flex-column'}>
                        <DataItem title={'今日放电量'} value={unitValueChange(generalSituation.dischargeDay, 'kWh')} unit={valueUnitChange(generalSituation.dischargeDay, 'kWh')} />
                    </div>
                    <div className={styles['storge'] + ' f-df flex-column'}>
                        <DataItem title={'本月放电量'} value={unitValueChange(generalSituation.dischargeMonth, 'kWh')} unit={valueUnitChange(generalSituation.dischargeMonth, 'kWh')} />
                    </div>
                    <div className={styles['storge'] + ' f-df flex-column'}>
                        <DataItem title={'累计放电量'} value={unitValueChange(generalSituation.dischargeAmount, 'kWh')} unit={valueUnitChange(generalSituation.dischargeAmount, 'kWh')} />
                    </div>
                </div>
                <div className={styles['data'] + ' flex1'} style={{ flex: 0.60, padding: '0 25px 30px 15px' }}>
                    <BarChart series={storageElectricChart.series} xData={storageElectricChart.xData} yData={storageElectricChart.yData} options={powerDateFormat} />
                </div>
            </div>
            <div className={styles['bottom'] + ' flex1 f-df flex-column'} style={{ marginTop: '20px', flex: 0.48 }}>
                <div className={styles['title']} style={{ height: '76px', padding: '26px 0 0 30px' }}>
                    <h1 style={{ fontSize: '20px' }}>光伏概况</h1>
                </div>
                <div className={styles['data'] + ' flex1 f-df'} style={{ flex: 0.25, padding: '0 0 0 30px', marginBottom: '30px' }}>
                    <div className={styles['pv'] + ' f-df flex-column'}>
                        <DataItem title={'今日发电量'} value={unitValueChange(generalSituation.generationDay, 'kWh')} unit={valueUnitChange(generalSituation.generationDay, 'kWh')} />
                    </div>
                    <div className={styles['pv'] + ' f-df flex-column'}>
                        <DataItem title={'本月发电量'} value={unitValueChange(generalSituation.generationMonth, 'kWh')} unit={valueUnitChange(generalSituation.generationMonth, 'kWh')} />
                    </div>
                    <div className={styles['pv'] + ' f-df flex-column'}>
                        <DataItem title={'累计发电量'} value={unitValueChange(generalSituation.generationAmount, 'kWh')} unit={valueUnitChange(generalSituation.generationAmount, 'kWh')} />
                    </div>
                </div>
                <div className={styles['data'] + ' flex1'} style={{ flex: 0.75, padding: '0 25px 30px 15px' }}>
                    <BarChart series={generationChart.series} xData={generationChart.xData} yData={generationChart.yData} options={generationChartFormat} />
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = state => ({ ...state.screenPage });
export default connect(mapStateToProps)(GeneralData);
