import AsyncStorage from '@react-native-async-storage/async-storage';
import { SessionDTO } from '../../models/SessionDTO';

/**
 * Local data source for sessions
 * Uses AsyncStorage for persistence
 */
export class SessionLocalDataSource {
  private readonly STORAGE_KEY = '@sessions';

  async create(session: SessionDTO): Promise<SessionDTO> {
    const sessions = await this.getAll();
    sessions.push(session);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    return session;
  }

  async getById(id: string): Promise<SessionDTO | null> {
    const sessions = await this.getAll();
    return sessions.find(s => s.id === id) || null;
  }

  async getAll(): Promise<SessionDTO[]> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async update(id: string, updates: Partial<SessionDTO>): Promise<SessionDTO | null> {
    const sessions = await this.getAll();
    const index = sessions.findIndex(s => s.id === id);
    
    if (index === -1) {
      return null;
    }

    sessions[index] = { ...sessions[index], ...updates, updated_at: new Date().toISOString() };
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    return sessions[index];
  }

  async delete(id: string): Promise<boolean> {
    const sessions = await this.getAll();
    const filtered = sessions.filter(s => s.id !== id);
    
    if (filtered.length === sessions.length) {
      return false;
    }

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}

