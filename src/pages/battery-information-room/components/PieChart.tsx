import React from 'react';
import styles from './styles/pieChart.less';
import CommonEcharts from '../../../components/charts/common-echarts/CommonEcharts';
import { useEchartsOption, CustomChartOption } from '../../../components/charts/common-echarts/useEchartsOption';
import { useCustomLegend } from '../../../components/charts/common-echarts/useCustomLegend';
import classnames from 'classnames';
import utils from '../../../public/js/utils';

const colorList = ['#62D56E', '#B0E869', '#F8D835', '#FFAD38', '#E0252F', '#AE0E48'];

interface Props {
    className?: string
    data?: any[],
}

const ReportCard: React.FC<Props> = props => {
    const { className = '' } = props;
    const series = props.data || [];
    let sum = 0;
    const { option } = useEchartsOption<CustomChartOption.PieChart>({
        type: 'pie',
        showTotalCount: false,
        title: utils.intl('健康度分布'),
        colorList,
        data: {
            series,
        },
        customOption: {
            tooltip: {
                borderWidth: 0,
                textStyle: {
                    color: '#fff'
                },
                appendToBody: true,
                formatter: params => {
                    return `${params.name}: ${params.data.value}(${params.percent}%)`;
                }
            },
            // series: [{
            //     label: {        //展示文本设置 
            //         normal: {
            //             show: true,     //展示
            //             position: 'outside'      // outside表示文本显示位置为外部
            //         },
            //         emphasis: {    //文本样式
            //             show: true,    //展示
            //         }
            //     },
            //     labelLine: {    //引导线设置
            //         normal: {
            //             show: true,   //引导线显示
            //             length: 25,
            //             length2: 35
            //         },
            //     },
            // }]
        },

    });
    const { option: formatOption, hideList, toggleLegend } = useCustomLegend({ option, type: 'pie' });

    for (let i = 0; i < props.data.length; i++) {
        sum += props.data[i].value
    }
    return (
        <div className={styles["report-card"]}>
            <article className={styles["content"]}>
                <aside className={styles["left"]}>
                    <CommonEcharts
                        resizeTitle
                        option={formatOption}
                    />
                </aside>
                <section className={styles["right"]}>
                    <span style={{ position: 'absolute', top: '10px', fontSize: '16px' }}>{utils.intl('battery.分')}</span>
                    <div className={styles["legend-container"]}>
                        {
                            series.map((item, index) => (
                                <div
                                    className={classnames(styles["legend"], {
                                        [styles["disabled"]]: hideList.indexOf(item.name) > -1
                                    })}
                                    onClick={() => toggleLegend(item.name)}>
                                    <p className={styles["label"]}>
                                        <span className={styles["icon"]} style={{ backgroundColor: colorList[index] }} />
                                        <span className={styles["title"]}>{item.name}</span>
                                    </p>
                                    <p className={styles["value"]}>{sum === 0 ? 0 : parseFloat((item.value / sum * 100).toFixed(2))} {'%'}</p>
                                </div>
                            ))
                        }
                    </div>
                </section>
            </article>
        </div>
    );
};

export default ReportCard;