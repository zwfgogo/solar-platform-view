import React from "react";
import styles from "./styles/common-header.less";

interface Props {
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

const CommonHeader: React.FC<Props | any> = props => {
  const {
    className = "",
    title = "",
    style,
  } = props;

  return (
    <div className={`${styles["common-header"]} ${className}`} style={style}>
      <span className="common-header-icon" />
      <span className="common-header-label">
        {title}
      </span>
      <div className="common-header-content">{props.children}</div>
    </div>
  );
};

export default CommonHeader;
