import { Collection } from "mongodb";
import { RequestHandler, Request } from "express";

declare module "express" {
  interface Request {
    userId: string;
  }
}

function loginCheck(coll: Collection): RequestHandler;

export = loginCheck;
