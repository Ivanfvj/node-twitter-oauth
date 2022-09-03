# Node.js backend service for managing Twitter OAuth2.0 Authentication 

Created with Typescript/Express.js and MongoDB for storing tokens and session data.

HTTPS website URL is required for testing Twitter API
You can create an HTTPS reverse proxy for your localhost app using [ngrok](https://ngrok.com/).


Twitter Login State is saved on twitter_oauth_state collection and has a TTL expire index to automatically delete documents after 30 minutes.

## REFERENCE LINKS

- [Twitter OAuth 2.0 Authorization Code Flow with PKCE](https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token)
- [Twitter OAuth 1.0a documentation](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Twitter API rate limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)
- [Twitter Upload media endpoint](https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload)
- [Twitter token refresher plugin](https://www.npmjs.com/package/@twitter-api-v2/plugin-token-refresher)
- [Twitter Developer Dashboard](https://developer.twitter.com/en/portal/dashboard)
- [Twitter Access levels and versions](https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api#v2-access-leve)

- [Official Twitter API Typescript SDK (BETA)](https://github.com/twitterdev/twitter-api-typescript-sdk)
- [Hello.js - A client-side Javascript SDK for authenticating with OAuth2 and OAuth1](https://adodson.com/hello.js/)
- [Auth0 SDK for Single Page Applications using Authorization Code Grant Flow with PKCE](https://github.com/auth0/auth0-spa-js)
  
- [Passport Twitter - OAuth 1.0a API](https://github.com/jaredhanson/passport-twitter)
- [Vue2 implementation tutorial with Hello.js for Twitter OAuth 1.0 login](https://developpaper.com/vue-js-implementation-of-twitter-third-party-login-api-in/)
- [vue-authenticate library for social login and OAuth providers](https://github.com/dgrubelic/vue-authenticate)
- [Vue2 Popup Window for Authentication and Authorization](https://github.com/oarepo/vue-popup-login/tree/2.x)
- [Nuxt.js Twitter OAuth 1.0a API with Node/Express/Passport backend](https://github.com/ichiwa/nuxt-twitter-auth)
