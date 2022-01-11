import React from "react";
import classnames from "classnames";
import CommonEcharts from "../../../components/charts/common-echarts/CommonEcharts";
import FullLoading from "../../../components/FullLoading";
import styles from "./styles/scoreChart.less";
import { useEchartsOption, CustomChartOption } from "../../../components/charts/common-echarts/useEchartsOption";
import { splitString } from "../../storage-topic-abnormal/components/eventAbnormal";

const colorList = ["#ff4d4d", "#0062ff", "#ffa200"];

interface Props {
    className?: string;
    data: any;
    loading?: boolean;
    selectUnitName: any;
}

const BenefitChart: React.FC<Props> = props => {
    const { className = "", loading } = props;
    let yAxisArr = ['能量单元全部', props.selectUnitName]

    const option = {
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            },
            borderWidth: 0,
            textStyle: {
                color: '#fff'
            },
            formatter: function (param) {
                return [
                    yAxisArr[param.dataIndex] + ': ',
                    '最高：' + param.data[5],
                    '四分之三：' + param.data[4],
                    '中位：' + param.data[3],
                    '四分之一：' + param.data[2],
                    '最低：' + param.data[1]
                ].join('<br/>')
            },
            appendToBody: true
        },
        grid: {
            left: '18%',
            right: '10%',
            bottom: '15%',
        },
        yAxis: {
            type: 'category',
            boundaryGap: true,
            nameGap: 30,
            splitArea: {
                show: false
            },
            splitLine: {
                show: false
            },
            lineStyle: {
                color: "#888",
            },
            nameTextStyle: {
                color: "#888",
            },
            axisLabel: {
                color: "#92929d",
                fontWeight: "lighter",
                formatter: function (params, index) {
                    return splitString(yAxisArr[params], 8);
                }
            }
        },
        xAxis: {
            type: 'value',
            name: '分',
            splitLine: {
                show: false
            },
            axisLine: {
                show: true,
                lineStyle: {
                    color: "#888",
                },
            },
            nameTextStyle: {
                color: "#888",
            },
            axisLabel: {
                color: "#92929d",
                fontSize: 10,
                fontWeight: "lighter",
            }
        },
        series: [
            {
                name: 'boxplot',
                type: 'boxplot',
                datasetIndex: 1,
                itemStyle: {
                    color: 'rgba(71, 204, 84, 0.15)',
                    borderColor: '#47CC54'
                },
                data: props.data,
            },
        ],
    };

    return (
        <div className={classnames(className, styles["chart-container"])}>
            {loading && <FullLoading />}
            <CommonEcharts option={option} />
        </div>
    );
};

export default BenefitChart;
