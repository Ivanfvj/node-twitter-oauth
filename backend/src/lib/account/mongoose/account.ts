import { Schema, Document, Model, model, SchemaOptions } from "mongoose";

export interface AccountModel {
  id?: string;
  userId?: string;
  type?: string;

  provider?: string;
  providerAccountId?: string | number;

  id_token?: string;
  scope?: string;
  token_type?: string;
  session_state?: string;
  expires_at?: Date;

  // For OAuth1 providers
  oauth_token?: string;
  oauth_token_secret?: string;
  // For OAuth2 providers
  access_token?: string;
  refresh_token?: string;

  createdAt: Date;
  updatedAt: Date;
}

interface Account
  extends Omit<AccountModel, "id" | "createdAt" | "updatedAt"> {}

export interface IAccount extends Account {
  readonly _id?: any;
}

export interface AccountDocument extends Account, Document {}
export interface MongoAccountModel extends Model<AccountDocument> {}

const opts: SchemaOptions = { toJSON: { virtuals: true }, timestamps: true };
export const accountSchema = new Schema<
  AccountDocument,
  MongoAccountModel,
  Account
>(
  {
    userId: { type: String, required: true },
    type: { type: String, required: true },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },

    access_token: { type: String, required: false },
    refresh_token: { type: String, required: false },
    expires_at: { type: Date, required: false },
    token_type: { type: String, required: false },
    scope: { type: String, required: false },
    id_token: { type: String, required: false },
    session_state: { type: String, required: false },
    oauth_token: { type: String, required: false },
    oauth_token_secret: { type: String, required: false },
  },
  opts
);

export default model<AccountDocument, MongoAccountModel>(
  "Account",
  accountSchema
);
