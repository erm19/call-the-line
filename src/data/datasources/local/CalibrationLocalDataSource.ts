import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalibrationDTO } from '../../models/CalibrationDTO';

/**
 * Local data source for calibrations
 */
export class CalibrationLocalDataSource {
  private readonly STORAGE_KEY = '@calibrations';

  async create(calibration: CalibrationDTO): Promise<CalibrationDTO> {
    const calibrations = await this.getAll();
    calibrations.push(calibration);
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(calibrations));
    return calibration;
  }

  async getById(id: string): Promise<CalibrationDTO | null> {
    const calibrations = await this.getAll();
    return calibrations.find(c => c.id === id) || null;
  }

  async getAll(): Promise<CalibrationDTO[]> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getBySessionId(sessionId: string): Promise<CalibrationDTO | null> {
    const calibrations = await this.getAll();
    return calibrations.find(c => c.session_id === sessionId) || null;
  }

  async update(id: string, updates: Partial<CalibrationDTO>): Promise<CalibrationDTO | null> {
    const calibrations = await this.getAll();
    const index = calibrations.findIndex(c => c.id === id);
    
    if (index === -1) {
      return null;
    }

    calibrations[index] = {
      ...calibrations[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(calibrations));
    return calibrations[index];
  }

  async delete(id: string): Promise<boolean> {
    const calibrations = await this.getAll();
    const filtered = calibrations.filter(c => c.id !== id);
    
    if (filtered.length === calibrations.length) {
      return false;
    }

    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }
}

