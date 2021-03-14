import Parser from 'rss-parser';

export class RSSSource {
  url: string;

  constructor(url: string) {
    this.url = url;
  }

  static async fetchMetaData(source: RSSSource) {
    const feed = await parseRSS(source.url);
    return feed;
  }
}
export const domParser = new DOMParser();
const CHARSET_RE = /charset=([^()<>@,;:\"/[\]?.=\s]*)/i; //eslint-disable-line
const XML_ENCODING_RE = /^<\?xml.+encoding="(.+)".*?\?>/i;
export async function decodeFetchResponse(response: Response, isHTML = false) {
  const buffer = await response.arrayBuffer();
  let ctype: string | null | undefined | boolean =
    response.headers.has('content-type') && response.headers.get('content-type');
  let charset: '' | null | undefined | false | string =
    ctype && CHARSET_RE.test(ctype) ? CHARSET_RE.exec(ctype)![1] : undefined;
  let content = new TextDecoder(charset).decode(buffer);
  if (charset === undefined) {
    if (isHTML) {
      const dom = domParser.parseFromString(content, 'text/html');
      charset = dom.querySelector('meta[charset]')?.getAttribute('charset')?.toLowerCase();
      if (!charset) {
        ctype = dom.querySelector("meta[http-equiv='Content-Type']")?.getAttribute('content');
        charset = ctype && CHARSET_RE.test(ctype) && CHARSET_RE.exec(ctype)![1].toLowerCase();
      }
    } else {
      charset = XML_ENCODING_RE.test(content) && XML_ENCODING_RE.exec(content)![1].toLowerCase();
    }
    if (charset && charset !== 'utf-8' && charset !== 'utf8') {
      content = new TextDecoder(charset).decode(buffer);
    }
  }
  return content;
}
export async function parseRSS(url: string) {
  let result: Response | undefined;
  try {
    result = await fetch(`http://localhost:8080/` + url, { credentials: 'omit' });
  } catch {
    console.log('error');
  }
  if (result && result.ok) {
    try {
      return await rssParser.parseString(await decodeFetchResponse(result));
    } catch {
      console.log('error');
    }
  } else {
    console.log('error');
  }
}
const rssParser = new Parser({
  customFields: {
    item: [
      'thumb',
      'image',
      ['content:encoded', 'fullContent'],
      ['media:content', 'mediaContent', { keepArray: true }],
    ] as Parser.CustomFieldItem<any>[],
  },
});
