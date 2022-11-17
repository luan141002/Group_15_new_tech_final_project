import React from "react"
import './table.css'

function Table(props) {
  const { columns: columnData, data } = props
  const columns = columnData.map(e => ({
    field: e.field,
    columnName: e.columnName || e.field,
    displayFunc: e.displayFunc || ((value) => value[e.field])
  }))

  return (
    <>
      <div className='table'>
        <div className='row header'>
          {
            columns.map((e, i) => {
              return <div key={`cell-${i}`} className='cell'>{e.columnName}</div>
            })
          }
        </div>
        <div className='row'>
          {
            data.map((entry, i) => {
              return <React.Fragment key={`row-${i}`}>
                {
                  columns.map((e, j) => {
                    return <div key={`cell-${i}-${j}`} className='cell'>{e.displayFunc(entry)}</div>
                  })
                }
              </React.Fragment>
            })
          }
        </div>
      </div>
    </>
  )
}

export default Table
