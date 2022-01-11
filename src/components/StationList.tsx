import React, { useState, useRef, useEffect } from 'react';
import styles from '../frameset/station-list.less'
import { Input, FullLoading, Empty, SearchInput } from 'wanke-gui';
import { WankeUpOutlined, WankeExpandOutlined, DownOutlined, UpOutlined, WankeAddressOutlined } from 'wanke-icon';
import classnames from 'classnames';
import EmptyImg from './emptyImg';
import utils from '../public/js/utils';
import { WankeEmptyOutlined } from 'wanke-icon'
import { getImageUrl } from '../pages/page.helper';

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
      <div className={styles['icon']}>{icon ? icon : <WankeAddressOutlined style={{ fontSize: 20 }} />}</div>
      <section className={styles['info']}>
        <header className={styles['title']}>{name}</header>
        <div className={styles['address']}>{address}</div>
        <footer className={styles['capacity']}>{utils.intl('建设规模')}: {capacity}</footer>
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
  icon?: React.ReactNode;
}

const StationList: React.FC<Props> = (props) => {
  const { className, fetchData, list = [], loading, onClick, activeNode, icon } = props;
  const [showMapList, setShowMapList] = useState(false);
  const [searchStr, setSearchStr] = useState('');
  const listContainerRef = useRef();

  const handleSearch = (val: string) => {
    fetchData && fetchData(val);
    setShowMapList(true);
    if (listContainerRef.current)
      (listContainerRef.current as HTMLDivElement).scrollTop = 0;
  };

  const handleChange = (val: string) => {
    setSearchStr(val)
  };

  const toggleMapList = () => {
    !showMapList && handleSearch(searchStr);
    setShowMapList(!showMapList);
  };
  return (
    <div>
      <div
        className={classnames(styles["station-list"], { [className]: !!className })}
      >
        <div className={styles["filter-box"]}>
          <SearchInput
            searchSize="normal"
            noRadius
            placeholder={utils.intl("请输入查询的电站名称")}
            onSearch={handleSearch}
            onChange={(e) => handleChange(e.target.value)}
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
            <Empty style={{ color: 'rgb(222, 222, 222)' }} image={<WankeEmptyOutlined style={{ display: 'inline-block', fontSize: '80px', color: 'rgb(222, 222, 222)' }} />} />
          )}
          {list.map(item => (
            <StationCard
              icon={icon}
              onClick={() => { onClick(item); setShowMapList(false); }}
              key={item.key}
              isActive={activeNode && item.id === activeNode.id}
              name={item.title}
              address={item.address}
              capacity={`${item.ratedPowerDisplay}/${item.scaleDisplay}`}
              img={
                item.filePath ? (
                  <div style={{
                    backgroundImage: `url(${getImageUrl(item.filePath)})`, backgroundSize: 'cover',
                    height: '100%'
                  }} />
                  // <img src={item.filePath} />
                ) : (
                    <EmptyImg />
                  )
              }
            />
          ))}
        </div>
      </div>
      {showMapList ?
        <div style={{ position: 'fixed', height: '100%', width: '100%', top: 0, left: 0, background: 'rgba(0, 0, 0, 0.4)' }} onClick={toggleMapList} ></div>
        : ''}
    </div>
  );
};

export default StationList;