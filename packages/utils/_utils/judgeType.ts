export const judgeType = (val: never): string => {
  const type = Object.prototype.toString.call(val);
  return type.split(' ')[1].split(']')[0];
};

export const isObject = (val: never) => judgeType(val) === 'Object';
export const isString = (val: never) => judgeType(val) === 'String';