import React from 'react';
import styles from './styles/environment-card.less';

interface Props {
  title: string;
  temperature: string;
  desc: string;
  icon: React.ReactNode[];
  iconExtra?: string;
  isWarning?: boolean;
}

const EnvironmentCard: React.FC<Props> = ({ title, temperature, desc, icon, isWarning, iconExtra }) => {
  return (
    <div className={styles['environment-card']}>
      <div className={styles['label']}>{title}</div>
      <div className={styles['icon']}>{icon[0]}</div>
      <div className={styles['label']}>温度：{temperature}℃</div>
      <div className={styles['icon']} style={isWarning ? { color: '#ff284b' } : {}}>
        {icon[1]}{iconExtra && <span className={styles['extra']}>{iconExtra}</span>}
      </div>
      <div className={styles['label']} style={isWarning ? { color: '#ff284b' } : {}}>{desc}</div>
    </div>
  );
};

export default EnvironmentCard;