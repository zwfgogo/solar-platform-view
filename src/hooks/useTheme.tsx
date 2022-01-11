import React, { useRef, useState } from 'react';
import { useSelector } from 'umi';
import { globalNS } from '../pages/constants';

interface Props {
}

const useTheme = () => {
  const { theme } = useSelector(state => state[globalNS])

  return {
    theme: theme || 'light-theme'
  }
};

export default useTheme;
