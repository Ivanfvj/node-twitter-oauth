import { Request, Response, NextFunction } from "express";
import { TOAuth2Scope } from "twitter-api-v2";
import validator from "validator";

import { TwitterOAuth2Service, scopesAreValid } from "./TwitterOAuth2Service";
import { TwitterOAuth1Service } from "./TwitterOAuth1Service";
import { getBearerTokenFromRequest } from "@src/utils";

export default class TwitterController {
  constructor(
    private oauth1Service: TwitterOAuth1Service,
    private oauth2Service: TwitterOAuth2Service
  ) {}

  getUserData = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = getBearerTokenFromRequest(req);

    if (!accessToken) {
      return res.status(401).send({
        message:
          "Unauthorized: accessToken is required. Twitter login accessToken required",
      });
    }

    const userData = await this.oauth1Service.getProfileInformation(
      accessToken
    );
    return res.status(200).send(userData);
  };

  generateAuthLinkV1 = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const data = await this.oauth1Service.generateAuthLink();

    return res.status(200).send({
      url: data.url,
    });
  };

  getAuthTokenV1 = async (req: Request, res: Response, next: NextFunction) => {
    const { oauth_token, oauth_verifier } = req.body;

    if (!oauth_token || !oauth_verifier) {
      return res
        .status(400)
        .send("You denied the app login or your session expired!");
    }

    // Get login state from db store
    const stateData = await this.oauth1Service.getLoginState(oauth_token);
    if (!stateData) {
      return res
        .status(400)
        .send("Invalid Auth State. Tokens didn't match!. Retry login");
    }

    const { oauth_token_secret } = stateData;

    try {
      const response = await this.oauth1Service.login(
        oauth_token,
        oauth_token_secret!,
        oauth_verifier
      );

      res.status(200).send(response);
    } catch (error: any) {
      console.error("Error requesting access token", error);
      res.status(400).send(error.message);
    }
  };

  /**
   * Create a tweet using Twitter API V1 (OAuth 1.0a)
   * @returns Tweet data: id and message
   */
  tweet = async (req: Request, res: Response, next: NextFunction) => {
    const message = req.body.message as string;
    const imageUrl = req.body.imageUrl as string | undefined;
    const accessToken = req.body.accessToken as string;

    if (!accessToken) {
      return res.status(400).send({
        message:
          "accessToken param is required on body. Twitter login accessToken required",
      });
    }

    if (!message || typeof message !== "string" || message.length === 0) {
      return res
        .status(400)
        .send({ message: "message param is required on body" });
    }

    if (message.length > 280) {
      return res
        .status(400)
        .send({ message: "message length can have a max of 280 characters" });
    }

    if (
      imageUrl &&
      !validator.isURL(imageUrl, { protocols: ["http", "https"] })
    ) {
      return res.status(400).send({ message: "invalid URL for image" });
    }

    const data = await this.oauth1Service.tweet(
      accessToken,
      message,
      imageUrl!
    );
    res.status(200).send(data);
  };

  generateAuthLinkV2 = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const scope = req.body.scope as string[];
    if (!scope || !Array.isArray(scope) || !scopesAreValid(scope)) {
      return res.status(400).send({ message: "scope is invalid" });
    }

    const data = await this.oauth2Service.generateAuthLink(
      scope as TOAuth2Scope[]
    );

    res.status(200).send({
      codeVerifier: data.codeVerifier,
      state: data.state,
      url: data.url,
    });
  };

  getAuthTokenV2 = async (req: Request, res: Response, next: NextFunction) => {
    const { state, code } = req.body;

    // TODO: Check if the user already have a session
    if (!state || !code) {
      return res
        .status(400)
        .send("You denied the app login or your session expired!");
    }

    // Get state from db store
    const stateData = await this.oauth2Service.getLoginState(state);
    if (!stateData) {
      return res
        .status(400)
        .send("Invalid Auth State. Tokens didn't match!. Retry login");
    }

    const { codeVerifier } = stateData;

    try {
      const response = await this.oauth2Service.login(
        code as string,
        codeVerifier!
      );

      res.status(200).send(response);
    } catch (error: any) {
      console.error("Error requesting access token", error);
      res.status(400).send(error.message);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = getBearerTokenFromRequest(req);

    if (!accessToken) {
      return res.status(401).send({
        message:
          "Unauthorized: accessToken is required. Twitter login accessToken required",
      });
    }

    // TODO: Remove accountData

    res.status(200).send(true);
  };
}
