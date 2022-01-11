import React from "react";
import styles from "./styles/commonTitle.less";

interface Props {
  className?: string;
  title?: string;
}

const CommonTitle: React.FC<Props | any> = props => {
  const { className = "", title = "" } = props;

  return (
    <div className={`${styles["common-title"]} ${className}`}>
      <span className={styles["icon"]} />
      <span className={styles["label"]}>{title}</span>
    </div>
  );
};

export default CommonTitle;
