import { useState } from 'react'

interface PageSize {
  page?: number
  size?: number
}

export default function usePageSize(initPageSize?: PageSize): [PageSize, (page: number, size: number) => void] {
  if (initPageSize === undefined) {
    initPageSize = {
      page: 1,
      size: 20
    }
  }
  const [pageSize, setPageSize] = useState(initPageSize)

  const set = (page: number, size: number = 20) => {
    setPageSize({
      page, size
    })
  }

  return [pageSize, set]
}
