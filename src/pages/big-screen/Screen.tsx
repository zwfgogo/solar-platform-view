import React, { useEffect } from "react";
import { connect } from "dva";
import WKConfigProvider from 'wanke-gui/es/config-provider'
import Dark from "wanke-gui/lib/theme/dark"
import styles from "./screen.less";
import GeneralData from "./component/GeneralData";
import EarthData from "./component/EarthData";
import IncomeData from "./component/IncomeData";

Dark['axisColor'] = '#297d93'
Dark['axisFontSize'] = 14

interface Props {
  dispatch: any;
  solar: any;
  storage: any;
  stations: any[];
  time: any;
  generalSituation: any;
  generationChart: any;
  storageElectricChart: any;
  profitChart: any;
  stationDetail: any;
  stationOtherDetail: any;
}

const Screen: React.FC<Props> = props => {
  const {
    dispatch,
    solar,
    storage,
    stations,
    time,
    generalSituation,
    generationChart,
    storageElectricChart,
    profitChart,
    stationDetail,
    stationOtherDetail
  } = props;

  useEffect(() => {
    dispatch({ type: "screenPage/init", payload: { dispatch } })
    dispatch({ type: "screenPage/getTime" })
    const timer = setInterval(() => {
      dispatch({ type: "screenPage/getTime" })
    }, 30 * 1000)
    return () => {
      clearInterval(timer)
      dispatch({ type: "screenPage/reset" })
      dispatch({ type: "screenPage/closeSocket" });
    }
  }, []);

  return (
    <WKConfigProvider theme={Dark}>
      <div className={styles['background']}>
        <div className={styles['top']}>
          <img src={require('./img/big-screen-log.svg')} style={{ margin: '5px 0 0 20px', width: 180 }} />
          <div className={styles['time']}>
            <span>{time.year + '年' + time.month + '月' + time.day + '日' + '  ' + time.time}</span>
          </div>
        </div>
        <div className='flex1 f-pr f-df' style={{ padding: '20px' }}>
          <GeneralData generalSituation={generalSituation} generationChart={generationChart} storageElectricChart={storageElectricChart} dispatch={dispatch} />
          <EarthData solar={solar} storage={storage} stations={stations} dispatch={dispatch} stationDetail={stationDetail} stationOtherDetail={stationOtherDetail} />
          <IncomeData profitChart={profitChart} generalSituation={generalSituation} />
        </div>
      </div>
    </WKConfigProvider>
  );
};

const mapStateToProps = state => ({ ...state.screenPage });
export default connect(mapStateToProps)(Screen);
