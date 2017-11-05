// where to put this??
export interface AuthenticationManager {
  isAuthenticated(request: any): Promise<boolean>;
}

export default AuthenticationManager;