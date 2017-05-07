class GoogleApiProvider {

  constructor() {
    this._gapi = null;
  }

  get() {
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
const googleApiProvider = new GoogleApiProvider();

class GooglePickerProvider {

  constructor(googleApiProvider) {
    this._picker = null;
    this.googleApiProvider = googleApiProvider;
  }

  get() {
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
          });
        });
      });
    }
  }
}
const googlePickerProvider = new GooglePickerProvider(googleApiProvider);

class GoogleAuthProvider {

  constructor(googleApiProvider) {
    this._auth = null;
    this.googleApiProvider = googleApiProvider;
  }

  get() {
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
          });
        });
      });
    }
  }
}
const googleAuthProvider = new GoogleAuthProvider(googleApiProvider);

class AccessTokenProvider {

  constructor(googleAuthProvider, clientId, scope) {
    this._accessToken = null;
    this._clientId = clientId;
    this._scope = scope;
    this.googleAuthProvider = googleAuthProvider;
  }

  get() {
    if (this._accessToken) {
      return Promise.resolve(this._accessToken);
    } else {
      return this.googleAuthProvider.get().then(auth => {
        return new Promise((ok, ng) => {
          auth.authorize({
            client_id: this._clientId,
            scope: this._scope,
            immediate: false
          }, authResult => {
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
const accessTokenProvider = new AccessTokenProvider(googleAuthProvider, '392026323976-d2fbp7qcd7en6294f6mpp2fk1ob4gcql.apps.googleusercontent.com', ['https://www.googleapis.com/auth/photos']);

class GooglePickerBuilderProvider {

  constructor(googlePickerProvider, accessTokenProvider, developerKey) {
    this.googlePickerProvider = googlePickerProvider;
    this.accessTokenProvider = accessTokenProvider;
    this._developerKey = developerKey;
    this._builder = null;
  }

  get() {
    if (this._builder) {
      return Promise.resolve(this._builder);
    } else {
      return Promise.all([this.googlePickerProvider.get(), this.accessTokenProvider.get()]).then(([picker, accessToken]) => {
        return new picker.PickerBuilder().setOAuthToken(accessToken).setDeveloperKey(this._developerKey);
      });
    }
  }
}
const googlePickerBuilderProvider = new GooglePickerBuilderProvider(googlePickerProvider, accessTokenProvider, 'AIzaSyBvZFemCoOg3sdZHDXhmxNFi33fOItzo-k');

const launchPicker = () => {
  return Promise.all([googlePickerBuilderProvider.get(), googlePickerProvider.get()]).then(([builder, { PhotosView, ViewId, Feature }]) => {
    const photosView = new PhotosView().setType('camerasync');
    const picker = builder.addView(ViewId.PHOTOS).addView(photosView).enableFeature(Feature.MULTISELECT_ENABLED).build();
    return picker;
  });
};

new window.Vue({ // eslint-disable-line no-new
  el: 'main',
  data: {
    button: {
      text: 'Pick',
      disabled: false
    },
    photos: []
  },
  methods: {
    onLaunchPicker() {
      this.$data.button = {
        text: 'Waiting...',
        disabled: true
      };
      launchPicker().then(picker => {
        this.$data.button = {
          text: 'Pick',
          disabled: false
        };
        picker.setCallback(data => {
          switch (data.action) {
            case 'picked':
              const newPhotos = data.docs.map(d => {
                return {
                  url: d.thumbnails[0].url
                };
              });
              this.$data.photos = this.$data.photos.concat(newPhotos);
              break;
          }
        });
        picker.setVisible(true);
      });
    }
  }
});