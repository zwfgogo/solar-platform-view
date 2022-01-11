import React from 'react'
import classnames from 'classnames'
import styles from './styles/card.less'

interface Props {
  title: string
  rightHeader?: React.ReactElement
  className?: string
  style?: React.CSSProperties
}

const Card: React.FC<Props> = (props) => {
  return (
    <section className={classnames(styles['card'], { [props.className]: props.className })} style={props.style}>
      <header className={styles['header']}>
        <span className={styles['title']}>{props.title}</span>
        <div className={styles['header-right']}>{props.rightHeader}</div>
      </header>
      <footer className={styles['footer']}>{props.children}</footer>
    </section>
  )
}

export default Card