import "fastrx";
import "express";

declare module "fastrx" {
  namespace Rx {
    export interface Observable {
      subscribe(
        n: (d: any) => void,
        e?: (d: Error) => void,
        c?: () => void
      ): Sink;
    }
  }
}

declare global {
  export module Express {
    export interface User {
      _id: string;
      name: string;
      password: string;
      email: string;
      cardIds: string[];
      rewardPoints: number;
      categoryTags: { [key: string]: string[] };
      conDays: number;
      lastLogin: Date;
    }

    export interface Request {
      body_origin?: any;
      params_origin?: any;
      query_origin?: any;

      convert_from_body?: any;
      convert_from_query?: any;
      convert_from_params?: any;
    }

    export interface Response {
      sse?: SSE;
    }
  }
}
