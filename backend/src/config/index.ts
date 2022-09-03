export const ENVIRONMENT: "production" | "development" =
  process.env.NODE_ENV === "production" ? "production" : "development";

export default {
  environment: ENVIRONMENT,
  jwt: {
    secret: process.env.JWT_SECRET || "secret-default",
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || "secret-default",
    encryptAlgorithm: process.env.JWT_ALGORITHM || "HS256",
    tokenLife: Number(process.env.JWT_TOKEN_LIFE) || 86400, // 1 day
    refreshTokenLife: Number(process.env.JWT_REFRESH_TOKEN_LIFE) || 86400, // 1 day
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  },
  server: {
    PORT: process.env.APP_PORT || 4000,
    DOMAIN: process.env.APP_DOMAIN || "localhost",
    ENABLE_CORS: parseBooleanEnv(process.env.ENABLE_CORS),
  },
  mongo: {
    uri: process.env.MONGO_URI,
    server: process.env.MONGO_HOST || "localhost",
    port: process.env.MONGO_PORT ? Number(process.env.MONGO_PORT) : 27017,
    db: process.env.MONGO_DB_NAME || "",
    user: process.env.MONGO_DB_USER || "",
    password: process.env.MONGO_DB_PASSWORD || "",
  },
  twitter: {
    oauth: {
      clientId: process.env.TWITTER_OAUTH_CLIENT_ID || "",
      secret: process.env.TWITTER_OAUTH_CLIENT_SECRET || "",
      callbackUrl: process.env.TWITTER_OAUTH_CALLBACK_URL || "",
    },
    key: process.env.TWITTER_CONSUMER_KEY || "",
    secret: process.env.TWITTER_CONSUMER_SECRET || "",
    bearerToken: process.env.TWITTER_CONSUMER_BEARER_TOKEN || "",
  },
  cookie: {
    name: "connect.twitter",
    secret: process.env.COOKIE_SECRET || "",
    maxAge: Number(process.env.COOKIE_MAX_AGE) || 1000 * 60 * 60 * 2, // 2 hours
  },
};

function parseBooleanEnv(env?: string) {
  if (env) {
    return env.trim().toLowerCase() === "true";
  } else return false;
}
