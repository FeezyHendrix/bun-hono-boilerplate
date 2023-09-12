export const assertString = (value: string) => {
  if (value === '' || value === null || typeof value !== 'string') {
    throw new Error('Value is not a string');
  }

  return value;
};

export const assertNumber = (value: number) => {
  if (value === undefined || typeof value !== 'number') {
    throw new Error('Value is not a number');
  }

  return value;
};

export const assertEnv = (key: string) => {
  if (Bun.env[key] === undefined || process.env[key] === null) {
    throw new Error(`${key} is not defined in environment`);
  }

  return process.env[key];
};
