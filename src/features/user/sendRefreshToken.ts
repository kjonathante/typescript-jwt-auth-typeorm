import { Response } from 'express'

export const sendRefreshToken = (res: Response, token: string): void => {
  res.cookie('cid', token, {
    httpOnly: true,
    path: '/refresh_token',
  })
}
