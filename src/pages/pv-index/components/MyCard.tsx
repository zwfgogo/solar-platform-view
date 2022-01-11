import React from "react";
import styles from "./styles/my-card.less";

const MyCard: React.FC<any> = props => {
  const { className, ...restProps } = props;

  return (
    <div className={`${styles["card"]} ${className}`} {...restProps}>
      {props.children}
    </div>
  );
};

export default MyCard;
