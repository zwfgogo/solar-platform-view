import React, { useEffect } from "react";
import { Row, Col } from "wanke-gui";
import { connect } from "dva";
import TotalAbnormal from "./components/totalAbnormal";
import DeviceAbnormal from "./components/deviceAbnormal";
import EventAbnormal from "./components/eventAbnormal";
import Page from "../../components/Page";
import CommonStationTree from "../../components/common-station-tree/CommonStationTree";
import AbnormalDetailModal from "./components/abnormalDetailModal";
import styles from "./index.less";
import utils from "../../public/js/utils";

interface Props {
  pageId: any;
  dispatch: any;
}

const Abnormal: React.FC<Props> = props => {
  const treeNodeClick = () => {};

  useEffect(() => {
    return () => {
      props.dispatch({ type: "abnormal/reset", payload: {} });
    };
  }, []);

  return (
    <Page
      pageId={props.pageId}
      pageTitle={utils.intl('异常分析')}
      showStation
      style={{ backgroundColor: "unset" }}
    >
      <article className={styles["page-container"]}>
        {/* <aside className={styles["aside"]}>
          <CommonStationTree
            className={styles["tree-container"]}
            onChildrenClick={treeNodeClick}
          />
        </aside> */}
        <section className={styles["section"]}>
          <header className={styles["header"]}>
            <TotalAbnormal />
          </header>
          <Row className={styles["footer"]}>
            <Col span={12} className={styles["content"]}>
              <DeviceAbnormal />
            </Col>
            <Col span={12} className={styles["content"]}>
              <EventAbnormal />
            </Col>
          </Row>
        </section>
        <AbnormalDetailModal />
      </article>
    </Page>
  );
};

export default connect(() => ({}))(Abnormal);
