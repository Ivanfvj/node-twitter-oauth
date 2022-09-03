import DB, { IUser } from "./mongoose/user";

export class UserRepository {
  constructor() {}

  // We use providerAccountId as unique identifier.
  async findUserByProviderAccountId(providerAccountId: string) {
    const document = await DB.findOne({ providerAccountId: providerAccountId });
    return document ? (document.toJSON() as IUser) : null;
  }

  // Email field is optional as the user can reject this permission in the OAuth login
  // or your application can disable the access for this resource in the Twitter Developer Portal.
  async findUserByEmail(email: string) {
    const document = await DB.findOne({ email: email });
    return document ? (document.toJSON() as IUser) : null;
  }

  async upsertUser(user: IUser) {
    const document = await DB.findOneAndUpdate(
      { providerAccountId: user.providerAccountId },
      { $set: user },
      {
        upsert: true,
        new: true,
      }
    );
    return document.toJSON() as IUser;
  }
}
