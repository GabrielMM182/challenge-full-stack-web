process.env['NODE_ENV'] = 'test';
process.env['JWT_SECRET'] = 'test-jwt-secret-key-for-testing';
process.env['JWT_EXPIRES_IN'] = '1h';

jest.setTimeout(10000);

global.console = {
  ...console,
};