import { Ward } from '../src/ward.ts';

interface A {
  a: number;
  b: number;
}

const ward = new Ward<A>()
  .name('notion')
  .target.data.remote(() => Promise.resolve<A>({ a: 10, b: 20 }))
  .time('*/1/*')
  .onChange((o, n) => console.log(o, n))
  .build();

console.log(ward);
