export const isPlainObject = (obj: any): boolean => {
    return obj && typeof obj === 'object' && obj.constructor === Object;
  };
  