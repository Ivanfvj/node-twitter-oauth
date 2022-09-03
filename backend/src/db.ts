import mongoose from "mongoose";
import { ENVIRONMENT } from "@src/config";

import { Logger } from "./logger";
import { WinstonLogger } from "./logger/winston.logger";

export interface MongoDbConfig {
  uri?: string;
  user: string;
  password: string;
  server: string;
  port: number;
  db: string;
}

export default class DatabaseBootstrap {
  dbConfig: MongoDbConfig;
  logger: Logger;

  constructor(dbConfig: MongoDbConfig) {
    this.dbConfig = dbConfig;
    this.logger = new WinstonLogger();

    if (!dbConfig) throw Error("The configuration of the database is not set");
    if (!dbConfig.uri) {
      if (!dbConfig.server) throw Error("server param required");
      if (!dbConfig.port) throw Error("port param required");
      if (!dbConfig.user) throw Error("user param required");
      if (!dbConfig.password) throw Error("password param required");
      if (!dbConfig.db) throw Error("db param required - name of the database");
    }
  }

  async initialize(): Promise<mongoose.Connection> {
    const dbConfig = this.dbConfig;
    const uri =
      dbConfig.uri ||
      `mongodb://${dbConfig.user}:${dbConfig.password}@${dbConfig.server}:${dbConfig.port}/${dbConfig.db}`;

    // Remove Deprecation Warnings https://mongoosejs.com/docs/deprecations.html
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: ENVIRONMENT !== "production", // Disable autoIndex in Production: Is recommended by https://mongoosejs.com/docs/guide.html#indexes
    };

    return new Promise((resolve, reject) => {
      mongoose
        .connect(uri, options)
        .then((conn) => {
          this.logger.info(
            `Database is connected to ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
          );
          resolve(conn.connection);
        })
        .catch((error) => {
          this.logger.error(error);
          reject(error);
        });
    });
  }
}
