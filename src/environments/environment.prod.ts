import { ts, publicKey } from './.keys';

export const environment = {
  production: true,
  marvel: {
    domain: 'https://gateway.marvel.com:443',
    ts: ts,
    apikey: publicKey
  }
};
