/**
 * 标签集合
 */
import React from 'react'
import { Tag, Tooltip } from 'wanke-gui';
import utils from '../../../public/js/utils';
import "./styles.less"

export interface TagListProps {
  dataSource: { value: string | number, name: string, extraNumber: number, [key: string]: any }[],
  onClick?: (item: { value: string | number, name: string, [key: string]: any }) => void;
  onClose?: (item: { value: string | number, name: string, [key: string]: any }) => void;
  style?: React.CSSProperties
}

const TagList: React.FC<TagListProps> = (props) => {
  const { dataSource, style, onClick, onClose } = props
  const language = localStorage.getItem('language') || 'zh'
  return (
    <div className="tag-box" style={style}>
      {
        dataSource.map(item => (
          <Tooltip title={item.name}>
            <Tag closable onClose={(e) => {
              e.preventDefault();
              onClose && onClose(item);
            }} onClick={() => onClick && onClick(item)}>
              <span className="tag-text-ellipsis">{item.name}</span>
              <span className="tag-text-extra">
                ({utils.intl('已选')}<span style={{ marginLeft: language === 'zh' ? 0 : 4 }}>{item.extraNumber}</span>{utils.intl('个')})
              </span>
            </Tag>
          </Tooltip>
        ))
      }
    </div>
  );
}

export default TagList;