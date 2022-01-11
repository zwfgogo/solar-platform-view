import React, { useRef } from 'react';
import classnames from 'classnames';
import styles from './styles/info-card.less';
import { Bubble } from 'wanke-gui';

interface Props {
  icon: React.ReactNode;
  title: React.ReactNode;
  position?: 'middle';
}

const InfoCard: React.FC<Props> = ({ icon, title, children, position }) => {
  return (
    <div className={styles['info-card']}>
      <div className={
        classnames(styles['title'], {
          [styles['middle']]: !children
        })
      }>
        {icon}<Bubble bubble={true} placement={undefined}>{title}</Bubble>
      </div>
      {
        children && (
          <div className={classnames(styles['content'], {
            [styles[position]]: !!position
          })}>{children}</div>
        )
      }
    </div>
  );
};

export default InfoCard;