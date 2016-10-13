import mongoose, { Schema } from 'mongoose'

const todoSchema = new Schema({
  title: {
    type: String
  },
  description: {
    type: String
  }
}, {
  timestamps: true
})

todoSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      title: this.title,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

export default mongoose.model('Todo', todoSchema)
