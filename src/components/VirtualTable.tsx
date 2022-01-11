import React, { useState, useRef, useEffect } from 'react';
import { VariableSizeGrid as Grid } from 'react-window';
import classnames from 'classnames';
import { TableProps } from 'antd/lib/table'
import styles from './style/virtual-table.less';

interface VirtualTableProps extends TableProps<any> {
  columns?: any[];
  tableWidth: number;
  virtual?: boolean;
}

export const widthVirtualTableHOC = (Component) => {
  const VirtualTable: React.FC<VirtualTableProps> = (props) => {
    const { columns, scroll, tableWidth, virtual, className, ...restProps } = props;
    if(!virtual) {
      return (
        <Component
          {...restProps}
          columns={columns}
          className={className}
          scroll={scroll}
        />
      );
    }
  
    let curTotalWidth = 0;
    const widthColumnCount = columns.filter(({ width }) => {
      if(width && typeof width === 'number') {
        curTotalWidth += width;
        return false;
      }
      return true;
    }).length;
    const restTableWidth = tableWidth - curTotalWidth;
    const mergedColumns = columns.map(column => {
      if (column.width) {
        return column;
      }
  
      return {
        ...column,
        width: Math.floor(restTableWidth / widthColumnCount),
      };
    });
    
    const gridRef = useRef();
    const [connectObject] = useState(() => {
      const obj = {};
      Object.defineProperty(obj, 'scrollLeft', {
        get: () => null,
        set: scrollLeft => {
          if (gridRef.current) {
            gridRef.current.scrollTo({
              scrollLeft,
            });
          }
        },
      });
      return obj;
    });
  
    const resetVirtualGrid = () => {
      if(gridRef.current) {
        gridRef.current.resetAfterIndices({
          columnIndex: 0,
          shouldForceUpdate: true,
        });
      }
    };
  
    useEffect(resetVirtualGrid, []);
    useEffect(resetVirtualGrid, [tableWidth]);
  
    const renderRow = (record: any, column: any) => {
      if(column.render) {
        return column.render(record[column.dataIndex], record);
      }
      return record[column.dataIndex];
    }
  
    const renderVirtualList = (rawData, { scrollbarSize, ref, onScroll }) => {
      ref.current = connectObject;
      // if(!rawData.length) return '';
      return (
        <Grid
          ref={gridRef}
          className="virtual-grid"
          columnCount={mergedColumns.length}
          columnWidth={index => {
            const { width } = mergedColumns[index];
            return index === mergedColumns.length - 1 ? width - scrollbarSize - 1 : width;
          }}
          height={scroll.y}
          rowCount={rawData.length}
          rowHeight={() => 35}
          width={tableWidth - 1}
          onScroll={({ scrollLeft }) => {
            onScroll({
              scrollLeft,
            });
          }}
        >
          {({ columnIndex, rowIndex, style }) => (
            <div
              className={classnames('virtual-table-cell', {
                'virtual-table-cell-last': columnIndex === mergedColumns.length - 1,
              })}
              style={{...style, textAlign: mergedColumns[columnIndex].align || 'left'}}
            >
              {renderRow(rawData[rowIndex], mergedColumns[columnIndex])}
            </div>
          )}
        </Grid>
      );
    };

    return (
      <Component
        {...restProps}
        columns={mergedColumns}
        className={classnames(className, styles['virtual-table'])}
        scroll={scroll}
        components={{
          ...(restProps.components || {}),
          body: renderVirtualList
        }}
      />
    );
  };
  return VirtualTable;
}