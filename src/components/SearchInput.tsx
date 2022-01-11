import React from "react";
import { Input } from "wanke-gui";
import { SearchProps } from "antd/lib/input/Search";
import classnames from "classnames";
import styles from "./style/search-input.less";

import { WankeSearchOutlined, DownOutlined, GfSearchOutlined } from "wanke-icon";

const InputHeightMap = {
  normal: 36,
  small: 32
}

const IconFontSizeMap = {
  normal: 20,
  small: 16
}

interface Props extends SearchProps {
  value?: string
  onChange?: (e: any) => void;
  noRadius?: boolean;
  className?: string;
  searchSize?: 'normal' | 'small'
}

const SearchInput: React.FC<Props> = props => {
  const { onSearch, style, onChange, noRadius, className, searchSize = 'normal', ...restProps } = props;
  let inputRef: Input;
  const handleSearch = () => {
    const value = (inputRef && inputRef.state && inputRef.state.value) || "";
    if (onSearch) {
      onSearch(value);
    }
  };
  return (
    <span className={classnames(styles["search-input"], {
      [styles["no-radius"]]: noRadius,
      [className]: !!className
    })}>
      <Input
        ref={node => (inputRef = node)}
        {...restProps}
        style={{ height: InputHeightMap[searchSize], ...style }}
        onPressEnter={handleSearch}
        onChange={onChange}
        prefix={
          <GfSearchOutlined style={{ color: "#92929d", fontSize: IconFontSizeMap[searchSize], marginRight: 8 }} />
        }
      />
    </span>
  );
};

export default SearchInput;
