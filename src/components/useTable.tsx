import { useState, useEffect } from "react";

interface Props {
  fetchData: Function;
  [key: string]: any;
}

export function useTable(props: Props) {
  const { fetchData, dataSource, ...restProps } = props;

  useEffect(() => {
    const { page } = props;
    if (dataSource && dataSource.length === 0 && page > 1) {
      fetchData({
        ...restProps,
        page: 1
      });
    }
  }, [dataSource]);

  const changePage = (page, size) => {
    fetchData({
      ...restProps,
      page,
      size
    });
  };

  const changeSize = (page, size) => {
    // 目前改变页面条数会触发changePage所以先注释掉
    // fetchData({
    //   ...restProps,
    //   page,
    //   size
    // });
  };
  return { changePage, changeSize };
}
