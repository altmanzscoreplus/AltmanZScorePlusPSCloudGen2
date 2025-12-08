// Custom search resolver for Analyzer model
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { searchTerm, limit = 20, nextToken } = ctx.arguments;
  
  return {
    operation: 'Invoke',
    payload: {
      method: 'search',
      index: 'analyzer',
      body: {
        query: {
          multi_match: {
            query: searchTerm,
            fields: [
              'ps_analyzer_id^3',
              'device_id^2',
              'serial_number^2',
              'crsm^2',
              'model',
              'device_type',
              'site_location',
              'room_location',
              'circuit'
            ],
            type: 'best_fields',
            fuzziness: 'AUTO'
          }
        },
        size: limit,
        ...(nextToken && { search_after: JSON.parse(util.base64Decode(nextToken)) })
      }
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  
  const result = ctx.result;
  const hits = result.hits?.hits || [];
  const total = result.hits?.total?.value || 0;
  
  const items = hits.map(hit => ({
    ...hit._source,
    _score: hit._score
  }));
  
  const nextToken = hits.length > 0 && hits.length === ctx.arguments.limit
    ? util.base64Encode(JSON.stringify(hits[hits.length - 1].sort))
    : null;
  
  return {
    items,
    total,
    nextToken
  };
}