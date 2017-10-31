export interface AuthenticationManager {
  isAuthenticated(request: any): Promise<boolean>;
}

export default AuthenticationManager;