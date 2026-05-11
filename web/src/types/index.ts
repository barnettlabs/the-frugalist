// Export all types and enums
export * from './enums';
export * from './models';

// Common utility types
export interface User {
	id: number;
	name: string;
	email: string;
	email_verified_at?: string;
	is_admin?: boolean;
	created_at: string;
	updated_at: string;
}

export interface Profile {
	id: number;
	user_id: number;
	first_name?: string;
	last_name?: string;
	phone?: string;
	created_at: string;
	updated_at: string;
}

export interface PageProps {
	auth?: {
		user: User;
	};
	user?: User;
	profile?: Profile;
	flash?: {
		message?: string;
		type?: 'success' | 'error' | 'info' | 'warning';
	};
	errors?: Record<string, string[]>;
}
