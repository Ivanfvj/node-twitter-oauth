# Node.js service for sending tweets with text and image

Backend service and frontend demo application to send tweets with text and image using Twitter API V1. Implemented endpoints for handling OAuth 1.0a and OAuth 2 Authentication flows.

**Backend:** Node.js + Typescript + Express.js + MongoDB.

**Frontend:** Vue2 + Vite + TailwindCSS.

Docker and docker-compose used for running the backend service on dev environment.

```bash
# Clone repository on your machine
git clone https://github.com/Ivanfvj/node-twitter-oauth.git
```

## Project structure

**Backend:** Node.js service to communicate with the Twitter API and store session data.

**Frontend:** Vue2 project with demo showcase.

## Information

You need to create a developer account on [Twitter](https://developer.twitter.com/en) and request [Elevated Access](https://developer.twitter.com/en/portal/petition/standard/basic-info) for your project.

**IMPORTANT:**

Twitter allows you to upload media using the OAuth 1.0a authentication flow and Twitter V1 api. (You cannot upload media with the OAuth 2 and V2 API yet. Most of the endpoints are in BETA)
[Twitter Upload media endpoint](https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload).

You can use either the V1 or V2 Twitter API to create a tweet and attach the mediaId generated using the endpoint above.

To accomplish our goal we have to use the OAuth 1.0a flow so we can upload media and send a tweet using the same accessToken and session created by the user. (Most of the applications use Twitter OAuth 1.0a for this reasons, as V2 is in BETA)

## Steps to reproduce in Twitter Developer Portal

1. Create your developer account on the [Twitter Developer Portal](https://developer.twitter.com/en).
2. Twitter gives you 3 keys: **CONSUMER_KEY, CONSUMER_SECRET** and **CONSUMER_BEARER_TOKEN**. Save them in a secure place, we will use them later.
3. Create a project and app following twitter guided tour.
4. Select your application and **Enable User authentication settings**. Select "Read and write and Direct message permissions", and activate the "Request email from users" option. In the section below "Type of App" select the "Web App, Automated App or Bot" option. Complete the App info section (for testing you can use ngrok to generate an HTTPS reverse proxy to your localhost application)
5. Save the **APP_CLIENT_ID** and **APP_CLIENT_SECRET** keys in a secure place. We will use them later.

## OAuth flow

1. Frontend request a loginUrl from backend. (When page loads TwitterLoginButton component, on mount lifecycle).
2. User click the TwitterLoginButton and is redirected to the loginUrl from the step above. Twitter Authentication page is opened and user accept the permissions requested by our application to authenticate. (OAuth 1.0a don't have a specific scope, so the user accept all the permissions)
3. User is redirected to our **callbackUrl** configured in our Application in the Twitter Developer Portal (Project page section "User authentication settings").
4. The callbackUrl is our **/callback** page url (on the frontend app). User is redirected to our frontend application page where we process the request extracting the query params. OAuth 1.0a send the **oauth_token** and **oauth_verifier** codes.
5. Immediately our application sends a POST request to our backend service with the **oauth_token** and **oauth_verifier** codes to login and exchange the data for a **Twitter accessToken**.
6. Backend communicates with the Twitter API and send back to the frontend the accessToken and user profile information.
7. User is logged in and stores the accessToken in localStorage, sessionStorage or any preference you decide.

**NOTE:** The backend is sending the twitter accessToken (oauth_token) to the client and it's secure because the twitter API requires the accessTokenSecret (oauth_token_secret) to authenticate a request. The **oauth_token_secret** is stored in MongoDB and it's only available on the backend service. More information on [Twitter Authentication best practices here](https://developer.twitter.com/en/docs/authentication/guides/authentication-best-practices).

**NOTE:** You can integrate your own authorization flow wih any user/authentication service in your company/databases and generate a custom JWT with user identifier if you don't want to share the user Twitter accessToken with the frontend.

## Test the application

### IMPORTANT

HTTPS website URL is required for testing the Twitter API.
You can create an HTTPS reverse proxy for your localhost app using [ngrok](https://ngrok.com/).

Then you need to update the Callback URI and Website URL on the [Twitter Developer Portal](https://developer.twitter.com/en).
**REMEMBER** to update the **TWITTER_OAUTH_CALLBACK_URL** env variable on the backend project.

## RUN THE CODE

**Please read the important note above**. You have to configure your app on the [Twitter Developer Portal](https://developer.twitter.com/en) before running the code.

### Environment Variables

Backend require environment variables.

Create an .env file on the backend folder and add your **Twitter tokens and MongoDB credentials**.

If you don't have a MongoDB instance on your machine you can use docker to run a MongoDB container.

<u>(instructions bellow)</u>

```bash
# Application port
APP_PORT=4000
# Application domain
APP_DOMAIN=localhost
# Enable cors by default
ENABLE_CORS=true

# MongoDB configuration - you can set up a MONGO_URI or independent params
MONGO_URI=mongodb://root:password@localhost:27017/twitter_service?authsource=admin

# Optional if MONGO_URI is not set
MONGO_HOST=localhost
MONGO_PORT=27018
MONGO_DB_NAME=twitter_service
MONGO_DB_USER=root
MONGO_DB_PASSWORD=password

# Twitter application keys
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=

# Optional - not required for this usecase
TWITTER_CONSUMER_BEARER_TOKEN=

# Twitter OAuth Client
TWITTER_OAUTH_CLIENT_ID=
TWITTER_OAUTH_CLIENT_SECRET=
# Our frontend demo callback page is on /callback route
# If you use ngrok for testing remember adding the complete route: https://970f-190-12-13-17.ngrok.io/callback
TWITTER_OAUTH_CALLBACK_URL=

```

### Run the backend

You can use docker and docker-compose to run a MongoDB container in your localhost or dev environment.

If you don't have docker installed on your computer you can consider connecting to a MongoDB database using a MONGO_URI or using MongoDB Atlas.

```bash
# Navigate to the backend directory (backend folder)
cd ./backend

# Run an instance of mongo container
docker-compose up -d mongo
```

Now, after configuring your .env file and having a MongoDB instance up and running, you can start the backend service.


```bash
# Navigate to the backend directory (backend folder)
cd ./backend

# Install dependencies
npm run install

# Run the code
npm run dev
```

### Run the frontend

```bash
# Navigate to the frontend directory (frontend folder)
cd ./frontend

# Install dependencies
npm run install

# Run the code
npm run dev
```

### Build backend for production

```bash
# Navigate to the backend directory (backend folder)
cd ./backend

# Install dependencies
npm run install

# Run the code
npm run build

# The project is built on the dist directory
```

## How the backend service works?

### Endpoints available

| **Endpoint** | **Description** |
|---|---|
| `GET /user` | Get twitter profile data. Needs Authorization Header with Bearer token: `Authorization: Bearer token_here` |

#### OAuth1 Endpoints (Twitter API V1)

| **Endpoint** | **Description** |
|---|---|
| `POST /oauth1/link` | Generates login URL for OAuth 1.0a flow with callbackUrl from environment variable as parameter. |
| `POST /oauth1/callback` | Receives oauth_code and oauth_code_verifier from frontend callback page, validate the data and generates accessTokens. The user logs in. |
| `POST /tweet` | Create a tweet with text and image using the Twitter API V1.1. (Requires login and accessToken) |
| `POST /logout` | Logout the user and remove the user data from the accounts collection in MongoDB. |

#### OAuth2 Endpoints (Twitter API V2)

| **Endpoint** | **Description** |
|---|---|
| `POST /oauth2/link` | Generates login URL for OAuth 1.0a flow with callbackUrl from environment variable as parameter. |
| `POST /oauth2/callback` | Receives state and code from frontend callback page, validate the data and generates accessTokens. The user logs in. |

### Image download/upload

We handle file download from **HTTP and HTTPS** urls to upload the media to Twitter. Local disk storage is used as read/write stream, the file is deleted after uploaded using the Twitter API. [Best practices for Twitter uploading media here](https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/uploading-media/media-best-practices).

### MongoDB

We use MongoDB to store OAuth data and user data.

Twitter Login State is saved on **twitter_oauth_states** collection and has a TTL expire index to automatically delete documents after 30 minutes. (See twitter-oauth.ts file)

## Reference links

### Twitter documentation

- [Twitter OAuth 2.0 Authorization Code Flow with PKCE](https://developer.twitter.com/en/docs/authentication/oauth-2-0/user-access-token)
- [Twitter OAuth 1.0a documentation](https://developer.twitter.com/en/docs/authentication/oauth-1-0a)
- [Twitter API rate limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits)
- [Twitter Upload media endpoint](https://developer.twitter.com/en/docs/twitter-api/v1/media/upload-media/api-reference/post-media-upload)
- [Twitter Developer Dashboard](https://developer.twitter.com/en/portal/dashboard)
- [Twitter Access levels and versions](https://developer.twitter.com/en/docs/twitter-api/getting-started/about-twitter-api#v2-access-leve)

### Helpful Libraries

- [Node.js Twitter API client --> twitter-api-v2 library](https://github.com/PLhery/node-twitter-api-v2)
- [Twitter token refresher plugin](https://www.npmjs.com/package/@twitter-api-v2/plugin-token-refresher)
- [Official Twitter API Typescript SDK (BETA)](https://github.com/twitterdev/twitter-api-typescript-sdk)
- [Hello.js - A client-side Javascript SDK for authenticating with OAuth2 and OAuth1](https://adodson.com/hello.js/)
- [Auth0 SDK for Single Page Applications using Authorization Code Grant Flow with PKCE](https://github.com/auth0/auth0-spa-js)
- [Passport Twitter - OAuth 1.0a API](https://github.com/jaredhanson/passport-twitter)

### Sample projects

- [Vue2 implementation tutorial with Hello.js for Twitter OAuth 1.0 login](https://developpaper.com/vue-js-implementation-of-twitter-third-party-login-api-in/)
- [vue-authenticate library for social login and OAuth providers](https://github.com/dgrubelic/vue-authenticate)
- [Vue2 Popup Window for Authentication and Authorization](https://github.com/oarepo/vue-popup-login/tree/2.x)
- [Nuxt.js Twitter OAuth 1.0a API with Node/Express/Passport backend](https://github.com/ichiwa/nuxt-twitter-auth)

## Extras

You can revoke application access [here](https://twitter.com/settings/connected_apps).
