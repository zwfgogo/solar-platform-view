import React, { useEffect } from "react";
import PageProps from "../../../interfaces/PageProps";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { makeConnect } from "../../umi.helper";
import Page from "../../../components/Page";
import { Input, SearchInput } from "wanke-gui";
import styles from "./index.less";
import Tools from "../../../components/layout/Tools";
import Back1 from "../../../components/layout/Back1";
import DeviceInfoList from "../components/deviceInfoList";
import { iot_device_info } from "../../constants";
import { DeviceInfoModal } from "../models/deviceInfo";
import UploadJson from "../../../public/components/Upload/UploadJson";
import utils from '../../../public/js/utils'

const { Search } = Input;

const examineJson = data => {
  let errorCode = 0, errorMsg = "";
  const examineKey = [
    "sn",
    "title",
    "model",
    "project",
    "peripherals[peripheralModelId,model,type,showName]"
  ];
  examineKey.forEach((key) => {
    const isArray = /^(\w+)\[([\w,]+)\]$/g.test(key);
    if (isArray) {
      const list = data[RegExp.$1] || [];
      const matchKeyList = RegExp.$2.split(",");
      list.forEach(item => {
        matchKeyList.forEach(matchKey => {
          if (!item[matchKey]) {
            errorCode = 1;
            errorMsg = utils.intl('当前配置文件内容不完整，请补充完整后再上传');
          }
        });
      });
    } else if (!data[key]) {
      errorCode = 1;
      errorMsg = utils.intl('当前配置文件内容不完整，请补充完整后再上传');
    }
  });

  const lengthExamineKey = ["sn", "title", "model"];
  const lengthExamineName = [utils.intl('sn码'), utils.intl('控制器名称'), utils.intl('控制器型号')];
  const errList = [];

  if (errorCode === 0) {
    lengthExamineKey.forEach((key, index) => {
      if (data[key] && data[key].length > 32) {
        errorCode = 1;
        errList.push(lengthExamineName[index]);
      }
    });
    if (errList.length > 0) {
      errorMsg = `${errList.join(',')}不能超过32个字符`;
    }
  }

  return { errorCode, errorMsg };
}

interface Props
  extends PageProps,
  DeviceInfoModal,
  MakeConnectProps<DeviceInfoModal> {
  loading?: boolean;
  exportLoading?: boolean;
  stationId?: string;
  stationName?: string;
}

const DeviceInfo: React.FC<Props> = props => {
  const {
    pageId,
    exportLoading,
    totalCount,
    list,
    query,
    loading,
    stationName,
    stationId
  } = props;

  const fetchData = () => {
    props.action("getTableData", { stationId });
  };

  const handleSearch = val => {
    props.updateQuery({ queryStr: val, page: 1 });
    fetchData();
  };

  const handlePageChange = (page, size) => {
    props.updateQuery({ page, size });
    fetchData();
  };

  useEffect(() => {
    fetchData();
    return () => {
      props.action("reset");
    };
  }, []);

  return (
    <Page
      pageId={pageId}
      pageTitle={stationName ? utils.intl(`{${stationName}}物联设备信息`) : utils.intl('当前在线物联设备信息')}
      onActivity={fetchData}
    >
      <section className={styles["page-container"]}>
        <header className={styles["header"]}>
          <SearchInput
            searchSize="small"
            placeholder={utils.intl('请输入控制器名称')}
            style={{ width: 400 }}
            onSearch={handleSearch}
          />
          {!stationName && (
            <UploadJson
              url="/api/basic-data-management/lot-control-management/micro-controllers"
              btnLabel={utils.intl('导入配置文件')}
              title={utils.intl('导入配置文件')}
              callback={fetchData}
              beforeUpload={(data, file) => {
                const { errorCode, errorMsg } = examineJson(data);
                return {
                  result: {
                    controller: { ...data, fileName: file.name }
                  },
                  errorCode,
                  errorMsg
                };
              }}
            />
          )}
        </header>
        <footer className={styles["footer"]}>
          <DeviceInfoList
            stationId={stationId}
            loading={loading}
            page={query.page}
            size={query.size}
            onPageChange={handlePageChange}
            total={totalCount}
            dataSource={list}
          />
        </footer>
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

export default makeConnect(iot_device_info, mapStateToProps)(DeviceInfo);
