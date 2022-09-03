import { TwitterApi, LoginResult } from "twitter-api-v2";
import path from "path";
import fs from "fs";
import mime from "mime-types";

import config from "@src/config";
import { TwitterLoginStateRepository } from "./repository";
import ImageDownloader from "../media/ImageDownloader";
import { AccountRepository } from "../account/repository";
import { UserRepository } from "../user/repository";

/**
 * The OAuth scope required for each Twitter API endpoint used in the project
 */

interface IOAuth1RequestTokenResult {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_callback_confirmed: "true";
  url: string;
}

// If upload directory does not exist, then create it
let uploadDirectory = path.resolve("./uploads");
if (!path.isAbsolute(uploadDirectory)) {
  uploadDirectory = path.join(__dirname, uploadDirectory);
}
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}

export class TwitterOAuth1Service {
  private OAuthClient: TwitterApi;

  constructor(
    private repository: TwitterLoginStateRepository,
    private accountRepository: AccountRepository,
    private userRepository: UserRepository
  ) {
    this.OAuthClient = new TwitterApi({
      appKey: config.twitter.key,
      appSecret: config.twitter.secret,
    });
  }

  async getLoginState(oauth_token: string) {
    return await this.repository.findByOAuthToken(oauth_token);
  }

  async generateAuthLink(callbackUrl?: string) {
    return new Promise<Pick<IOAuth1RequestTokenResult, "url">>(
      async (resolve, reject) => {
        try {
          const response = await this.OAuthClient.generateAuthLink(
            callbackUrl || config.twitter.oauth.callbackUrl,
            { linkMode: "authenticate" }
          );
          // Persist state on database, required for next step
          await this.repository.createState({
            oauth_token: response.oauth_token,
            oauth_token_secret: response.oauth_token_secret,
            url: response.url,
            version: "1.0a",
          });
          resolve({ url: response.url });
        } catch (error) {
          reject(error);
        }
      }
    );
  }

  private async exchangeAuthCodeForToken(
    oauth_token: string,
    oauth_token_secret: string,
    oauth_verifier: string
  ) {
    return new Promise<LoginResult>(async (resolve, reject) => {
      const client = new TwitterApi({
        appKey: config.twitter.key,
        appSecret: config.twitter.secret,
        accessToken: oauth_token,
        accessSecret: oauth_token_secret,
      });

      try {
        const response = await client.login(oauth_verifier);
        resolve(response);
      } catch (error) {
        console.error(`Error requesting accessToken v1 - ${error}`);
        reject(error);
      }
    });
  }

  async login(
    oauth_token: string,
    oauth_token_secret: string,
    oauth_verifier: string
  ) {
    const twitterLoginResponse = await this.exchangeAuthCodeForToken(
      oauth_token,
      oauth_token_secret,
      oauth_verifier
    );

    // TODO: The application require more privileges to access Twitter profile information
    // TODO: You have to request Elevated access in the Twitter Developer Console
    /*try {
    } catch (error) {}
    const userInformation =
      await twitterLoginResponse.client.v1.verifyCredentials({
        include_email: true,
      });*/
    const user = await this.userRepository.upsertUser({
      username: twitterLoginResponse.screenName,
      providerAccountId: twitterLoginResponse.userId,
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
      oauth_token: twitterLoginResponse.accessToken,
      oauth_token_secret: twitterLoginResponse.accessSecret,
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

  /**
   * API REFERENCE: https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/manage-account-settings/api-reference/get-account-verify_credentials
   * @param accessToken
   * @returns
   */
  async getProfileInformation(accessToken: string) {
    const account = await this.accountRepository.findAccountByAccessToken(
      accessToken
    );

    if (!account) {
      throw new Error("Unauthorized. Account not founded");
    }

    const client = new TwitterApi({
      appKey: config.twitter.key,
      appSecret: config.twitter.secret,
      accessToken: account.oauth_token,
      accessSecret: account.oauth_token_secret,
    });

    const userInformation = await client.currentUser();
    const user = await this.userRepository.upsertUser({
      providerAccountId: userInformation.id,
      name: userInformation.name,
      username: userInformation.screen_name,
      email: userInformation.email,
      emailVerified: userInformation.verified,
      image: userInformation.profile_image_url_https,
    });

    /** Check this - from nextauth
     * image: profile.profile_image_url_https.replace(
          /_normal\.(jpg|png|gif)$/,
          ".$1"
        ),
     */

    return {
      user: {
        twitterId: userInformation.id,
        name: userInformation.name,
        username: userInformation.screen_name,
        email: userInformation.email,
        emailVerified: userInformation.verified,
        image: userInformation.profile_image_url_https,
      },
    };
  }

  /**
   * Creates a tweet with message and image if required.
   * API REFERENCE: https://developer.twitter.com/en/docs/twitter-api/v1/tweets/post-and-engage/api-reference/post-statuses-update
   */
  async tweet(accessToken: string, message: string, imageUrl?: string) {
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

    let imageMediaId = "";
    if (imageUrl) {
      imageMediaId = await this.uploadImage(client, imageUrl);
    }

    try {
      const createdTweet = await client.v1.tweet(message, {
        media_ids: [imageMediaId],
      });
      return {
        tweetId: createdTweet.id,
        tweetText: createdTweet.text,
      };
    } catch (error) {
      console.error("Error creating tweet", error);
      throw new Error(`Internal Server Error. Error creating tweet: ${error}`);
    }
  }

  private async uploadImage(client: TwitterApi, imageUrl: string) {
    const tempFileName = new Date().getTime().toString();
    let imageDownloadedFilePath = "";
    // Download the image to a temporal file in disk
    try {
      const response = await ImageDownloader.downloadImage(
        imageUrl,
        uploadDirectory,
        tempFileName,
        {}
      );
      imageDownloadedFilePath = response.filename;
    } catch (error) {
      console.error(`Error downloading image from url ${imageUrl}`, error);
      throw new Error(
        `Error downloading image from url ${imageUrl}. Error: ${error}`
      );
    }

    const mimeType =
      mime.lookup(path.extname(imageDownloadedFilePath)) || undefined;

    let mediaId: string = "";
    try {
      mediaId = await client.v1.uploadMedia(imageDownloadedFilePath, {
        mimeType: mimeType,
        target: "tweet",
      });
    } catch (error) {
      console.error("Error uploading image to Twitter", error);
      throw new Error(
        `Error uploading image from url ${imageUrl} to Twitter. Error: ${error}`
      );
    } finally {
      if (imageDownloadedFilePath) {
        fs.unlink(imageDownloadedFilePath, (error) => {
          console.error(
            `Error deleting temp file ${imageDownloadedFilePath}`,
            error
          );
        });
      }
    }

    return mediaId;
  }

  /**
   * API REFERENCE: https://developer.twitter.com/en/docs/authentication/api-reference/invalidate_access_token
   */
  async invalidateToken() {}
}
