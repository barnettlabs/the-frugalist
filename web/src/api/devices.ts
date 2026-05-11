import apiClient from './client';

export interface UserDevice {
	id: number;
	user_id: number;
	push_token: string;
	device_type: 'ios' | 'android' | 'web';
	device_name: string | null;
	is_active: boolean;
	last_used_at: string | null;
	created_at: string;
	updated_at: string;
}

export const devicesApi = {
	async getAll(): Promise<UserDevice[]> {
		const { data } = await apiClient.get<{ devices: UserDevice[] }>('/devices');
		return data.devices;
	},

	async hasActiveDevices(): Promise<boolean> {
		const devices = await this.getAll();
		return devices.some(d => d.is_active);
	},
};
