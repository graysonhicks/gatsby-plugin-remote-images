import React from 'react'

const Grid = ({ children }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, auto)',
        gridGap: '15px',
      }}
    >
      {children}
    </div>
  )
}

export default Grid
