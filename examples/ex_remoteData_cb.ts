// import {
//   getNotionSimpleTextBlock,
// } from '../src/integrations/notion/funcs.ts';
// import { TextBlockSimple } from '../src/integrations/notion/schema.ts';
// import { Ward, WardEventData } from '../src/ward.ts';

// const ward = new Ward<TextBlockSimple>()
//   .name('test')
//   .target.data.remote(() =>
//     getNotionSimpleTextBlock(
//       'https://www.notion.so/artpani/d1ecc246b8304e08a780b9a312548064?pvs=4#22931087a1f64dac9779a35127496c2a',
//     )
//   )
//   .time('*/3/500')
//   .ifChangedThen.emitEvent('ololo')
//   .build();

// //Где-то в другом участке кода
// Ward.eventManager.subscribe(
//   ward.event,
//   (data: WardEventData) => {
//     const newData = data.new as TextBlockSimple;
//     console.log(newData.paragraph.rich_text[0].plain_text);
//   },
// );
// ward.start();
