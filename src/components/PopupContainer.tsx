import React, { useRef } from 'react';

interface Props {
  children: (ref: React.MutableRefObject<HTMLDivElement>) => React.ReactChild
}

const PopupContainer:React.FC<Props> = props => {
  const ref = useRef<HTMLDivElement>();

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {props.children(ref)}
    </div>
  );
};

export default PopupContainer;