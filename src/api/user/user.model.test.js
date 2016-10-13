import test from 'ava'
import crypto from 'crypto'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const User = mongo.model('User', schema)
  const user = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })

  t.context = { ...t.context, User, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { user } = t.context
  const fullView = user.view(true)
  t.true(fullView.id === user.id)
  t.true(fullView.name === user.name)
  t.true(fullView.email === user.email)
  t.true(fullView.picture === user.picture)
  t.true(fullView.createdAt === user.createdAt)
})

test('name', (t) => {
  t.context.user.name = ''
  t.context.user.email = 'test@example.com'
  t.true(t.context.user.name === 'test')
})

test('picture', async (t) => {
  const { user } = t.context
  const hash = crypto.createHash('md5').update(user.email).digest('hex')
  t.true(user.picture === `https://gravatar.com/avatar/${hash}?d=identicon`)

  user.picture = 'test.jpg'
  user.email = 'test@example.com'
  await user.save()
  t.true(user.picture === 'test.jpg')
})

test('authenticate', async (t) => {
  t.truthy(await t.context.user.authenticate('123456'))
  t.falsy(await t.context.user.authenticate('blah'))
})
