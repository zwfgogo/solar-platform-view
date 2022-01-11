import http from '../../public/js/http'
import { removeChildren } from '../page.helper'

export function getCustomerInformation(data) {
  return http({
    method: "get",
    url: "/basic-data-management/customers",
    data: data,
    convert: (results) => {
      return {
        totalCount: results.totalCount,
        results: removeChildren(results.results)
      }
    }
  })
}

export function getCustomerAdd(data) {
  return http({
    method: "post",
    url: "/basic-data-management/customers",
    data: data
  })
}

export function getCustomerRevise(data) {
  return http({
    method: "put",
    url: "/basic-data-management/customers/:id",
    data: data
  })
}

export function getCustomerType(data) {
  return http({
    method: "get",
    url: "/enums/customer/type/false",
    data: data
  })
}

export function getCustomerTypeAll(data) {
  return http({
    method: "get",
    url: "/enums/customer/type/true",
    data: data
  })
}

export function getSuperiorUnits(data) {
  return http({
    method: "get",
    url: "/enums/superior/units",
    data: data
  })
}

export function customerDelete(data) {
  return http({
    method: "delete",
    url: "/basic-data-management/customers/:id",
    data: data
  })
}

export function getImage(data) {
  return http({
    method: "get",
    url: "/image",
    data: data
  })
}

export function getStationInfo(data) {
  return http({
    method: "get",
    url: "/basic-data-management/customers/station",
    data: data
  })
}

export function firmsType(data) {
  return http({
    method: "get",
    url: "/enums/firms/type",
    data: data
  })
}

export function getDetail(data) {
  return http({
    method: "get",
    url: '/basic-data-management/customers/:id',
    data: data
  })
}
