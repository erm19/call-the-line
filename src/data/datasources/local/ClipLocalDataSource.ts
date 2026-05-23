import { ClipDTO } from '../../models/ClipDTO';

/**
 * Local data source for clips
 * Implementation: Drizzle ORM on expo-sqlite (task 2.5)
 */
export class ClipLocalDataSource {
  async create(_clip: ClipDTO): Promise<ClipDTO> {
    throw new Error('ClipLocalDataSource.create not yet implemented');
  }

  async getById(_id: string): Promise<ClipDTO | null> {
    throw new Error('ClipLocalDataSource.getById not yet implemented');
  }

  async getAll(): Promise<ClipDTO[]> {
    throw new Error('ClipLocalDataSource.getAll not yet implemented');
  }

  async getBySessionId(_sessionId: string): Promise<ClipDTO[]> {
    throw new Error('ClipLocalDataSource.getBySessionId not yet implemented');
  }

  async update(_id: string, _updates: Partial<ClipDTO>): Promise<ClipDTO | null> {
    throw new Error('ClipLocalDataSource.update not yet implemented');
  }

  async delete(_id: string): Promise<boolean> {
    throw new Error('ClipLocalDataSource.delete not yet implemented');
  }

  async deleteBySessionId(_sessionId: string): Promise<void> {
    throw new Error('ClipLocalDataSource.deleteBySessionId not yet implemented');
  }
}
