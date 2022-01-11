import React from 'react';

interface ContentProps {
  str: string;
}

export default function Content(props: ContentProps) {
  const { str } = props;
  const arr = str.split(',');
  return (
    <ul style={{ margin: '0 10px 0 20px', padding: 0 }}>
      {arr.map((item, key) => {
        return <li key={key}>{item}</li>;
      })}
    </ul>
  );
}
