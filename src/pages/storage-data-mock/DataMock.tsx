import classnames from "classnames";
import React, { useEffect, useState } from "react";
import { Button, Table1, Popconfirm, Table2 } from "wanke-gui";
import AbsoluteBubble from "../../components/AbsoluteBubble";
import CommonStationTree from "../../components/common-station-tree/CommonStationTree";
import MakeConnectProps from "../../interfaces/MakeConnectProps";
import { data_mock } from "../constants";
import { makeConnect, getAction } from "../umi.helper";
import styles from "./data-mock.less";
import { DataMockModal } from "./model";
import ExportBtn, { ExportFormValues } from "./components/ExportBtn";
import { Dispatch } from "umi";
import ImportBtn, { ImportFormValues } from "./components/ImportBtn";
import SupplementModal, { SuplementFormValues } from "./components/SupplementModal";
import utils from '../../public/js/utils'
import { CrumbsPortal } from "../../frameset/Crumbs";
import { isZh } from "../../core/env";

interface ConfirmBtnProps extends React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> {
  onConfirm: () => void;
  disabled?: boolean;
}

const ConfirmBtn: React.FC<ConfirmBtnProps> = ({ children, onConfirm, disabled, title, ...restProps }) => {
  return (
    <Popconfirm
      title={title}
      onConfirm={onConfirm}
      disabled={disabled}
      okText={utils.intl('确认')}
      cancelText={utils.intl('取消')}
    >
      <a
        {...restProps}
        className={classnames({ [styles["disabled"]]: disabled })}
      >{children}</a>
    </Popconfirm>
  );
}

interface Props extends DataMockModal, MakeConnectProps<DataMockModal> {
  stationId: string;
  loading: boolean;
  dispatch: Dispatch;
  pointList: any;
  exportLoading: boolean;
  importLoading: boolean;
  supplementLoading: boolean;
}

const DataMock: React.FC<Props> = ({
  action,
  stationId,
  loading,
  list,
  dispatch,
  pointList,
  query,
  total,
  updateQuery,
  exportLoading,
  importLoading,
  supplementLoading
}) => {
  const [stationList, setStationList] = useState<any[]>([]);
  const [supplementModalVisible, setSupplementModalVisible] = useState(false);
  const [targetRecord, setTargetRecord] = useState<any>({});

  const handleOperate = (type, record: any) => {
    switch (type) {
      case 'start':
        dispatch(getAction(data_mock, 'operateTemplate', {
          type: 'start',
          stationId: record.stationId,
          templateId: record.id
        }));
        break;
      case 'stop':
        dispatch(getAction(data_mock, 'operateTemplate', {
          type: 'stop',
          stationId: record.stationId,
          templateId: record.id
        }));
        break;
      case 'export':
        dispatch(getAction(data_mock, 'export', {
          stationId: record.stationId,
          id: record.id,
          filename: utils.intl(record.title || '模板')
        }))
        console.log('export');
        break;
      case 'add':
        setSupplementModalVisible(true);
        setTargetRecord(record);
        break;
      case 'delete':
        dispatch(getAction(data_mock, 'deleteTemplate', {
          templateId: record.id,
          stationId: record.stationId,
        }));
        break;
      default:
        break;
    }
  }

  const columns = [
    { title: utils.intl('序号'), dataIndex: "num", width: 65 },
    { title: utils.intl('电站名称'), dataIndex: "stationTitle", render: text => <AbsoluteBubble>{text}</AbsoluteBubble> },
    { title: utils.intl('模板名称'), dataIndex: "title", render: text => <AbsoluteBubble>{text}</AbsoluteBubble> },
    { title: utils.intl('时间跨度'), dataIndex: "timeSpan", width: 120, render: text => text || text === 0 ? `${text}${utils.intl('天')}` : '' },
    {
      title: utils.intl('状态'),
      dataIndex: "status",
      width: 120,
      render: text => (
        <>
          <span className={classnames('wanke-circle-icon', text ? 'wanke-color-blue' : 'wanke-color-grey')}></span>
          <span>{text ? utils.intl('运行中') : utils.intl('未运行')}</span>
        </>
      )
    },
    {
      title: utils.intl('操作'),
      align: 'right',
      width: isZh() ? 180 : 260,
      render: (text, record) => (
        <div className={styles["menu"]}>
          {!record.status && (
            <ConfirmBtn
              disabled={record.status}
              title={utils.intl('确认要启用该模板吗')}
              onConfirm={() => handleOperate('start', record)}
            >{utils.intl('启用')}</ConfirmBtn>
          )}
          {record.status && (
            <ConfirmBtn
              disabled={!record.status}
              title={utils.intl('确认要停用该模板吗')}
              onConfirm={() => handleOperate('stop', record)}
            >{utils.intl('停用')}</ConfirmBtn>
          )}
          <a onClick={() => handleOperate('export', record)}>{utils.intl('导出')}</a>
          <a onClick={() => handleOperate('add', record)}>{utils.intl('补录')}</a>
          <ConfirmBtn
            disabled={record.status}
            title={utils.intl('确定删除吗')}
            onConfirm={() => handleOperate('delete', record)}
          >{utils.intl('删除')}</ConfirmBtn>
        </div>
      ),
    },
  ];
  const treeNodeClick = () => { };

  const fetchData = (stationId) => {
    action("getTableData", { stationId });
  };

  const handleExport = (values: ExportFormValues) => {
    const startTime = values.date?.[0]?.format("YYYY-MM-DD")
    const endTime = values.date?.[1]?.format("YYYY-MM-DD")
    const stationTitle = stationList.find(item => item.value === values.stationId)?.name;

    return dispatch(getAction(data_mock, 'export', {
      stationId: values.stationId,
      startTime,
      endTime,
      filename: `${utils.intl('dataMock.数据模板')}_${stationTitle || ''}_${startTime?.replace(/-/g, '')}-${endTime?.replace(/-/g, '')}`
    }))
  }

  const handleImport = (values: ImportFormValues) => {
    console.log(values);
    return dispatch(getAction(data_mock, 'import', {
      stationId: values.stationId,
      file: values.file
    }))
  }

  const handleSupplement = (values: SuplementFormValues) => {
    return dispatch(getAction(data_mock, 'supplementTemplate', {
      startTime: values.date?.[0]?.format("YYYY-MM-DD"),
      endTime: values.date?.[1]?.format("YYYY-MM-DD"),
      stationId: targetRecord.stationId,
      templateId: targetRecord.id
    }))
  }

  const onPageChange = (page, size) => {
    updateQuery({ page, size });
    fetchData(stationId);
  }

  useEffect(() => {
    if (stationId) {
      updateQuery({ page: 1 });
      fetchData(stationId);
    }
  }, [stationId]);

  useEffect(() => {
    setStationList(
      pointList.map(
        item => ({
          name: item.title,
          value: item.id?.toString()
        })
      ).filter(item => item.value !== 'all')
    );
  }, [JSON.stringify(pointList)]);

  useEffect(() => {
    return () => {
      action("reset");
    };
  }, []);

  return (
    <article className={styles["page-container"]}>
      <CrumbsPortal>
        <ExportBtn onExport={handleExport} stationList={stationList} stationId={stationId} loading={exportLoading} />
        <ImportBtn onImport={handleImport} stationList={stationList} stationId={stationId} loading={importLoading} />
      </CrumbsPortal>
      <aside className={styles["aside"]}>
        <CommonStationTree
          showAllNode
          className={styles["tree-container"]}
          onChildrenClick={treeNodeClick}
        />
      </aside>
      <section className={styles["section"]}>
        <footer className={styles["footer"]}>
          <Table2
            x={500}
            columns={columns}
            loading={loading}
            dataSource={list}
            page={query.page}
            size={query.size}
            total={total}
            onPageChange={onPageChange}
            emptyText={utils.intl('暂无数据')}
            showTotal={(total: number, range: [number, number]) => utils.intl(`共{${total}}条`)}
          />
        </footer>
      </section>
      {supplementModalVisible && (
        <SupplementModal
          confirmLoading={supplementLoading}
          visible={supplementModalVisible}
          closeModal={() => setSupplementModalVisible(false)}
          onSupplement={handleSupplement}
        />
      )}
    </article>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    stationId: state.stationTree.activeKey,
    pointList: state.stationTree.pointList,
    loading: getLoading("getTableData"),
    exportLoading: getLoading("export"),
    importLoading: getLoading("import"),
    supplementLoading: getLoading("supplementTemplate"),
  };
};

export default makeConnect(data_mock, mapStateToProps)(DataMock);
