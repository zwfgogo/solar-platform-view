import React, { useState, useRef, useEffect } from 'react';
import styles from './styles/station-list.less'
import { FullLoading, Empty, SearchInput } from 'wanke-gui';
import { DownOutlined, UpOutlined, WankeAddress2Outlined, WankeAddressOutlined, WankeCircleRightOutlined, WankeConstructionOutlined } from 'wanke-icon';
import classnames from 'classnames';
import Util from '../../../../public/js/utils';
import EmptyImg from '../../../../components/emptyImg'
import { getImageUrl } from '../../../page.helper';
import { getSystemTheme, isMicrogrid } from '../../../../core/env';
import EmptyData from '../../../../components/EmptyData';
import utils from '../../../../public/js/utils';

interface StationCardProps {
  img: React.ReactChild;
  name: string;
  address: string;
  capacity: string;
  isActive: boolean;
  onClick: any;
  icon?: React.ReactNode
}

const StationCard: React.FC<StationCardProps> = ({ icon, img, name, address, capacity, isActive, onClick }) => {
  return (
    <article
      className={classnames(styles['station-card'], {
        [styles['active']]: isActive,
        listActive: isActive
      })}
      onClick={onClick}
    >
      <section className={styles['info']}>
        <header className={styles['title']}>{name}</header>
        <div className={styles['address']}>
          <WankeAddress2Outlined style={{ marginRight: 16, fontSize: 16 }} />
          <span className={styles['info-content']}>{address}</span>
        </div>
        <footer className={styles['capacity']}>
          <WankeConstructionOutlined style={{ marginRight: 16, fontSize: 16 }} />
          <span className={styles['info-content']}>{capacity}</span>
        </footer>
      </section>
      <div className={styles['image']}>{img}</div>
    </article>
  );
}

interface Props {
  className?: string;
  fetchData: (val: string) => void;
  list: any[];
  loading?: boolean;
  onClick: (node: any) => void;
  activeNode: any;
  icon?: React.ReactNode
}

const StationList: React.FC<Props> = (props) => {
  const { className, fetchData, list = [], loading, onClick, activeNode, icon } = props;
  const [showMapList, setShowMapList] = useState(true);
  const listContainerRef = useRef();

  const handleSearch = (val: string) => {
    fetchData && fetchData(val);
    setShowMapList(true);
    if (listContainerRef.current)
      (listContainerRef.current as HTMLDivElement).scrollTop = 0;
  };

  const toggleMapList = () => {
    setShowMapList(!showMapList);
  };

  const handleTreeScroll = () => {
    if (listContainerRef.current) {
      (listContainerRef.current as HTMLDivElement).scrollTop = 0;
    }
  };

  useEffect(() => {
    // 查询树的时候，阻止滚动
    if (loading) {
      (listContainerRef.current as HTMLDivElement).addEventListener(
        "scroll",
        handleTreeScroll
      );
    }
    return () => {
      (listContainerRef.current as HTMLDivElement).removeEventListener(
        "scroll",
        handleTreeScroll
      );
    };
  }, [loading]);
  const theme = getSystemTheme()
  const isLightTheme = theme === 'light-theme'

  return (
    <div
      className={classnames(styles["station-list"], { [className]: !!className })}
    >
      <div className={styles["filter-box"]}>
        <SearchInput
          searchSize="small"
          noRadius
          placeholder={Util.intl("请输入查询的电站名称")}
          onSearch={handleSearch}
          style={{ width: '100%', paddingRight: 36 }}
        />
        <div className={styles["toggle-btn"]} onClick={toggleMapList}>
          {
            showMapList ? (
              <UpOutlined style={{ color: "#92929d", fontSize: 12, cursor: 'pointer' }} />
            ) : (
              <DownOutlined style={{ color: "#92929d", fontSize: 12, cursor: 'pointer' }} />
            )
          }
        </div>
      </div>
      {loading && <FullLoading style={{ height: 'calc(100% - 36px)', top: 36 }} />}
      <div
        key="station-list"
        ref={listContainerRef}
        className={styles["content"]}
        style={!showMapList ? { display: "none" } : {}}
      >
        {list.length === 0 && (
          <EmptyData message={utils.intl('暂无匹配结果')} />
        )}
        {list.map(item => (
          <StationCard
            icon={icon}
            onClick={() => onClick(item)}
            key={item.key}
            isActive={activeNode && item.id === activeNode.id}
            name={item.title}
            address={item.address}
            capacity={isMicrogrid() ? `${item.totalRatedPowerDisplay ?? '-'}` : `${item.ratedPowerDisplay}/${item.scaleDisplay}`}
            img={
              item.filePath ? (
                <div style={{
                  backgroundImage: `url(${getImageUrl(item.filePath)})`, backgroundSize: 'cover',
                  height: '100%'
                }} />
                // <img src={item.filePath} />
              ) : (
                <EmptyImg imgUrl={isLightTheme ? require('./img/light-default-station.svg') : require('./img/dark-default-station.svg')} />
              )
            }
          />
        ))}
      </div>
    </div>
  );
};

export default StationList;