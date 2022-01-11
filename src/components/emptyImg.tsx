import React from "react";
import EmptyIcon from "../static/img/station-empty-icon.png";
import styles from "./style/emptyImg.less";

interface Props {
  imgUrl?: string
}

const EmptyImg: React.FC<Props> = ({ imgUrl }) => {
  return (
    <div className={styles["empty-img"]}>
      <img src={imgUrl || EmptyIcon} />
    </div>
  );
};

export default EmptyImg;
