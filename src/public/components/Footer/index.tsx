import React from 'react'

export default function Footer({children}) {
  return (
    <div style={{padding: '14px', flexShrink: 0}} className='footer'>
      {children}
    </div>
  )
}