import test from 'ava'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import { masterKey } from '../../config'
import { verify } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import routes from '.'
import { User } from '../user'

const app = () => express(routes)

test.before(async (t) => {
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  t.context.user = await User.create({ email: 'a@a.com', password: '123456' })
})

test.afterEach.always(async (t) => {
  await User.remove()
})

test.serial('POST /auth 201 (master)', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('a@a.com', '123456')
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(typeof body.token === 'string')
  t.true(typeof body.user === 'object')
  t.true(body.user.id === t.context.user.id)
  t.notThrows(verify(body.token))
})

test.serial('POST /auth 400 (master) - invalid email', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('invalid', '123456')
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'email')
})

test.serial('POST /auth 400 (master) - invalid password', async (t) => {
  const { status, body } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('a@a.com', '123')
  t.true(status === 400)
  t.true(typeof body === 'object')
  t.true(body.param === 'password')
})

test.serial('POST /auth 401 (master) - user does not exist', async (t) => {
  const { status } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('b@b.com', '123456')
  t.true(status === 401)
})

test.serial('POST /auth 401 (master) - wrong password', async (t) => {
  const { status } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
    .auth('a@a.com', '654321')
  t.true(status === 401)
})

test.serial('POST /auth 401 (master) - missing access_token', async (t) => {
  const { status } = await request(app())
    .post('/')
    .auth('a@a.com', '123456')
  t.true(status === 401)
})

test.serial('POST /auth 401 (master) - missing auth', async (t) => {
  const { status } = await request(app())
    .post('/')
    .query({ access_token: masterKey })
  t.true(status === 401)
})
