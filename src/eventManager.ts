export class EventManager {
  private eventListeners: Record<string, Function[]> = {};

  public subscribe(eventName: string, callback: Function) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }

  public dispatch(eventName: string, data?: any) {
    const callbacks = this.eventListeners[eventName];
    if (callbacks) {
      for (const callback of callbacks) {
        callback(data);
      }
    }
  }
}
