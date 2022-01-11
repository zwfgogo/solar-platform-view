import React, { useEffect } from "react";
import { Modal, Table, Pagination, Table1 } from 'wanke-gui'
import { connect } from "dva";
import styles from "./styles/abnormalDetailModal.less";
import moment from "moment";
import CustomDownload, {
  formatExportData
} from "../../../components/CustomDownload";
import { useTable } from "../../../components/useTable";
import RangePicker from "../../../components/rangepicker";
import { crumbsNS } from "../../constants";
import utils from "../../../public/js/utils";

interface Props {
  dispatch?: any;
  visible?: boolean;
  size?: number;
  page?: number;
  queryStr?: string;
  totalCount?: number;
  list?: Array<any>;
  tableLoading?: boolean;
  exportTableLoading?: boolean;
  startDate?: string;
  endDate?: string;
  stationId?: string;
}

const AbnormalDetailModal: React.FC<Props> = ({
  dispatch,
  totalCount,
  startDate,
  endDate,
  visible,
  tableLoading,
  exportTableLoading,
  list,
  page,
  size,
  stationId
}) => {
  const isMonth = startDate && /^\d{4}-\d{2}$/.test(startDate);

  useEffect(() => {
    if (visible) {
      setTimeout(() => {
        fetchData({ page, size });
      }, 300);
    } else {
      dispatch({ type: "abnormalDetail/reset" });
    }
  }, [visible]);

  const fetchData = (params: { page: number; size: number }) => {
    dispatch({
      type: "abnormalDetail/getTableData",
      payload: {
        page: params.page,
        size: params.size,
        stationId
      }
    });
  };

  const showTotal = (total: number) => {
    return <span className={styles["total-account"]}>{utils.intl(`共{${total}}条`)}</span>;
  };

  const { changePage, changeSize } = useTable({
    page,
    size,
    fetchData,
    dataSource: list
  });

  const columns: any = [
    {
      title: utils.intl('发生时间'),
      dataIndex: "startTime"
    },
    {
      title: utils.intl('异常名称'),
      dataIndex: "alarmTitle"
    },
    {
      title: utils.intl('设备对象'),
      dataIndex: "devTitle"
    }
  ];

  const fetchExportData = () => {
    return new Promise(r => {
      dispatch({
        type: "abnormalDetail/exportTableData",
        payload: {
          stationId,
          success: tableData => {
            r({ results: formatExportData(tableData, columns) });
          }
        }
      });
    });
  };

  return (
    <Modal
      title={utils.intl('异常详细数据')}
      footer={null}
      className={styles["modal"]}
      visible={visible}
      width={1000}
      onCancel={() =>
        dispatch({
          type: "abnormalDetail/updateToView",
          payload: { visible: false }
        })
      }
    >
      <div className={styles["content"]}>
        <div className={styles["menu"]}>
          <div>
            <span>{utils.intl('日期')}：</span>
            <RangePicker
              disabled
              allowClear={false}
              mode={isMonth ? ["month", "month"] : ["date", "date"]}
              format={isMonth ? "YYYY-MM" : "YYYY-MM-DD"}
              value={[moment(startDate), moment(endDate)]}
            />
          </div>
          <div style={{ flexGrow: 1, textAlign: 'right' }}>
            <CustomDownload
              dataSource={() => {
                return fetchExportData();
              }}
              className={styles["export-btn"]}
              columns={columns}
              loading={exportTableLoading}
            />
          </div>
        </div>
        <div className={styles["table-container"]}>
          <Table1
            x={0}
            dataSource={list}
            columns={columns}
            loading={tableLoading}
            rowKey="key"
          />
        </div>
        <div className={styles["page-footer"]}>
          <Pagination
            current={page}
            total={totalCount}
            pageSize={size}
            pageSizeOptions={["20", "30", "50", "100"]}
            showTotal={showTotal}
            onChange={changePage}
            onShowSizeChange={changeSize}
            showSizeChanger
            showQuickJumper={true}
          />
        </div>
      </div>
    </Modal>
  );
};

const mapStateToProps = state => {
  const { tableData, startDate, endDate, visible } = state.abnormalDetail;

  let results = {
    startDate,
    endDate,
    visible,
    ...tableData,
    // stationId: state.stationTree.activeKey,
    stationId: state.global.selectedStationId,
    tableLoading: state.loading.effects["abnormalDetail/getTableData"],
    exportTableLoading: state.loading.effects["abnormalDetail/exportTableData"]
  };
  return results;
};

export default connect(mapStateToProps)(AbnormalDetailModal);
