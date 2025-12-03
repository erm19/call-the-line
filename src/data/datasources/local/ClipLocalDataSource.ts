import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClipDTO } from '../../models/ClipDTO';

/**
 * Local data source for clips
 */
export class ClipLocalDataSource {
  private readonly STORAGE_KEY = '@clips';

  async create(clip: ClipDTO): Promise<ClipDTO> {
    const clips = await this.getAll();
    clips.push(clip);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(clips));
    return clip;
  }

  async getById(id: string): Promise<ClipDTO | null> {
    const clips = await this.getAll();
    return clips.find(c => c.id === id) || null;
  }

  async getAll(): Promise<ClipDTO[]> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getBySessionId(sessionId: string): Promise<ClipDTO[]> {
    const clips = await this.getAll();
    return clips.filter(c => c.session_id === sessionId);
  }

  async update(id: string, updates: Partial<ClipDTO>): Promise<ClipDTO | null> {
    const clips = await this.getAll();
    const index = clips.findIndex(c => c.id === id);
    
    if (index === -1) {
      return null;
    }

    clips[index] = { ...clips[index], ...updates, updated_at: new Date().toISOString() };
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(clips));
    return clips[index];
  }

  async delete(id: string): Promise<boolean> {
    const clips = await this.getAll();
    const filtered = clips.filter(c => c.id !== id);
    
    if (filtered.length === clips.length) {
      return false;
    }

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    const clips = await this.getAll();
    const filtered = clips.filter(c => c.session_id !== sessionId);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }
}

