import 'dotenv/config'
import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import cookieParser from 'cookie-parser'
import { verify } from 'jsonwebtoken'

import { UserResolver } from './features/user/UserResolver'
import { User } from './entity/User'
import { createAccessToken, createRefreshToken } from './features/user/auth'
import { sendRefreshToken } from './features/user/sendRefreshToken'

const main = async () => {
  const app = express()

  app.use(cookieParser())

  app.post('/refresh_token', async (req, res) => {
    const token = req.cookies.cid

    if (!token) return res.send({ ok: false, accessToken: '' })

    let payload: any = null
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET)
    } catch (err) {
      return res.send({ ok: false, accessToken: '' })
    }

    const user = await User.findOne({ id: payload.userId })

    if (!user) return res.send({ ok: false, accessToken: '' })

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' })
    }

    sendRefreshToken(res, createRefreshToken(user))

    return res.send({ ok: true, accessToken: createAccessToken(user) })
  })

  await createConnection()

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  })

  apolloServer.applyMiddleware({ app, cors: false })

  app.listen(process.env.PORT || 4000)
}

main()
