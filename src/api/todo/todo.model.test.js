import test from 'ava'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const Todo = mongo.model('Todo', schema)
  const todo = await Todo.create({ title: 'test', description: 'test' })

  t.context = { ...t.context, Todo, todo }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { todo } = t.context
  const view = todo.view()
  t.true(typeof view === 'object')
  t.true(view.id === todo.id)
  t.true(view.title === todo.title)
  t.true(view.description === todo.description)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})

test('full view', (t) => {
  const { todo } = t.context
  const view = todo.view(true)
  t.true(typeof view === 'object')
  t.true(view.id === todo.id)
  t.true(view.title === todo.title)
  t.true(view.description === todo.description)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})
