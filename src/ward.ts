import { InvalidPeriodFormat, NonComparableItems } from './errors.ts';
import { EventManager } from './eventManager.ts';
type TargetType =
  | 'localFile'
  | 'remoteFile'
  | 'variable'
  | 'remoteData';

type remoteCb<T> = () => Promise<T>;
export interface WardEventData {
  old: object | string;
  new: object | string;
  counter: number;
  timeOfLastChange: number;
  title: string;
}

export class Ward<T extends Object = {}> {
  private title = '';
  private period = '*/*/*';
  private timeoutId = 0;
  private localPath = '';
  private lastChangeDetectedTimestamp = 0;
  private typeData: TargetType = 'variable';
  private counter = 0;
  private conditionToStop: (
    data: WardEventData,
  ) => boolean = () => false;

  private lastMemo: T | string | null = null;
  private dataCb: remoteCb<T> | null = null;

  static eventManager = new EventManager();

  private handler: (
    oldValue: T | string,
    newValue: T | string,
  ) => void = () => {};

  public event = '';

  // private watchedObjectRef: WeakRef<T> | null = null;

  name(title: string) {
    this.title = title;
    return this;
  }

  public static on(
    eventName: string,
    callback: (data: WardEventData) => void,
  ) {
    globalThis.addEventListener(eventName, (e) => {
      callback((e as CustomEvent).detail); // Передача данных из события в колбэк
    });
  }

  public static journal(data: WardEventData) {
    return `${data.title}:
    Current counter: ${data.counter}
    Time of last change: ${data.timeOfLastChange} (${
      new Date(data.timeOfLastChange).toLocaleString()
    })
    Old: ${data.old}
    New: ${data.new}`;
  }

  public target = {
    file: {
      local: (path: string) => {
        this.localPath = path;
        this.typeData = 'localFile';
        return this;
      },
      remote: async (cb: () => Promise<string>) => Promise<this>,
    },
    data: {
      // variable: (variable: T) => {
      //   this.watchedObjectRef = new WeakRef(variable);
      //   this.objLastMemo = this.deepCopy(variable);
      //   this.typeData = 'variable';
      //   return this;
      // },
      remote: (cb: () => Promise<T>) => {
        this.dataCb = cb;
        this.typeData = 'remoteData';
        return this;
      },
    },
  };

  time(period: string) {
    this.period = period;
    return this;
  }

  public build() {
    return this;
  }

  public ifChangedThen = {
    runCallback: (
      callback: (oldValue: T | string, newValue: T | string) => void,
    ) => {
      this.handler = callback;
      return this;
    },
    emitEvent: (eventName: string) => {
      this.event = eventName;
      this.handler = (oldValue: T | string, newValue: T | string) => {
        Ward.eventManager.dispatch(eventName, {
          old: oldValue,
          new: newValue,
          counter: this.counter,
          timeOfLastChange: this.lastChangeDetectedTimestamp,
          title: this.title,
        });
      };
      return this;
    },
  };

  public stopIf = {
    condition: (
      predicate: (
        data: WardEventData,
      ) => boolean,
    ) => {
      this.conditionToStop = predicate;
      return this;
    },
    eventTriggered: (eventName: string) => {
      Ward.eventManager.subscribe(
        eventName,
        (data: WardEventData) => {
          this.stop();
        },
      );
      return this;
    },
  };

  async grab() {
    switch (this.typeData) {
      case 'remoteData':
        return await this.dataCb!();
      case 'localFile':
        return await Deno.readTextFile(this.localPath);
      // case 'variable':
      //   return this.watchedObjectRef?.deref() as T;
      default:
        return {} as T;
    }
  }

  deepCopy(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj);
    }

    if (obj instanceof Array) {
      const copy = [];
      for (const item of obj) {
        copy.push(this.deepCopy(item));
      }
      return copy;
    }

    if (obj instanceof Object) {
      const copy: Record<string, any> = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = this.deepCopy(obj[key]);
        }
      }
      return copy;
    }

    throw new Error('Unable to copy object.');
  }

  deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) {
      return true;
    }

    if (
      typeof obj1 !== typeof obj2 || typeof obj1 !== 'object' ||
      obj1 === null || obj2 === null
    ) {
      return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key)) {
        return false;
      }

      if (!this.deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }

    return true;
  }

  equal(a: object | string, b: object | string): boolean {
    if (typeof a == 'object' && typeof b == 'object') {
      return this.deepEqual(a, b);
    }
    if (typeof a == 'string' && typeof b == 'string') {
      return a == b;
    }
    throw new NonComparableItems(a, b);
  }

  copy(target: object | string): object | string {
    return typeof target == 'object' ? this.deepCopy(target) : target;
  }

  async start() {
    if (this.lastMemo === null) {
      this.lastMemo = await this.grab();
    }
    const milliseconds = this.parseMilliseconds();
    this.timeoutId = setInterval(async () => {
      const newData = await this.grab();
      if (
        this.conditionToStop({
          old: this.lastMemo!,
          new: newData,
          counter: this.counter,
          timeOfLastChange: this.lastChangeDetectedTimestamp,
          title: this.title,
        })
      ) {
        this.stop();
        return;
      }
      if (!this.equal(newData, this.lastMemo!)) {
        this.handler(this.lastMemo!, newData);
        this.lastMemo = this.copy(newData) as typeof newData;
        this.counter++;
        this.lastChangeDetectedTimestamp = Date.now();
      }
    }, milliseconds);
  }

  stop() {
    console.log(`Ward ${this.title} stopped`);
    clearInterval(this.timeoutId);
  }

  private parseMilliseconds() {
    const stringTimes = this.period.split('/');
    if (stringTimes.length !== 3) {
      throw new InvalidPeriodFormat();
    }
    const [minutes, seconds, milliseconds] = stringTimes
      .map((part) => part === '*' ? 0 : parseInt(part, 10));
    if (milliseconds == 0 && minutes == 0 && seconds == 0) {
      return 5000;
    }
    const totalMilliseconds = (minutes * 60 * 1000) +
      (seconds * 1000) + milliseconds;
    return totalMilliseconds;
  }
}
