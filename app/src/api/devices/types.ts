export type DeviceType = 'ios' | 'android' | 'web';

export type UserDevice = {
  id: number;
  user_id: number;
  device_name: string | null;
  device_type: DeviceType;
  push_token: string;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RegisterDeviceRequest = {
  push_token: string;
  device_type: DeviceType;
  device_name?: string;
};

export type UpdateDeviceRequest = {
  device_name?: string;
  is_active?: boolean;
};
