import React from 'react';
import classnames from 'classnames'
export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children?: any,
  icon?: any,
  title?: string,
}


export default function whiteBox(props: Props) {
  const { children, title, icon, className = '', ...otherProps } = props;
  let Icon: any = icon
  return (
    <div className={className + " border-radius-4 white-box"} {...otherProps}>
      {
        title && title !== ''
          ? (
            <div className={"header e-ml10"}>
              <span>
                <Icon style={{ width: 20, color: "#3d7eff", marginRight: 10 }} />
                <span className={"title"}>{title}</span>
              </span>
            </div>
          )
          : null
      }

      <div className={"content"}>
        {props.children}
      </div>
    </div>
  );
}