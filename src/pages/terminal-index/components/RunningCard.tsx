import React from 'react';
import styles from './styles/running-card.less';

interface Props {
  title: string;
  content: string;
}

const RunningCard: React.FC<Props> = ({ title, content }) => {
  return (
    <div className={styles['running-card']}>
      <div className={styles['content']}>
        <img className={styles['img']} src={require('../../../static/img/running-card-bg.png')} />
        <p className={styles['title']}>{title}</p>
        <p className={styles['value']}>{content}</p>
      </div>
    </div>
  );
};

export default RunningCard;