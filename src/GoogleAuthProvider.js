// @flow

import GoogleApiProvider from './GoogleApiProvider';

export default class GoogleAuthProvider {
  _auth: ?any;
  googleApiProvider: GoogleApiProvider;

  constructor (googleApiProvider: GoogleApiProvider) {
    this._auth = null;
    this.googleApiProvider = googleApiProvider;
  }

  get () {
    if (this._auth) {
      return Promise.resolve(this._auth);
    } else {
      return this.googleApiProvider.get().then(gapi => {
        return new Promise((ok, ng) => {
          gapi.load('auth', {
            callback: () => {
              this._auth = window.gapi.auth;
              ok(this._auth);
            }
          })
        });
      });
    }
  }
}
