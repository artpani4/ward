import { Ward } from '../src/ward.ts';
const ward = new Ward<string>()
  .name('test')
  .target.file.local('examples/localFile.txt')
  .time('*/2/*')
  .ifChangedThen.runCallback((o, n) => {
    if (n.length < 5) ward.stop();
  })
  .build();

ward.start();
