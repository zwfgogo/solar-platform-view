import React from 'react';

export default function PostPageId(props) {
  return React.Children.map(props.children, child => {
    return React.cloneElement(child, { pageId: props.pageId });
  });
}