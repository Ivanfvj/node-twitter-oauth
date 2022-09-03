import { Request, Response, NextFunction } from "express";
import util from "util";

/**
 * Allows to pass context (this) of the function to the express native function
 * @param fn
 */
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export const prettyPrintResponse = (response: any) => {
  console.log(util.inspect(response.data, { colors: true, depth: 4 }));
};

export function getBearerTokenFromRequest(req: Request) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    return req.headers.authorization.split(" ")[1] as string;
  } else if (req.query && req.query.token) {
    return req.query.token as string;
  } else {
    return null;
  }
}
