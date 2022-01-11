import React from "react";
import styles from "./style/common-header.less";

interface Props {
  className?: string;
  title?: string;
}

const CommonHeader: React.FC<Props | any> = props => {
  const { className = "", title = "" } = props;

  return (
    <div className={`${styles["common-header"]} ${className}`}>
      <span className={styles["icon"]} />
      <span className={`${styles["label"]} basic-font-color`}>{title}</span>
    </div>
  );
};

export default CommonHeader;
