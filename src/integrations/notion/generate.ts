import Tuner from 'https://deno.land/x/tuner@v0.1.0/mod.ts';

const a = {
  object: 'block',
  id: '22931087-a1f6-4dac-9779-a35127496c2a',
  parent: {
    type: 'page_id',
    page_id: 'd1ecc246-b830-4e08-a780-b9a312548064',
  },
  created_time: '2023-08-16T15:43:00.000Z',
  last_edited_time: '2023-08-17T09:07:00.000Z',
  created_by: {
    object: 'user',
    id: 'cdd087ab-002f-4bde-a6a2-2ec4c579627d',
  },
  last_edited_by: {
    object: 'user',
    id: '4a7fc252-734c-4703-8cb8-3d555d53a833',
  },
  has_children: false,
  archived: false,
  type: 'paragraph',
  paragraph: {
    rich_text: [
      {
        type: 'text',
        text: { content: 'Какой-то текст ioi kkh', link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: 'default',
        },
        plain_text: 'Какой-то текст ioi kkh',
        href: null,
      },
    ],
    color: 'default',
  },
};
await Tuner.use.generateSchema(
  a,
  'textBlockSimple',
  'src/integrations/notion/schema.ts',
);
