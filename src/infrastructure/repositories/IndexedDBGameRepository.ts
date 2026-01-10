import type { Game } from '@/domain'
import type { GameRepository } from '@/domain'
import { GameMapper } from '../mappers'
import type { GameDTO } from '../mappers'

const DB_NAME = 'gsr'
const DB_VERSION = 1
const STORE_NAME = 'game'
const GAME_KEY = 'active'

export class IndexedDBGameRepository implements GameRepository {
  private db: IDBDatabase | null = null
  private readonly mapper = new GameMapper()

  async save(game: Game): Promise<void> {
    const db = await this.getDB()
    const dto = this.mapper.toDTO(game)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put(dto, GAME_KEY)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to save game'))
    })
  }

  async load(): Promise<Game | null> {
    const db = await this.getDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(GAME_KEY)

      request.onsuccess = () => {
        const dto = request.result as GameDTO | undefined
        if (!dto) {
          resolve(null)
          return
        }
        resolve(this.mapper.toDomain(dto))
      }
      request.onerror = () => reject(new Error('Failed to load game'))
    })
  }

  async clear(): Promise<void> {
    const db = await this.getDB()

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(GAME_KEY)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(new Error('Failed to clear game'))
    })
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('IndexedDB is not available'))
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }
    })
  }
}
