import React from "react";
import EmptyIcon from "../../../static/img/storage/station-empty-icon.png";
import styles from "./styles/emptyImg.less";

const EmptyImg = () => {
  return (
    <div className={styles["empty-img"]}>
      <img src={EmptyIcon} />
    </div>
  );
};

export default EmptyImg;
