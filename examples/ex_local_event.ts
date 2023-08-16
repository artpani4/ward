import { EventManager } from '../src/eventManager.ts';
import { Ward, WardEventData } from '../src/ward.ts';

const ward = new Ward<string>()
  .name('test')
  .target.file.local('examples/localFile.txt')
  .time('*/*/500')
  .ifChangedThen.emitEvent('ololo')
  .build();

Ward.eventManager.subscribe(
  ward.event,
  (data: WardEventData) => console.log(data.old, data.new),
);
ward.start();
