import {
  Resolver,
  Query,
  Mutation,
  Arg,
  Ctx,
  UseMiddleware,
} from 'type-graphql'
import { hash, compare } from 'bcryptjs'

import { User } from '../../entity/User'
import { RegisterInput } from './register/RegisterInput'
import { LoginResponse } from './login/LoginResponse'
import { createAccessToken, createRefreshToken } from './auth'
import { MyContext } from '../../types/MyContext'
import { isAuth } from './isAuth'

@Resolver()
export class UserResolver {
  @Query(() => String)
  hello(): string {
    return 'Hello World'
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return await User.find()
  }

  @Mutation(() => User)
  async register(
    @Arg('data')
    { email, password }: RegisterInput
  ): Promise<User> {
    const hashPassword = await hash(password, 12)

    const user = await User.create({ email, password: hashPassword }).save()

    return user
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: MyContext
  ): Promise<LoginResponse> {
    const user = await User.findOne({ email })

    if (!user) throw new Error('User not found')

    const valid = await compare(password, user.password)

    if (!valid) throw new Error('Wrong passowrd')

    const refreshToken = createRefreshToken(user)
    res.cookie('cid', refreshToken, { httpOnly: true })

    const accessToken = createAccessToken(user)
    return { accessToken }
  }

  @Query(() => String)
  @UseMiddleware(isAuth)
  async bye(@Ctx() { payload }: MyContext): Promise<string> {
    return `your id is ${payload.userId}`
  }
}
