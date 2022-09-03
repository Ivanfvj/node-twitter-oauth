import DB, { IAccount } from "./mongoose/account";

export class AccountRepository {
  constructor() {}

  async findAccountByAccessToken(accessToken: string) {
    const document = await DB.findOne({ oauth_token: accessToken });
    return document ? document.toJSON() : null;
  }

  async findAccountByProviderAccountId(providerAccountId: string | number) {
    const document = await DB.findOne({ providerAccountId: providerAccountId });
    return document ? document.toJSON() : null;
  }

  async upsertAccount(account: IAccount) {
    const document = await DB.findOneAndUpdate(
      { providerAccountId: account.providerAccountId },
      { $set: account },
      {
        upsert: true,
        new: true,
      }
    );
    return document ? document.toJSON() : null;
  }
}
