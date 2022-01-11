import React, { useEffect } from "react";
import { Input, Button, SearchInput } from "wanke-gui";
import Page from "../../../components/Page";
import PageProps from "../../../interfaces/PageProps";
import IndexList from "../components/IndexList";
import styles from "./index.less";
import { makeConnect } from "../../umi.helper";
import { iot_index, iot_select_controller } from "../../constants";
import { IotIndexModal } from "../models/iotIndex";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import SelectController from "../selectController";
import utils from '../../../public/js/utils'

const { Search } = Input;

interface Props
  extends PageProps,
    IotIndexModal,
    MakeConnectProps<IotIndexModal> {
  loading?: boolean;
  exportLoading?: boolean;
}

const Index: React.FC<Props> = props => {
  const { pageId, loading, query, totalCount, list, exportLoading } = props;

  const fetchData = () => {
    props.action("getTableData");
  };

  const handleSearch = val => {
    props.updateQuery({ queryStr: val });
    fetchData();
  };

  const handlePageChange = (page, size) => {
    props.updateQuery({ page, size });
    fetchData();
  };

  const handleViewDevice = () => {
    props.forward("DeviceInfo", {});
  };

  const handleEdit = (record: any) => {
    props.dispatch({
      type: `${iot_select_controller}/updateToView`,
      payload: { visible: true, stationId: record.id }
    });
  };

  useEffect(() => {
    fetchData();
    return () => {
      props.action("reset");
    };
  }, []);

  return (
    <Page pageId={pageId} pageTitle={utils.intl('物联控制管理')} onActivity={fetchData}>
      <section className={styles["page-container"]}>
        <header className={styles["header"]}>
          <SearchInput
            searchSize="small"
            placeholder={utils.intl('请输入电站名称')}
            style={{ width: 400 }}
            onSearch={handleSearch}
          />
          <Button type="primary" onClick={handleViewDevice}>
            {utils.intl('在线物联设备')}
          </Button>
        </header>
        <footer className={styles["footer"]}>
          <IndexList
            onEdit={handleEdit}
            loading={loading}
            page={query.page}
            size={query.size}
            onPageChange={handlePageChange}
            total={totalCount}
            dataSource={list}
          />
        </footer>
        <SelectController />
      </section>
    </Page>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    loading: getLoading("getTableData"),
    exportLoading: getLoading("onExport")
  };
};

export default makeConnect(iot_index, mapStateToProps)(Index);
