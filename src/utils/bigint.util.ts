export const BigIntUtils = {
  toJSON: (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (Array.isArray(obj)) return obj.map(BigIntUtils.toJSON);
    if (typeof obj === 'object') {
      // Handle Date objects
      if (obj instanceof Date) return obj.toISOString();

      const res: any = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          res[key] = BigIntUtils.toJSON(obj[key]);
        }
      }
      return res;
    }
    return obj;
  },
};
