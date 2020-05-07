import { Collection } from "mongodb";
import {Handler} from 'express';

declare global {
  module Express {
    interface Request {
      userId?: string;
    }
  }
}

declare function loginCheck(coll: Collection): Handler;

export = loginCheck;
