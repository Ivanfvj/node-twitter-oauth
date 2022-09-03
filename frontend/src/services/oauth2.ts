import { API_ENDPOINT } from "../config";

// If you need to consume the OAuth2 endpoints you can use this methods
type TwitterLoginUrlResponse = {
  url: string;
  codeVerifier: string;
  state: string;
};

type TwitterLoginResponse = {
  accessToken: string;
  expiresIn: number;
  scope: string[];
};

export async function requestTwitterLoginUrl(
  scope: string[]
): Promise<TwitterLoginUrlResponse> {
  if (!scope || !Array.isArray(scope) || scope.length === 0) {
    throw new Error("scope malformated on client request");
  }

  return new Promise((resolve, reject) => {
    const data = {
      scope,
    };

    fetch(`${API_ENDPOINT}/oauth2/link`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then((data) => resolve(data as TwitterLoginUrlResponse))
      .catch((error) => {
        reject(error);
      });
  });
}

export async function generateAccessTokenAndLogin(
  code: string,
  state: string
): Promise<TwitterLoginResponse> {
  if (!code) {
    throw new Error("Twitter auth code required");
  }
  if (!state) {
    throw new Error("Twitter auth state required");
  }
  return new Promise((resolve, reject) => {
    const data = {
      code,
      state,
    };

    fetch(`${API_ENDPOINT}/oauth2/callback`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "content-type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then((data) => resolve(data as TwitterLoginResponse))
      .catch((error) => {
        reject(error);
      });
  });
}

export default {
  requestTwitterLoginUrl,
  generateAccessTokenAndLogin,
};
