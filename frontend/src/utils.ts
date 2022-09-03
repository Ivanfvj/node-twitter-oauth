export interface TwitterProfile {
  id: string;
  name: string;
  username: string;
  email?: string;
  image?: string;
}

export interface TwitterUserData {
  twitterId: string;
  username: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
  image?: string;
}

export const tokenKeyLocalStorage = "accessToken";

export function logout() {}

export function getTokenFromLocalStorage() {
  const accessToken = localStorage.getItem(tokenKeyLocalStorage);
  return accessToken;
}
