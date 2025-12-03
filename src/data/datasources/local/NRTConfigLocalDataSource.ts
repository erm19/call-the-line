import AsyncStorage from '@react-native-async-storage/async-storage';
import { NRTConfigDTO } from '../../models/NRTConfigDTO';
import { NRT_CONSTANTS, CAMERA_CONSTANTS } from '@core/config/constants';

/**
 * Local data source for NRT configuration
 */
export class NRTConfigLocalDataSource {
  private readonly STORAGE_KEY = '@nrt_config';

  async getConfig(): Promise<NRTConfigDTO> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEY);
    
    if (data) {
      return JSON.parse(data);
    }

    // Return default config
    const defaultConfig: NRTConfigDTO = {
      id: 'default',
      enabled: false,
      mode: 'on_device',
      target_fps: NRT_CONSTANTS.TARGET_FPS,
      resolution: NRT_CONSTANTS.TARGET_RESOLUTION,
      buffer_window_seconds: NRT_CONSTANTS.BUFFER_WINDOW_SECONDS,
      max_latency_ms: NRT_CONSTANTS.MAX_NRT_LATENCY_MS,
      device_tier: 'medium',
      auto_adjust_quality: true,
      min_confidence_threshold: 0.7,
      camera_device: CAMERA_CONSTANTS.PREFERRED_DEVICE,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await this.saveConfig(defaultConfig);
    return defaultConfig;
  }

  async saveConfig(config: NRTConfigDTO): Promise<NRTConfigDTO> {
    const updated = { ...config, updated_at: new Date().toISOString() };
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  async updateConfig(updates: Partial<NRTConfigDTO>): Promise<NRTConfigDTO> {
    const current = await this.getConfig();
    return this.saveConfig({ ...current, ...updates });
  }
}

