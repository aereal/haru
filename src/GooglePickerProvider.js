// @flow

import GoogleApiProvider from './googleApiProvider';

export default class GooglePickerProvider {
  _picker: ?any;
  googleApiProvider: GoogleApiProvider;

  constructor (googleApiProvider: GoogleApiProvider) {
    this._picker = null;
    this.googleApiProvider = googleApiProvider;
  }

  get () {
    if (this._picker) {
      return Promise.resolve(this._picker);
    } else {
      return this.googleApiProvider.get().then(gapi => {
        return new Promise((ok, ng) => {
          gapi.load('picker', {
            callback: () => {
              this._picker = window.google.picker;
              ok(this._picker);
            }
          })
        });
      });
    }
  }
}
