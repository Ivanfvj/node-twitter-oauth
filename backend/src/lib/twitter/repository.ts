import DB, {
  TwitterOAuthState,
  OAuth1State,
  OAuth2State,
} from "../auth/mongoose/twitter-oauth";

export class TwitterLoginStateRepository {
  constructor() {}

  async createState(state: TwitterOAuthState) {
    const document = await DB.create(state);
    return document.toJSON();
  }

  async findByOAuthToken(oauth_token: string): Promise<OAuth1State | null> {
    const document = await DB.findOne({
      oauth_token,
      version: "1.0a",
    });
    return (document?.toJSON() as any) || null;
  }

  async findState(state: string): Promise<OAuth2State | null> {
    const document = await DB.findOne({
      state,
    });
    return (document?.toJSON() as any) || null;
  }
}
