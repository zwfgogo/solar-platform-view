import React from "react";
import styles from "./styles/common-header.less";

interface Props {
  className?: string;
  title?: any;
  style?: React.CSSProperties;
  fontSize?: number
}

const CommonHeader: React.FC<Props | any> = props => {
  const {
    className = "",
    title = "",
    style,
    fontSize = 16
  } = props;

  return (
    <div className={`${styles["common-header"]} strategy-common-header ${className}`} style={style}>
      <span className="common-header-icon" />
      <span className="common-header-label" style={{ fontSize }}>
        {title}
      </span>
      <div className="common-header-content">{props.children}</div>
    </div>
  );
};

export default CommonHeader;
