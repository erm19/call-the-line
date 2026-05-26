import { NRTConfigDTO } from '../../models/NRTConfigDTO';

/**
 * Local data source for NRT configuration
 * Implementation: Drizzle ORM on expo-sqlite (task 1.4 / Phase 5)
 */
export class NRTConfigLocalDataSource {
  async getConfig(_sessionId: string): Promise<NRTConfigDTO> {
    throw new Error('NRTConfigLocalDataSource.getConfig not yet implemented');
  }

  async saveConfig(_config: NRTConfigDTO): Promise<NRTConfigDTO> {
    throw new Error('NRTConfigLocalDataSource.saveConfig not yet implemented');
  }

  async updateConfig(_updates: Partial<NRTConfigDTO>): Promise<NRTConfigDTO> {
    throw new Error('NRTConfigLocalDataSource.updateConfig not yet implemented');
  }
}
