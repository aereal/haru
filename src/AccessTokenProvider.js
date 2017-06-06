// @flow

import GoogleAuthProvider from './GoogleAuthProvider';

export class AccessTokenProvider {
  _accessToken: ?string;
  _clientId: string;
  _scope: string[];
  googleAuthProvider: GoogleAuthProvider;

  constructor (googleAuthProvider: GoogleAuthProvider, clientId: string, scope: string[]) {
    this._accessToken = null;
    this._clientId = clientId;
    this._scope = scope;
    this.googleAuthProvider = googleAuthProvider;
  }

  get () {
    if (this._accessToken) {
      return Promise.resolve(this._accessToken);
    } else {
      return this.googleAuthProvider.get().then(auth => {
        return new Promise((ok, ng) => {
          auth.authorize({
            client_id: this._clientId,
            scope: this._scope,
            immediate: false
          }, (authResult) => {
            if (authResult && !authResult.error) {
              this._accessToken = authResult.access_token;
              ok(this._accessToken);
            } else {
              ng(authResult.error);
            }
          });
        });
      });
    }
  }
}

export const buildAccessTokenProvider = (googleAuthProvider: GoogleAuthProvider): AccessTokenProvider => {
  return new AccessTokenProvider(
    googleAuthProvider,
    '392026323976-d2fbp7qcd7en6294f6mpp2fk1ob4gcql.apps.googleusercontent.com',
    ['https://www.googleapis.com/auth/photos']
  );
};
