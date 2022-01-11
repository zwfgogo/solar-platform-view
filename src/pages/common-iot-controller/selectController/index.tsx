import React, { useEffect } from "react";
import MakeConnectProps from "../../../interfaces/MakeConnectProps";
import { makeConnect } from "../../umi.helper";
import { SelectControllerModal } from "../models/selectController";
import { iot_select_controller } from "../../constants";
import styles from "./index.less";
import { Modal, Input, SearchInput } from "wanke-gui";
import SelectControllerList from "../components/SelectControllerList";
import utils from '../../../public/js/utils';

const { Search } = Input;

interface Props
  extends SelectControllerModal,
    MakeConnectProps<SelectControllerModal> {
  loading?: boolean;
  saveLoading?: boolean
}

const SelectController: React.FC<Props> = props => {
  const { loading, query, totalCount, list, checkedList, visible, saveLoading } = props;

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

  const handleCheckChange = (curPageCheckedList) => {
    let newList = checkedList.filter(key => {
      return list.every(item => {
        const id = item.id.toString();
        return id !== key;
      })
    });
    props.updateState({
      checkedList: newList.concat(curPageCheckedList)
    });
  };

  const handleSave = () => {
    props.action("save")
      .then(() => {
        props.updateState({ visible: false });
      });
  };

  const handleCancel = () => {
    props.updateState({ visible: false });
  };

  useEffect(() => {
    if (visible) {
      // 延时弹出modal 等待modal动画结束再渲染table (防止高度计算错误)
      setTimeout(() => {
        fetchData();
      }, 300);
      return () => {
        props.action("reset");
      };
    }
  }, [visible]);

  const tableHeadHeight = 35;
  const tableBodyHeight = list.length * 35;
  const tablePagationHeight = 45;
  let tableHeight = tableBodyHeight + tableHeadHeight + tablePagationHeight + 10;
  const isScrollTable = tableHeight > 400;
  tableHeight = isScrollTable ? 400 : tableHeight;

  return (
    <Modal
      wrapClassName={styles["modal"]}
      title={utils.intl('选择关联的控制器')}
      onOk={handleSave}
      onCancel={handleCancel}
      width={'70%'}
      visible={visible}
      confirmLoading={saveLoading}
    >
      <section className={styles["page-container"]}>
        <header className={styles["header"]}>
          <SearchInput
            searchSize="small"
            placeholder={utils.intl('请输入控制器名称')}
            style={{ width: 300 }}
            onSearch={handleSearch}
          />
        </header>
        <footer
          className={styles["footer"]}
          // style={{height: isScrollTable ? 400 : 'auto' }}
        >
          <SelectControllerList
            isScrollTable={isScrollTable}
            loading={loading}
            page={query.page}
            size={query.size}
            onPageChange={handlePageChange}
            checkedList={checkedList}
            onCheckChange={handleCheckChange}
            total={totalCount}
            dataSource={list}
          />
        </footer>
      </section>
    </Modal>
  );
};

const mapStateToProps = (model, getLoading, state) => {
  return {
    ...model,
    loading: getLoading("getTableData"),
    saveLoading: getLoading("save")
  };
};

export default makeConnect(
  iot_select_controller,
  mapStateToProps
)(SelectController);
