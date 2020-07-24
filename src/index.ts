import 'dotenv/config'
import 'reflect-metadata'
import express from 'express'
import { createConnection } from 'typeorm'
import { ApolloServer } from 'apollo-server-express'
import { buildSchema } from 'type-graphql'
import { UserResolver } from './features/user/UserResolver'

const main = async () => {
  await createConnection()
  const schema = await buildSchema({
    resolvers: [UserResolver],
  })

  const app = express()

  const apolloServer = new ApolloServer({
    schema,
    context: ({ req, res }) => ({ req, res }),
  })

  apolloServer.applyMiddleware({ app })

  app.listen(4000, () => {
    console.log(`Listening on http://localhost:4000/graphql`)
  })
}

main()
