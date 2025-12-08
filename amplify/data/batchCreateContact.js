// Custom resolver for batch contact creation
import { util } from '@aws-appsync/utils';

export function request(ctx) {
  const { batchContactRecords } = ctx.arguments;
  
  return {
    operation: 'BatchPutItem',
    tables: {
      Contact: batchContactRecords.map(record => ({
        ...record,
        id: util.autoId(),
        createdAt: util.time.nowISO8601(),
        updatedAt: util.time.nowISO8601()
      }))
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  
  return ctx.result;
}