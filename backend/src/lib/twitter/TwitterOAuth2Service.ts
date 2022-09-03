import {
  TwitterApi,
  TOAuth2Scope,
  IOAuth2RequestTokenResult,
  IParsedOAuth2TokenResult,
} from "twitter-api-v2";
import path from "path";
import fs from "fs";

import config from "@src/config";
import { TwitterLoginStateRepository } from "./repository";
import { AccountRepository } from "../account/repository";
import { UserRepository } from "../user/repository";

/**
 * The OAuth scope required for each Twitter API endpoint used in the project
 */

type ENDPOINTS = "tweet";
const TwitterScopeTypes = [
  "tweet.read",
  "tweet.write",
  "tweet.moderate.write",
  "users.read",
  "follows.read",
  "follows.write",
  "offline.access",
  "space.read",
  "mute.read",
  "mute.write",
  "like.read",
  "like.write",
  "list.read",
  "list.write",
  "block.read",
  "block.write",
  "bookmark.read",
  "bookmark.write",
];

export const scopesAreValid = (scopes: string[]) => {
  if (scopes.length === 0) return false;
  for (let scope of scopes) {
    if (!TwitterScopeTypes.includes(scope)) {
      return false;
    }
  }
  return true;
};

export const ENDPOINT_SCOPES: Record<ENDPOINTS, TOAuth2Scope[]> = {
  tweet: ["tweet.read", "tweet.write", "users.read"],
};

// If upload directory does not exist, then create it
let uploadDirectory = path.resolve("./uploads");
if (!path.isAbsolute(uploadDirectory)) {
  uploadDirectory = path.join(__dirname, uploadDirectory);
}
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}
export class TwitterOAuth2Service {
  private OAuthClient: TwitterApi;
  constructor(
    private repository: TwitterLoginStateRepository,
    private accountRepository: AccountRepository,
    private userRepository: UserRepository
  ) {
    this.OAuthClient = new TwitterApi({
      clientId: config.twitter.oauth.clientId,
      clientSecret: config.twitter.oauth.secret,
    });
  }

  async getLoginState(state: string) {
    return await this.repository.findState(state);
  }

  async generateAuthLink(scope: TOAuth2Scope[], callbackUrl?: string) {
    return new Promise<IOAuth2RequestTokenResult>(async (resolve, reject) => {
      try {
        const response = this.OAuthClient.generateOAuth2AuthLink(
          callbackUrl || config.twitter.oauth.callbackUrl,
          {
            scope,
          }
        );
        // Persist state on database, required for next step
        await this.repository.createState({
          url: response.url,
          version: "2",
          state: response.state,
          codeChallenge: response.codeChallenge,
          codeVerifier: response.codeVerifier,
        });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  async login(code: string, codeVerifier: string) {
    const twitterLoginResponse = await this.exchangeAuthCodeForToken(
      code,
      codeVerifier
    );

    // TODO: The application require more privileges to access Twitter profile information
    // TODO: You have to request Elevated access in the Twitter Developer Console
    const userInformation = await twitterLoginResponse.client.currentUserV2();
    const user = await this.userRepository.upsertUser({
      username: userInformation.data.username,
      providerAccountId: userInformation.data.id,
      /*name: userInformation.name,
      email: userInformation.email,
      emailVerified: userInformation.verified,
      image: userInformation.profile_image_url_https,*/
    });

    // As this application is specific for Twitter use, user can only have one OAuth account
    // So we upsert the information
    const account = await this.accountRepository.upsertAccount({
      userId: user._id,
      providerAccountId: user.providerAccountId,
      access_token: twitterLoginResponse.accessToken,
      refresh_token: twitterLoginResponse.refreshToken,
      provider: "twitter",
      /*expires_at: "", // This token does not expires until invalidation
      token_type: "",
      type: "",
      scope: "",
      id_token: "",*/
    });

    return {
      accessToken: twitterLoginResponse.accessToken,
      user: {
        twitterId: user.providerAccountId,
        username: user.username,
        /*name: userInformation.name,
        email: userInformation.email,
        emailVerified: userInformation.verified,
        image: userInformation.profile_image_url_https,*/
      },
    };
  }

  private async exchangeAuthCodeForToken(code: string, codeVerifier: string) {
    return new Promise<IParsedOAuth2TokenResult>((resolve, reject) => {
      try {
        const response = this.OAuthClient.loginWithOAuth2({
          code,
          codeVerifier,
          redirectUri: config.twitter.oauth.callbackUrl,
        });
        resolve(response);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * API REFERENCE: https://developer.twitter.com/en/docs/twitter-api/tweets/manage-tweets/api-reference/post-tweets
   * SCOPE REQUIRED:
   * - tweet.read
   * - tweet.write
   *-  users.read
   */
  async tweet(accessToken: string, message: string, imageMediaId?: string) {
    const client = new TwitterApi({
      appKey: config.twitter.key,
      appSecret: config.twitter.secret,
      accessToken: accessToken,
    });

    try {
      const { data: createdTweet } = await client.v2.tweet(message, {
        text: message,
        media: {
          media_ids: imageMediaId ? [imageMediaId] : undefined,
        },
      });
      return {
        tweetId: createdTweet.id,
        tweetText: createdTweet.text,
      };
    } catch (error) {
      console.error(`Error creating tweet with API V2 - ${error}`);
      throw error;
    }
  }

  /*async invalidateToken(accessToken: string) {
    const account = await this.accountRepository.findAccountByAccessToken(
      accessToken
    );

    if (!account) {
      throw new Error("Unauthorized. Account not founded");
    }

    // Instantiate twitter client instance for this specific user
    const client = new TwitterApi({
      appKey: config.twitter.key,
      appSecret: config.twitter.secret,
      accessToken: account.oauth_token,
      accessSecret: account.oauth_token_secret,
    });

    await client.revokeOAuth2Token(accessToken);
    return true;
  }*/
}
