import React from "react";
import classnames from 'classnames'
import styles from "./style/common-title.less";

interface Props {
  className?: string;
  title?: string;
  iconColor?: string;
  iconHeight?: number;
  style?: React.CSSProperties;
  fontSize?: number;
  labelAside?: any
  rightAside?: any
  withBorder?: boolean
}

const CommonTitle: React.FC<Props | any> = props => {
  const {
    className = "",
    title = "",
    iconColor = "#3d7eff",
    iconHeight = 14,
    style,
    fontSize = 14,
    fontWeight = 'normal',
    labelAside,
    rightAside,
  } = props;

  return (
    <div
      className={classnames(
        styles["common-title"],
        className,
        { [styles['common-title-with-border']]: props.withBorder }
      )}
      style={style}
    >
      <div className={styles["title-left"]}>
        <span
          className={styles["icon"]}
          style={{ backgroundColor: iconColor, height: iconHeight }}
        />
        <span className={styles["label"]} style={{ fontSize, whiteSpace: 'nowrap', fontWeight }}>
          {title}
        </span>
        {labelAside}
      </div>
      <div className={styles["title-right"]}>
        {rightAside}
      </div>
    </div>
  );
};

export default CommonTitle;
