import React from 'react';
import { Bubble } from 'wanke-gui';

const bubbleStyle: React.CSSProperties = {
  overflow: 'hidden',
  position: 'absolute',
  width: '100%',
  top: '50%',
  transform: 'translateY(-50%)'
};

// 针对表格超出省略号显示
const AbsoluteBubble: React.FC = (props) => {
  return (
    <div style={{ position: 'relative', height: '100%', width: '100%' }}>
      <div style={bubbleStyle}>
        <Bubble bubble={true} placement={undefined}>
          {props.children}
        </Bubble>
      </div>
    </div>
  );
};

export default AbsoluteBubble;