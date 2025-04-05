// src/lib/mongodb/connect.ts
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Load environment variables if not already loaded
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: resolve(__dirname, '../../../.env.local') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined')
  console.error('Environment variables loaded:', Object.keys(process.env).length)
  console.error('Current directory:', process.cwd())
  throw new Error('Please define the MONGODB_URI environment variable')
}

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectMongoDB() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log('Connecting to MongoDB...')
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB successfully!')
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    console.error('MongoDB connection error:', e)
    cached.promise = null
    throw e
  }
}

export default connectMongoDB