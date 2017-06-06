// @flow

export default class GoogleApiProvider {
  _gapi: ?any;

  constructor () {
    this._gapi = null;
  }

  get () {
    if (this._gapi) {
      return Promise.resolve(this._gapi);
    } else {
      return new Promise((ok, ng) => {
        let timerId;
        timerId = setInterval(() => {
          if (window.gapi) {
            this._gapi = window.gapi;
            ok(this._gapi);
            clearInterval(timerId);
          }
        }, 500);
      });
    }
  }
}
