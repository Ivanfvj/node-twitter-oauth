# Frontend Demo for creating tweets with image

## Vue 2 + Vite + TailwindCSS

Vue2 application to handle OAuth flow and authenticate a user with Twitter.
TwitterLogin button component and callback page.

**OAuth flow:**

1. Frontend request a loginUrl from backend. (When page loads TwitterLoginButton component, on mount lifecycle).
2. User click the TwitterLoginButton and is redirected to the loginUrl from the step above. Twitter Authentication page is opened and user accept the permissions requested by our application to authenticate. (OAuth 1.0a don't have a specific scope, so user accept all the permissions)
3. User is redirected to our **callbackUrl** configured on our Application in the Twitter Developer Portal (Project page section "User authentication settings").
4. The callbackUrl is our callback page url. User is redirected to our frontend application page where we process the request extracting the query params. OAuth 1.0a send the **oauth_token** and **oauth_verifier** codes.
5. Immediately our application sends a POST request to our backend service with the **oauth_token** and **oauth_verifier** codes to login and exchange the data for a **Twitter accessToken**.
6. Backend communicates with the Twitter API and send back to the frontend the accessToken and user profile information.
7. User is logged in and stores the accessToken in localStorage, sessionStorage or any preference you decide.

**NOTE:** The backend is sending the twitter accessToken (oauth_token) to the client and it's secure because the twitter API requires the accessTokenSecret (oauth_token_secret) to authenticate a request. The oauth_token_secret is stored in MongoDB and it's only available on the backend service.

**NOTE:** You can integrate your own authorization flow wih any user/authentication service in your company/databases and generate a custom JWT with user identifier if you don't want to share the user Twitter accessToken with the frontend.

## Run the code

```bash
# Go to this directory (frontend folder)
cd ./frontend

# Install dependencies
npm run install

# Run the code
npm run dev
```