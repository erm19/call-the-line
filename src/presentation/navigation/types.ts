/**
 * Navigation types and route parameters
 */

export type RootStackParamList = {
  Home: undefined;
  Camera: { sessionId?: string };
  SessionList: undefined;
  SessionDetail: { sessionId: string };
  Review: { clipId: string };
  Auth: undefined;
  NRTStatus: undefined;
};

export enum Routes {
  Home = 'Home',
  Camera = 'Camera',
  SessionList = 'SessionList',
  SessionDetail = 'SessionDetail',
  Review = 'Review',
  Auth = 'Auth',
  NRTStatus = 'NRTStatus',
}
