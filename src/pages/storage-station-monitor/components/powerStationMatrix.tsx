import React, { useEffect } from "react";
import { Row, Col, Empty } from 'wanke-gui'
import { connect } from "dva";
import PowerStationCard from "./powerStationCard";
import styles from "./styles/powerStationMatrix.less";
import FullLoading from "../../../components/FullLoading";
import { makeConnect } from "../../umi.helper";
import { storage_station_monitor } from "../../constants";

interface Props {
  dispatch?: any;
  queryStr?: string;
  matrixList?: Array<any>;
  tableLoading?: boolean;
  realStationMap?: any;
}

const PowerStationMatrix: React.FC<Props> = props => {
  const { tableLoading, queryStr, dispatch, matrixList, realStationMap } = props;
  const rowList = [];
  let row = [];
  /* 四个卡片一行 */
  matrixList.forEach((item, index) => {
    row.push(item);
    if ((index + 1) % 4 === 0) {
      rowList.push(row);
      row = [];
    }
  });
  row.length && rowList.push(row);

  useEffect(() => {
    fetchData({ queryStr });
  }, []);

  const fetchData = (params: { queryStr: string }) => {
    props.action("getMatrixData", {
      queryStr: params.queryStr
    });
  };

  return (
    <div className={styles["page-container"]}>
      {tableLoading && <FullLoading />}
      <div className={styles["card-container"]}>
        {rowList.map((row, row_i) => (
          <Row key={row_i} className={styles["row"]} gutter={14}>
            {row.map((item, index) => (
              <Col key={index} span={6}>
                <PowerStationCard data={item}  realData={realStationMap[item.id]} dispatch={dispatch} />
              </Col>
            ))}
          </Row>
        ))}
        {
          rowList.length == 0 && !tableLoading && (
            <div className="vh-center h100">
              <Empty description="找不到符合条件的电站"/>
            </div>
          )
        }
      </div>
    </div>
  );
};

const mapStateToProps = (model, { getLoading }, state) => {
  const { matrixList, queryStr, realStationMap } = model;

  let results = {
    queryStr,
    matrixList,
    realStationMap,
    tableLoading: getLoading('getMatrixData')
  };
  return results;
};

export default makeConnect(storage_station_monitor, mapStateToProps)(PowerStationMatrix);
