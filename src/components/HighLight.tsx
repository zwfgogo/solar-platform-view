import React from 'react'

/**
 * 高亮 搜索文本
 */
interface Props {
  searchKey: string
  txt: string
  children?: React.ReactNode
}

const HighLight = (props: Props) => {
  let handledText = []
  if (props.txt) {
    handledText.push(getMatchTextList(props.txt, props.searchKey))
  } else if (props.children) {
    handledText = React.Children.map(props.children, child => {
      if (typeof child != 'string') {
        return child
      }
      return getMatchTextList(child, props.searchKey)
    })
  }

  return (
    <span>
      {
        handledText.map((matches, index) => {
          if (!(matches instanceof Array)) {
            return matches
          }
          return (
            <span key={index}>
            {
              matches.map((m, index) => {
                if (m == props.searchKey) {
                  return <span key={index} style={{color: '#f05050'}}>{props.searchKey}</span>
                }
                return m
              })
            }
          </span>
          )
        })
      }
      </span>
  )
}

export default HighLight

/**
 * 将字符串根据指定的子串切分成数组, getMatchTextList('abcad', 'a') 返回 ['a', 'bc', 'a', 'd']
 * @param str
 * @param part
 * @returns {*}
 */
function getMatchTextList(str, searchKey) {
  if (!str) {
    return []
  }
  if (!searchKey) {
    return [str]
  }
  const index = str.indexOf(searchKey)
  if (index == -1) {
    return [str]
  }
  let result = []
  if (str.substring(0, index) != '') {
    result.push(str.substring(0, index))
  }
  result.push(searchKey)
  return result.concat(getMatchTextList(str.substr(index + searchKey.length), searchKey))
}
