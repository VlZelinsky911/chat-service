export interface AuthResult{
	accessToken: string;
	refreshToken: string;
	user: {id: string, email: string}
}

export interface LogoutResult {
	success: boolean;
}