import { useEffect, useState } from "react"

interface Props {
  data: any[]
  keyName?: string
  defaultKeys?: string[]
}

export default function useRowSelection({ data, keyName = 'key', defaultKeys = [] }: Props) {
  const [selectedRowKeys, setSelectedRowKeys] = useState(defaultKeys)
  
  const onChange = (keys: string[], selectedRows: any[]) => {
    let newKeys = []
    selectedRowKeys.filter(key => {
      const target = data.find(item => key === item[keyName])
      if (!target) {
        newKeys.push(key)
      }
    });

    newKeys = newKeys.concat(keys)
    setSelectedRowKeys(newKeys)

    return newKeys
  }

  const clearSelect = (key?: string) => {
    if (key) {
      const newKeys = selectedRowKeys.filter(item => item !== key)
      setSelectedRowKeys(newKeys)
    } else {
      setSelectedRowKeys([])
    }
  }

  return {
    selectedRowKeys,
    onChange,
    clearSelect
  }
}