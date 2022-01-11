import { useState, useEffect, useMemo } from 'react'

function filterTree(treeList, searchText) {
  if(!searchText) return treeList
  const list = []
  treeList.forEach(node => {
    if(node.children) {
      const children = filterTree(node.children, searchText)
      if(children.length > 0) {
        list.push({
          ...node,
          children
        })
      }
    } else {
      if(node.title.indexOf(searchText) > -1) {
        list.push(node)
      }
    }
  })
  return list
}

function getNodeList(treeList) {
  let list = []
  treeList.forEach(node => {
    if(node.children) {
      list = list.concat(getNodeList(node.children))
    } else {
      list.push(node)
    }
  })
  return list
}

interface Props {
  treeData: any[]
  searchText: string
  singleCheck?: boolean
  defaultCheck: string[]
  onCheck?: (keys: string[]) => void
  checkExamine?: (keys: string[]) => boolean
}

export default function useTreeHelper({ checkExamine, treeData, searchText, singleCheck, defaultCheck, onCheck }: Props) {
  const [treeList, setTreeList] = useState([]);
  const [nodeList, setNodeList] = useState([]);
  const [checkedKeys, setCheckedKeys] = useState(defaultCheck);

  const displayCheckedKeys =  useMemo(() => {
    const list = getNodeList(treeList)
    let keys = checkedKeys.filter(key => list.some(node => node.key === key));
    return keys;
  },[JSON.stringify(checkedKeys), JSON.stringify(treeList)])

  const handleCheck = (keys) => { 
    let newCheckedKeys = keys.filter(key => nodeList.some(node => node.key === key));
    if(singleCheck) {
      newCheckedKeys = newCheckedKeys.length ? [newCheckedKeys[newCheckedKeys.length - 1]] : []
    }
    const diplayNodeList = getNodeList(treeList)
    const noChangeList = checkedKeys.filter(key => nodeList.some(node => node.key === key) &&
      diplayNodeList.every(node => node.key !== key))
    newCheckedKeys = newCheckedKeys.concat(noChangeList)
    
    if(!checkExamine || checkExamine(newCheckedKeys)) {
      setCheckedKeys(newCheckedKeys)
      onCheck && onCheck(newCheckedKeys)
    }
  }

  const resetCheckKeys = (keys) => {
    setCheckedKeys(keys)
  }

  useEffect(() => {
    const list = getNodeList(treeData)
    setNodeList(list)
    setTreeList(treeData)
    let newCheckedKeys = defaultCheck.filter(key => list.some(node => node.key === key));
    setCheckedKeys(newCheckedKeys)
    onCheck && onCheck(newCheckedKeys)
  }, [JSON.stringify(treeData)])

  useEffect(() => {
    const formatTreeData = filterTree(treeData, searchText)
    setTreeList(formatTreeData)
  }, [searchText])

  return {
    treeList,
    checkedKeys,
    displayCheckedKeys,
    handleCheck,
    resetCheckKeys
  }
}
