// import { Ward } from '../src/ward.ts';

// let a: { b: number; c: number } | null = { b: 10, c: 200 };

// const ward = new Ward<typeof a>()
//   .name('test')
//   .target.data.variable(a)
//   .time('*/2/*')
//   .onChange((o, n) => console.log('СМЕНА!', o, n))
//   .build();

let ALIEN = { data: 'Hello' };
const weakRef = new WeakRef(ALIEN);

setTimeout(() => {
  ALIEN = null;
}, 1000);

setInterval(() => {
  if (!weakRef.deref()) {
    console.log('Object has been garbage collected');
  }
}, 1000);
