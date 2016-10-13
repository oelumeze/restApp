import test from 'ava'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import { masterKey } from '../../config'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import routes, { Todo } from '.'

const app = () => express(routes)

test.before(async (t) => {
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  const todo = await Todo.create({})
  t.context = { ...t.context, masterKey, todo }
})

test.afterEach.always(async (t) => {
  await Todo.remove()
})

test.serial('POST /todos 201 (master)', async (t) => {
  const { masterKey } = t.context
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, title: 'test', description: 'test' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.title === 'test')
  t.true(body.description === 'test')
})

test.serial('POST /todos 401 (admin)', async (t) => {
  const { adminSession } = t.context
  const { status } = await request(app())
    .post('/')
    .send({ access_token: adminSession })
  t.true(status === 401)
})

test.serial('POST /todos 401 (user)', async (t) => {
  const { userSession } = t.context
  const { status } = await request(app())
    .post('/')
    .send({ access_token: userSession })
  t.true(status === 401)
})

test.serial('POST /todos 401', async (t) => {
  const { status } = await request(app())
    .post('/')
  t.true(status === 401)
})

test.serial('GET /todos 200', async (t) => {
  const { status, body } = await request(app())
    .get('/')
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /todos/:id 200', async (t) => {
  const { todo } = t.context
  const { status, body } = await request(app())
    .get(`/${todo.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === todo.id)
})

test.serial('GET /todos/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('PUT /todos/:id 200', async (t) => {
  const { todo } = t.context
  const { status, body } = await request(app())
    .put(`/${todo.id}`)
    .send({ title: 'test', description: 'test' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === todo.id)
  t.true(body.title === 'test')
  t.true(body.description === 'test')
})

test.serial('PUT /todos/:id 404', async (t) => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ title: 'test', description: 'test' })
  t.true(status === 404)
})

test.serial('DELETE /todos/:id 204', async (t) => {
  const { todo } = t.context
  const { status } = await request(app())
    .delete(`/${todo.id}`)
  t.true(status === 204)
})

test.serial('DELETE /todos/:id 404', async (t) => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
  t.true(status === 404)
})
