import React from 'react';
import {
    GfElectricityOutlined,
    GfOngridProfitOutlined,
    GfOngridPrOutlined,
    GfCo2Outlined,
    GfOngridEnergyOutlined,
    GfYieldOutlined,
    GfSelfConsumptionOutlined,

} from 'wanke-icon'
import styles from "../index.less"
import { unitChange } from '../../../page.helper'
import utils from '../../../../public/js/utils';

interface Props {
    detail?: any
    stationDetail?: any
    stationType?: any;
}

const DetailAll: React.FC<Props> = props => {
    const { detail = {}, stationDetail = {}, stationType } = props;
    let detailArr;
    if (stationType === 0) {
        detailArr = [{
            name: '1', img: <GfElectricityOutlined style={{ fontSize: '44px', color: '#0062ff' }} />, title: utils.intl('今日发电量'),
            mainValue: unitChange((detail?.ongridEnergyDay ?? ''), 'kWh'), valueArr: [unitChange(detail?.ongridEnergyMonth, 'kWh'), unitChange(detail?.ongridEnergyYear, 'kWh'), unitChange(detail?.ongridEnergyAmount, 'kWh')], color: '#0062ff'
        }, {
            name: '331', img: <GfOngridProfitOutlined style={{ fontSize: '44px', color: '#9B51E0' }} />, title: utils.intl('今日收益'),
            mainValue: unitChange((detail?.ongridProfitDay ?? 0) + (detail?.nongridProfitDay ?? 0), utils.intl(stationDetail.currency)),
            valueArr: [
                unitChange((detail?.ongridProfitMonth ?? 0) + (detail?.lgcProfitMonth ?? 0) + (detail?.nongridProfitMonth ?? 0), utils.intl(stationDetail.currency)),
                unitChange((detail?.ongridProfitYear ?? 0) + (detail?.lgcProfitYear ?? 0) + (detail?.nongridProfitYear ?? 0), utils.intl(stationDetail.currency)),
                unitChange((detail?.ongridProfitAmount ?? 0) + (detail?.lgcProfitAmount ?? 0) + (detail?.nongridProfitAmount ?? 0), utils.intl(stationDetail.currency))
            ], color: '#9B51E0'
        }, {
            name: '444', img: <GfOngridPrOutlined style={{ fontSize: '44px', color: '#0062ff' }} />, title: utils.intl('今日PR'),
            mainValue: unitChange((detail?.prDay ?? ''), '%'), valueArr: [unitChange(detail?.prMonth, '%'), unitChange(detail?.prYear, '%'), unitChange(detail?.prAmount, '%')], color: '#0062ff'
        }, {
            name: '555', img: <GfCo2Outlined style={{ fontSize: '44px', color: '#3dd598' }} />, title: utils.intl('今日CO2减排'),
            mainValue: unitChange((detail?.CO2Day ?? ''), 'kg'), valueArr: [unitChange(detail?.CO2Month, 'kg'), unitChange(detail?.CO2Year, 'kg'), unitChange(detail?.CO2Amount, 'kg')], color: '#3dd598'
        }, {
            name: '666', img: <GfYieldOutlined style={{ fontSize: '44px', color: '#0062ff' }} />, title: utils.intl('今日满发时长'),
            mainValue: unitChange((detail?.yieldDay ?? ''), 'h'), valueArr: [unitChange(detail?.yieldMonth, 'h'), unitChange(detail?.yieldYear, 'h'), unitChange(detail?.yieldAmount, 'h')], color: '#0062ff'
        }]
    } else {
        detailArr = [{
            name: '1', img: <GfOngridEnergyOutlined style={{ fontSize: '44px', color: '#0062ff' }} />, title: utils.intl('今日上网电量'),
            mainValue: unitChange((detail?.ongridEnergyDay ?? ''), 'kWh'), valueArr: [unitChange(detail?.ongridEnergyMonth, 'kWh'), unitChange(detail?.ongridEnergyYear, 'kWh'), unitChange(detail?.ongridEnergyAmount, 'kWh')], color: '#0062ff'
        }, {
            name: '331', img: <GfSelfConsumptionOutlined style={{ fontSize: '44px', color: '#0062ff' }} />, title: utils.intl('今日自发自用电量'),
            mainValue: unitChange((detail?.selfConsumptionEnergyDay ?? ''), 'kWh'), valueArr: [unitChange(detail?.selfConsumptionEnergyMonth, 'kWh'), unitChange(detail?.selfConsumptionEnergyYear, 'kWh'), unitChange(detail?.selfConsumptionEnergyAmount, 'kWh')], color: '#0062ff'
        }, {
            name: '331', img: <GfOngridProfitOutlined style={{ fontSize: '44px', color: '#9B51E0' }} />, title: utils.intl('今日收益'),
            mainValue: unitChange((detail?.ongridProfitDay ?? 0) + (detail?.nongridProfitDay ?? 0), utils.intl(stationDetail.currency)),
            valueArr: [
                unitChange((detail?.ongridProfitMonth ?? 0) + (detail?.lgcProfitMonth ?? 0) + (detail?.nongridProfitMonth ?? 0), utils.intl(stationDetail.currency)),
                unitChange((detail?.ongridProfitYear ?? 0) + (detail?.lgcProfitYear ?? 0) + (detail?.nongridProfitYear ?? 0), utils.intl(stationDetail.currency)),
                unitChange((detail?.ongridProfitAmount ?? 0) + (detail?.lgcProfitAmount ?? 0) + (detail?.nongridProfitAmount ?? 0), utils.intl(stationDetail.currency))
            ], color: '#9B51E0'
        }, {
            name: '444', img: <GfOngridPrOutlined style={{ fontSize: '44px', color: '#0062ff' }} />, title: utils.intl('今日PR'),
            mainValue: unitChange((detail?.prDay ?? ''), '%'), valueArr: [unitChange(detail?.prMonth, '%'), unitChange(detail?.prYear, '%'), unitChange(detail?.prAmount, '%')], color: '#0062ff'
        }, {
            name: '666', img: <GfYieldOutlined style={{ fontSize: '44px', color: '#0062ff' }} />, title: utils.intl('今日满发时长'),
            mainValue: unitChange((detail?.yieldDay ?? ''), 'h'), valueArr: [unitChange(detail?.yieldMonth, 'h'), unitChange(detail?.yieldYear, 'h'), unitChange(detail?.yieldAmount, 'h')], color: '#0062ff'
        }]
    }
    let detailDiv = detailArr.map((o, i) => {
        return (
            <div className={styles.greyBorder + " flex1 f-pr e-mt10 f-df"}>
                <div className={styles.imgDiv + " flex1 f-df"} style={{ flex: 0.2 }}>
                    {o?.img}
                </div>
                <div className={styles.titleDiv + " flex1 f-df flex-column"} style={{ flex: 0.4 }}>
                    <span className="e-mt5">
                        {o.title}
                    </span>
                    <span style={{ fontSize: '18px', color: o.color }}>
                        {o?.mainValue}
                    </span>
                </div>
                <div className={"flex1 f-df"} style={{ flex: 0.4 }}>
                    <div className={styles.detailTime + " flex1 f-df flex-column"} style={{ flex: 0.32 }}>
                        <p>{utils.intl('本月')}</p>
                        <p>{utils.intl('本年')}</p>
                        <p>{utils.intl('累计')}</p>
                    </div>
                    <div className={styles.detailValue + " flex1 f-df flex-column"} style={{ flex: 0.68 }}>
                        <p>{o?.valueArr?.[0]}</p>
                        <p>{o?.valueArr?.[1]}</p>
                        <p>{o?.valueArr?.[2]}</p>
                    </div>
                </div>
            </div>
        )
    })
    return (
        <div className="flex1 f-pr f-df flex-column">
            {detailDiv}
        </div>
    );
};

export default DetailAll;
