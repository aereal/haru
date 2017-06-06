// @flow

import GooglePickerProvider from './GooglePickerProvider';
import { AccessTokenProvider } from './AccessTokenProvider';

export class GooglePickerBuilderProvider {
  googlePickerProvider: GooglePickerProvider;
  accessTokenProvider: AccessTokenProvider;
  _developerKey: string;
  _builder: ?any;

  constructor (googlePickerProvider: GooglePickerProvider, accessTokenProvider: AccessTokenProvider, developerKey: string) {
    this.googlePickerProvider = googlePickerProvider;
    this.accessTokenProvider = accessTokenProvider;
    this._developerKey = developerKey;
    this._builder = null;
  }

  get () {
    if (this._builder) {
      return Promise.resolve(this._builder);
    } else {
      return Promise.all([
        this.googlePickerProvider.get(),
        this.accessTokenProvider.get()
      ]).then(([ picker, accessToken ]) => {
        return new picker.PickerBuilder()
          .setOAuthToken(accessToken)
          .setDeveloperKey(this._developerKey);
      });
    }
  }
}

export const buildGooglePickerBuilder = (googlePickerProvider: GooglePickerProvider, accessTokenProvider: AccessTokenProvider): GooglePickerBuilderProvider => {
  return new GooglePickerBuilderProvider(
    googlePickerProvider,
    accessTokenProvider,
    'AIzaSyBvZFemCoOg3sdZHDXhmxNFi33fOItzo-k'
  );
};
