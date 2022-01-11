import React from "react";
import classnames from "classnames";
import CommonEcharts from "../../../../components/charts/common-echarts/CommonEcharts";
import FullLoading from "../../../../components/FullLoading";
import { useEchartsOption, CustomChartOption } from "../../../../components/charts/common-echarts/useEchartsOption";
import styles from './styles/electricChart.less'
import { makeConnect } from '../../../umi.helper'
import moment from 'moment';

const colorList = [
    '#0062ff', '#3dd598', '#ffb076', '#fc5a5a', '#a461d8', '#50b5ff', '#ff9ad5', '#ffc542', '#61a0a8', '#d48265',
    '#91c7ae', '#749f83', '#ca8622', '#bda29a', '#6e7074', '#546570', '#c4ccd3'
];

interface Props {
    className?: string;
    data: any;
    loading?: boolean;
    options?: any;
    theme?: any;
    profitSelect?: any;
    stationType?: any;
}

const ProfitChart: React.FC<Props> = props => {
    const { className = "", loading, data, options, theme, profitSelect, stationType } = props;
    let newOngridPrice = []
    let newNongridPrice = []
    // console.log(data)
    let newData = JSON.parse(JSON.stringify(data))
    // 暂时去掉平均电价，勿删
    // if (profitSelect === 'month') {
    //     if (stationType === 0) {
    //         newOngridPrice = JSON.parse(JSON.stringify(data?.yData?.[2]) || null) || []
    //     } else {
    //         newOngridPrice = JSON.parse(JSON.stringify(data?.yData?.[3]) || null) || []
    //         newNongridPrice = JSON.parse(JSON.stringify(data?.yData?.[4]) || null) || []
    //     }
    // } else if (profitSelect === 'day') {
    //     if (stationType === 0) {
    //         newOngridPrice = JSON.parse(JSON.stringify(data?.yData?.[1]) || null) || []
    //     } else {
    //         newOngridPrice = JSON.parse(JSON.stringify(data?.yData?.[2]) || null) || []
    //         newNongridPrice = JSON.parse(JSON.stringify(data?.yData?.[3]) || null) || []
    //     }
    // }
    // newOngridPrice.map((o: any, i: any) => {
    //     newOngridPrice[i] = newData?.yData[0][i] ? parseFloat((newOngridPrice[i] / newData?.yData[0][i]).toFixed(2)) : ""
    // })
    // newNongridPrice.map((o: any, i: any) => {
    //     newNongridPrice[i] = newData?.yData[1][i] ? parseFloat((newNongridPrice[i] / newData?.yData[1][i]).toFixed(2)) : ""
    // })
    // if ((profitSelect === 'month' || profitSelect === 'day') && newData.yData) {
    //     newData.yData[0] = newOngridPrice;
    //     if (stationType === 1) {
    //         newData.yData[1] = newNongridPrice;
    //     }
    // }
    let unitArr = []
    // console.log(data, options)
    newData.series.map((o, i) => {
        if (unitArr.indexOf(o.unit) <= -1) {
            unitArr.push(o.unit)
        }
    })
    // console.log('22', options, data)
    let option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
            },
        },
        legend: {
            data: newData.series.map((o) => o.name),
            textStyle: {
                color: theme === 'dark' ? '#ccc' : '#333'
            },
            inactiveColor: theme === 'dark' ? '#555' : '#ccc',
            right: 20
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: newData?.xData && newData?.xData.map((o) => moment(o).format(options.tooltipDateFormat)) || [],
                axisLine: {
                    lineStyle: {
                        color: '#92929d'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: ['#f1f1f5']
                    }
                },
            }
        ],
        yAxis: unitArr.map((o, i) => {
            return {
                type: 'value', name: o, axisLine: {
                    lineStyle: {
                        color: '#92929d'
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: [theme === 'dark' ? '#2a2b2d' : '#f1f1f5']
                    }
                },
            }
        }),
        series:
            newData.series.map((o, i) => {
                return {
                    name: o.name, type: options?.types[i], data: newData?.yData?.[i] || [], itemStyle: {
                        color: colorList[i]
                    }, yAxisIndex: unitArr.indexOf(o?.unit) > -1 ? unitArr.indexOf(o?.unit) : '',
                    stack: o.name.indexOf('收益') > -1 ? '收益' : '',
                    barWidth: options?.types[i] === 'bar' ? options.barWidth : ''
                }
            })
    };

    const { option: profit } = useEchartsOption<CustomChartOption.LineChart>({
        type: 'line',
        colorList,
        showLegend: true,
        showUnit: true,
        data: {
            xData: newData?.xData && newData?.xData.map((o) => moment(o).format(options.tooltipDateFormat)) || [],
            yData: newData.yData,
            series: newData.series.map((o, i) => {
                return {
                    ...o,
                    customOption: {
                        type: options?.types[i],
                        yAxisIndex: unitArr.indexOf(o?.unit) > -1 ? unitArr.indexOf(o?.unit) : '',
                        stack: o.name.indexOf('收益') > -1 ? '收益' : '',
                        barWidth: options?.types[i] === 'bar' ? options.barWidth : '',
                        symbol: "none",
                    }
                }
            })
        },
        customOption: {
            grid: {
                left: "70",
                right: "70",
                top: "40",
                bottom: "30"
            },
            legend: {
                data: newData.series.map((o) => o.name),
                textStyle: {
                    color: theme === 'dark' ? '#ccc' : '#333'
                },
                inactiveColor: theme === 'dark' ? '#555' : '#ccc',
                right: unitArr.length > 1 ? undefined : 20
            },
            tooltip: {
                textStyle: {
                    fontSize: options?.types.length < 5 ? 14 : 10
                }
            }
        }
    })
    // console.log(option)
    return (
        <div className={classnames(className, styles["chart-container"])}>
            {loading && <FullLoading />}
            <CommonEcharts option={profit} />
        </div>
    );
};

//绑定layout model ，获取title
function mapStateToProps(model, getLoading, state) {
    return {
        theme: state.global.theme,
        profitSelect: state.stationMonitor.profitSelect,
        stationType: state.stationMonitor.stationType
    };
}

export default makeConnect('stationMonitor', mapStateToProps)(ProfitChart)