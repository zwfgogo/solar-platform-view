import React from 'react'
import { WankeFourRectOutlined, WankeListSearchOutlined, WankeMapOutlined, GfMapFilled, GfSquareModeFilled, GfTableModeFilled } from 'wanke-icon'
import styles from './styles/board-type-menu.less'
import { connect } from 'umi';
import { BoardType } from '../contant';

const BoardTypeTab = ({ isActive, onClick, icon }) => {
  return (
    <a
      className={`${styles["tab"]} ${
        isActive ? styles["tab-active"] : ""
      }`}
      onClick={onClick}
    >
      {icon}
    </a>
  );
};

interface Props {
  dispatch?: any;
  boardType?: BoardType;
  style?: React.CSSProperties;
}

const BoardTypeMenu: React.FC<Props> = (props) => {
  const { boardType } = props;
  const changeBoardType = (type: BoardType) => {
    props.dispatch({
      type: "powerStationPv/updateToView",
      payload: { boardType: type, queryStr: "" }
    });
  }

  return (
    <div className={styles['board-type-menu']} style={props.style || {}}>
      <BoardTypeTab
        icon={<GfMapFilled />}
        isActive={boardType === BoardType.Map}
        onClick={() => changeBoardType(BoardType.Map)}
      />
      <BoardTypeTab
        icon={<GfSquareModeFilled />}
        isActive={boardType === BoardType.Matrix}
        onClick={() => changeBoardType(BoardType.Matrix)}
      />
      <BoardTypeTab
        icon={<GfTableModeFilled />}
        isActive={boardType === BoardType.Table}
        onClick={() => changeBoardType(BoardType.Table)}
      />
    </div>
  );
};

const mapStateToProps = state => {
  const { boardType } = state.powerStationPv;

  let results = {
    boardType
  };
  return results;
};

export default connect(mapStateToProps)(BoardTypeMenu);
