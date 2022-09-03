import { Router } from "express";

import { asyncHandler } from "@src/utils";
import Controller from "./controller";
import { TwitterOAuth2Service } from "./TwitterOAuth2Service";
import { TwitterOAuth1Service } from "./TwitterOAuth1Service";
import { TwitterLoginStateRepository } from "./repository";
import { AccountRepository } from "../account/repository";
import { UserRepository } from "../user/repository";

const router = Router();

// Initialize repositories, controller and service
const loginStateRepository = new TwitterLoginStateRepository();
const accountRepository = new AccountRepository();
const userRepository = new UserRepository();
const controller = new Controller(
  new TwitterOAuth1Service(
    loginStateRepository,
    accountRepository,
    userRepository
  ),
  new TwitterOAuth2Service(
    loginStateRepository,
    accountRepository,
    userRepository
  )
);

router.get("/user", asyncHandler(controller.getUserData));

router.post("/oauth1/link", asyncHandler(controller.generateAuthLinkV1));
router.post("/oauth1/callback", asyncHandler(controller.getAuthTokenV1));

router.post("/oauth2/link", asyncHandler(controller.generateAuthLinkV2));
router.post("/oauth2/callback", asyncHandler(controller.getAuthTokenV2));

router.post("/tweet", asyncHandler(controller.tweet));
router.post("/logout", asyncHandler(controller.logout));

// TODO: Validate current token/session
//router.get("/token-validate", asyncHandler(controller.generateAuthLinkV2));

// TODO: Revoke auth token for V2. V1 doesn't require
//router.get("/revoke", asyncHandler(controller.generateAuthLinkV2));

export default router;
