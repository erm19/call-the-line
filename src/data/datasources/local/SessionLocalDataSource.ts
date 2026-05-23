import { SessionDTO } from '../../models/SessionDTO';

/**
 * Local data source for sessions
 * Implementation: Drizzle ORM on expo-sqlite (task 1.4)
 */
export class SessionLocalDataSource {
  async create(_session: SessionDTO): Promise<SessionDTO> {
    throw new Error('SessionLocalDataSource.create not yet implemented');
  }

  async getById(_id: string): Promise<SessionDTO | null> {
    throw new Error('SessionLocalDataSource.getById not yet implemented');
  }

  async getAll(): Promise<SessionDTO[]> {
    throw new Error('SessionLocalDataSource.getAll not yet implemented');
  }

  async update(_id: string, _updates: Partial<SessionDTO>): Promise<SessionDTO | null> {
    throw new Error('SessionLocalDataSource.update not yet implemented');
  }

  async delete(_id: string): Promise<boolean> {
    throw new Error('SessionLocalDataSource.delete not yet implemented');
  }
}
