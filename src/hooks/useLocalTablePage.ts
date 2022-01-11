import { useState, useMemo } from 'react'
import moment from 'moment';

interface Props {
  data: any[]
  defaultPageSize?: number
}

export default function useLocalTablePage(props?: Props) {
  const { data, defaultPageSize = 10 } = props
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [startTime, setStartTime] = useState(moment().startOf('day'));
  const [endTime, setEndTime] = useState(moment().endOf('day'));
  const list = useMemo(() => {
    return data.slice((page - 1) * pageSize, page * pageSize)
  }, [JSON.stringify(data), page, pageSize])

  const onPageChange = (page, pageSize) => {
    setPage(page)
    setPageSize(pageSize)
  }

  const onTimeChange = (dates, dateStrings) => {
    setStartTime(dates[0].startOf('day'));
    setEndTime(dates[1].endOf('day'));
    setPage(1);
  }

  return {
    list,
    page,
    pageSize,
    startTime,
    endTime,
    onPageChange,
    onTimeChange
  }
}
