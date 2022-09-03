import { API_ENDPOINT } from "../config";
import { TwitterUserData } from "../utils";

type TwitterLoginUrlResponse = {
  url: string;
};

type TwitterLoginResponse = {
  accessToken: string;
  expiresIn: number;
  scope: string[];
};

type CreateTweetResponse = {
  accessToken: string;
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

    fetch(`${API_ENDPOINT}/oauth1/link`, {
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
  oauth_token: string,
  oauth_verifier: string
): Promise<TwitterLoginResponse> {
  if (!oauth_token) {
    throw new Error("Twitter oauth_token required");
  }
  if (!oauth_verifier) {
    throw new Error("Twitter oauth_verifier required");
  }
  return new Promise((resolve, reject) => {
    const data = {
      oauth_token,
      oauth_verifier,
    };

    fetch(`${API_ENDPOINT}/oauth1/callback`, {
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

export async function getUserData(
  accessToken: string
): Promise<TwitterUserData> {
  if (!accessToken) {
    throw new Error("accessToken required");
  }

  return new Promise((resolve, reject) => {
    fetch(`${API_ENDPOINT}/user`, {
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${accessToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then((data) => resolve(data as TwitterUserData))
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Create a tweet
 * @param accessToken
 * @returns
 */
export async function createTweet(
  accessToken: string,
  message: string,
  imageUrl?: string
): Promise<CreateTweetResponse> {
  if (!accessToken) {
    throw new Error("Twitter accessToken required");
  }
  if (!message) {
    throw new Error("Message required");
  }

  return new Promise((resolve, reject) => {
    const data = {
      message,
      imageUrl,
      accessToken,
    };

    fetch(`${API_ENDPOINT}/tweet`, {
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
      .then((data) => resolve(data as CreateTweetResponse))
      .catch((error) => {
        reject(error);
      });
  });
}

export default {
  requestTwitterLoginUrl,
  generateAccessTokenAndLogin,
  createTweet,
};
