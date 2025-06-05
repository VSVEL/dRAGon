// Simple in-memory database simulation (replace with real DB in production)
interface DatabaseRecord {
  id: string
  userId: string
  data: any
  createdAt: Date
  updatedAt: Date
}

class SimpleDB {
  private static instance: SimpleDB
  private records: Map<string, DatabaseRecord> = new Map()

  static getInstance(): SimpleDB {
    if (!SimpleDB.instance) {
      SimpleDB.instance = new SimpleDB()
    }
    return SimpleDB.instance
  }

  async create(table: string, userId: string, data: any): Promise<string> {
    const id = `${table}_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const record: DatabaseRecord = {
      id,
      userId,
      data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.records.set(id, record)
    return id
  }

  async findByUserId(table: string, userId: string): Promise<DatabaseRecord[]> {
    return Array.from(this.records.values())
      .filter((record) => record.id.startsWith(`${table}_${userId}_`))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async update(id: string, data: Partial<any>): Promise<void> {
    const record = this.records.get(id)
    if (record) {
      record.data = { ...record.data, ...data }
      record.updatedAt = new Date()
      this.records.set(id, record)
    }
  }

  async delete(id: string): Promise<void> {
    this.records.delete(id)
  }

  async findById(id: string): Promise<DatabaseRecord | undefined> {
    return this.records.get(id)
  }
}

export const db = SimpleDB.getInstance()
