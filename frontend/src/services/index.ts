import twitterOAuth1Service from "./oauth1";
// WARNING: Twitter OAuth2 is in Beta, user can login but can not upload media (images|video) with this API version
import twitterOAuth2Service from "./oauth2";

const api = {
  twitter: twitterOAuth1Service,
  twitterV2: twitterOAuth2Service,
} as const;

export default api;
