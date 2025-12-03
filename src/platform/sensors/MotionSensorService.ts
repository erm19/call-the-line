import { Result } from '@core/utils/result';
import { AppError } from '@core/errors/AppError';

/**
 * Accelerometer data
 */
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Gyroscope data
 */
export interface GyroscopeData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Motion sensor listener callback
 */
export type SensorListener<T> = (data: T) => void;

/**
 * Motion Sensor Service Interface
 * Provides access to device motion sensors for camera stability detection
 */
export interface IMotionSensorService {
  /**
   * Starts accelerometer monitoring
   */
  startAccelerometer(
    listener: SensorListener<AccelerometerData>,
    interval?: number,
  ): Promise<Result<void, AppError>>;

  /**
   * Stops accelerometer monitoring
   */
  stopAccelerometer(): Promise<Result<void, AppError>>;

  /**
   * Starts gyroscope monitoring
   */
  startGyroscope(
    listener: SensorListener<GyroscopeData>,
    interval?: number,
  ): Promise<Result<void, AppError>>;

  /**
   * Stops gyroscope monitoring
   */
  stopGyroscope(): Promise<Result<void, AppError>>;

  /**
   * Checks if camera is stable (for calibration, etc.)
   */
  isCameraStable(threshold?: number): boolean;
}

/**
 * Motion Sensor Service Implementation Stub
 * TODO: Implement with react-native-sensors or expo-sensors
 */
export class MotionSensorService implements IMotionSensorService {
  private _accelerometerListener: SensorListener<AccelerometerData> | null = null;
  private _gyroscopeListener: SensorListener<GyroscopeData> | null = null;
  private recentAccelData: AccelerometerData[] = [];

  async startAccelerometer(
    listener: SensorListener<AccelerometerData>,
    _interval: number = 100,
  ): Promise<Result<void, AppError>> {
    this._accelerometerListener = listener;
    
    // TODO: Start actual accelerometer
    // import { accelerometer } from 'react-native-sensors';
    // accelerometer.subscribe(({ x, y, z, timestamp }) => {
    //   this.accelerometerListener({ x, y, z, timestamp });
    // });

    return {
      isSuccess: true,
      isFailure: false,
      value: undefined,
    } as Result<void, AppError>;
  }

  async stopAccelerometer(): Promise<Result<void, AppError>> {
    this._accelerometerListener = null;
    // TODO: Stop actual accelerometer subscription
    return {
      isSuccess: true,
      isFailure: false,
      value: undefined,
    } as Result<void, AppError>;
  }

  async startGyroscope(
    listener: SensorListener<GyroscopeData>,
    _interval: number = 100,
  ): Promise<Result<void, AppError>> {
    this._gyroscopeListener = listener;
    
    // TODO: Start actual gyroscope
    // import { gyroscope } from 'react-native-sensors';
    // gyroscope.subscribe(({ x, y, z, timestamp }) => {
    //   this.gyroscopeListener({ x, y, z, timestamp });
    // });

    return {
      isSuccess: true,
      isFailure: false,
      value: undefined,
    } as Result<void, AppError>;
  }

  async stopGyroscope(): Promise<Result<void, AppError>> {
    this._gyroscopeListener = null;
    // TODO: Stop actual gyroscope subscription
    return {
      isSuccess: true,
      isFailure: false,
      value: undefined,
    } as Result<void, AppError>;
  }

  isCameraStable(threshold: number = 0.1): boolean {
    if (this.recentAccelData.length < 10) {
      return false;
    }

    // Calculate variance in recent accelerometer data
    const recent = this.recentAccelData.slice(-10);
    const avgX = recent.reduce((sum, d) => sum + d.x, 0) / recent.length;
    const avgY = recent.reduce((sum, d) => sum + d.y, 0) / recent.length;
    const avgZ = recent.reduce((sum, d) => sum + d.z, 0) / recent.length;

    const variance = recent.reduce((sum, d) => {
      return sum + Math.pow(d.x - avgX, 2) + Math.pow(d.y - avgY, 2) + Math.pow(d.z - avgZ, 2);
    }, 0) / recent.length;

    return variance < threshold;
  }
}

