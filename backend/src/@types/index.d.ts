import "express-session";

// Define custom session properties on cookie
declare module "express-session" {
  interface SessionData {
    codeVerifier: string;
    state: string;
    codeChallenge: string;
    url: string;
  }
}
