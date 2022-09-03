import { prettyPrintResponse } from "@src/utils";
import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: any,
  request: Request,
  response: Response,
  next: NextFunction
) {
  prettyPrintResponse(error);
  response.status(500).json(formatError(error));
}

const formatError = (error: any) => {
  return {
    error: { ...error.data, status_code: error.status },
  };
};
