import "fastrx";

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
