import React from 'react';
import styles from './styles/report-card.less';
import CommonEcharts from '../../../../components/charts/common-echarts/CommonEcharts';
import { useEchartsOption, CustomChartOption } from '../../../../components/charts/common-echarts/useEchartsOption';
import { useCustomLegend } from '../../../../components/charts/common-echarts/useCustomLegend';
import classnames from 'classnames';
import utils from '../../../../public/js/utils';

const colorList = ['#0062ff', '#ff974a', '#fc5a5a'];

interface Props {
  className?: string
  abnormalChart?: any[],
  theme?: 'light' | 'dark'
}

const ReportCard: React.FC<Props> = props => {
  const { className = '', theme } = props;
  const series = props.abnormalChart || [];
  const { option } = useEchartsOption<CustomChartOption.PieChart>({
    type: 'pie',
    showTotalCount: true,
    title: utils.intl('告警'),
    colorList,
    data: {
      series,
    },
    theme,
  });
  const { option: formatOption, hideList, toggleLegend } = useCustomLegend({ option, type: 'pie' });

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
                  <p className={styles["value"]}>{item.value} {item.unit || ''}</p>
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
