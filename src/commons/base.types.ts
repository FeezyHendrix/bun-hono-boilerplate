import { HttpException } from '../exceptions/http.exception';
import { assertString } from '../utils/assertions'
import { isEmail, isNumber } from 'class-validator';
import httpStatus from 'http-status';

export type Opaque<K, T> = T & { __TYPE__: K };

export type Email = Opaque<'EmailAddress', string>;

export function Email(value) {
  if (!isEmail(value)) throw new HttpException(httpStatus.BAD_REQUEST, 'Email address is not valid');

  return value as Email;
}

export type LoanId = Opaque<'LoanId', string>;

export type Id = Opaque<'Id', string>;

export function Id(value) {
  assertString(value);
  return value as Id;
}

export type Page = Opaque<'Page', number>;

export type Limit = Opaque<'Limit', number>;

export function Page(value) {
  if (!isNumber(value)) throw new HttpException(httpStatus.BAD_REQUEST, 'Page is invalid');
  return value as Page;
}

export function Limit(value) {
  if (!isNumber(value)) throw new HttpException(httpStatus.BAD_REQUEST, 'limit is invalid');
  return value as Limit;
}
