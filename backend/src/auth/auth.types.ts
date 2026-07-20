export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
}
