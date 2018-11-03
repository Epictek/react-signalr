import {HubConnection} from "@aspnet/signalr";

export class ConnectionStub {
  public static create(conn: HubConnection) {
    return new ConnectionStub(conn);
  }
  public startStub: jest.SpyInstance<() => Promise<void>> | null;
  public stopStub: jest.SpyInstance<() => Promise<void>> | null;
  public readonly factory: () => HubConnection;
  private readonly conn: HubConnection;

  private constructor(conn: HubConnection) {
    this.conn = conn;
    this.factory = () => this.conn;
  }

  public stubStart() {
    if (this.startStub) {
      this.startStub.mockRestore();
    }
    this.startStub = jest.spyOn(this.conn, "start");
    return this.startStub;
  }

  public stubStop() {
    if (this.stopStub) {
      this.stopStub.mockRestore();
    }
    this.stopStub = jest.spyOn(this.conn, "stop");
    return this.stopStub;
  }

  public restore() {
    if (this.startStub) {
      this.startStub.mockRestore();
    }
    this.startStub = null;

    if (this.stopStub) {
      this.stopStub.mockRestore();
    }
    this.stopStub = null;
  }
}
