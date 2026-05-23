import { CalibrationDTO } from '../../models/CalibrationDTO';

/**
 * Local data source for calibrations
 * Implementation: Drizzle ORM on expo-sqlite (task 3.1)
 */
export class CalibrationLocalDataSource {
  async create(_calibration: CalibrationDTO): Promise<CalibrationDTO> {
    throw new Error('CalibrationLocalDataSource.create not yet implemented');
  }

  async getById(_id: string): Promise<CalibrationDTO | null> {
    throw new Error('CalibrationLocalDataSource.getById not yet implemented');
  }

  async getAll(): Promise<CalibrationDTO[]> {
    throw new Error('CalibrationLocalDataSource.getAll not yet implemented');
  }

  async getBySessionId(_sessionId: string): Promise<CalibrationDTO | null> {
    throw new Error('CalibrationLocalDataSource.getBySessionId not yet implemented');
  }

  async update(_id: string, _updates: Partial<CalibrationDTO>): Promise<CalibrationDTO | null> {
    throw new Error('CalibrationLocalDataSource.update not yet implemented');
  }

  async delete(_id: string): Promise<boolean> {
    throw new Error('CalibrationLocalDataSource.delete not yet implemented');
  }
}
