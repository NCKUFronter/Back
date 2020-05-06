import "fastrx";
import "express";

declare module "fastrx" {
  namespace Rx {
    interface Observable {
      subscribe(
        n: (d: any) => void,
        e?: (d: Error) => void,
        c?: () => void
      ): Sink;
    }
  }
}

declare global {
  namespace CategoryDto { }

  module Express {
    interface Request {
      body_origin?: any;
      params_origin?: any;
      query_origin?: any;

      convert_from_body?: any;
      convert_from_query?: any;
      convert_from_params?: any;
    }
  }
}
