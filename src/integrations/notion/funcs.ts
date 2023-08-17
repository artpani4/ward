import Client from 'https://deno.land/x/notion_sdk@v2.2.3/src/Client.ts';
import Tuner from 'https://deno.land/x/tuner@v0.1.0/mod.ts';
import { TextBlockSimple } from './schema.ts';

export async function getNotionBlock(blockUrl: string) {
  try {
    const notion = new Client({
      auth: Tuner.getEnv('NOTION_KEY'),
    });
    const blockId = getBlockIdByURL(blockUrl);
    if (blockId === null) throw new Error('Invalid block');
    const response = await notion.blocks.retrieve({
      block_id: blockId,
    });
    return response;
  } catch (error) {
    console.error(
      'Error occurred while fetching file from Notion:',
      error,
    );
    throw error;
  }
}

function getBlockIdByURL(url: string): string | null {
  const match = url.match(/#([\w-]+)$/);
  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

export async function getNotionSimpleTextBlock(url: string) {
  return await getNotionBlock(url) as TextBlockSimple;
}
