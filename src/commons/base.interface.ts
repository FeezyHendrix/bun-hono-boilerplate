import { Id, Limit, Page } from "./base.types"

export interface Pagination<T> {
  data: T[],
  page: number,
  limit: number,
  totalPage: number,
}

export interface BaseService<T> {
  create: (payload: Partial<T>) => T
  findAll: (filter: any, page: Page, limit: Limit) => Pagination<T>
  findOne: (id: Id) => T
  updateOne: (id: Id, payload: Partial<T>) => T
  deleteOne: (id: Id) => void
}


export interface BaseController<T, Dto> {
  createEntity: (c: any) => void
  fetchAllEntity: (c: any) => void
  fetchOneEntity: (c: any) => void
  updateOneEntity: (c: any) => void
  deleteOneEntity: (c: any) => void
}