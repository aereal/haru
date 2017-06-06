// @flow

import React from 'react';
import ReactDOM from 'react-dom';

import { buildGooglePickerBuilder, GooglePickerBuilderProvider } from './GooglePickerBuilderProvider';
import GooglePickerProvider from './GooglePickerProvider';
import GoogleApiProvider from './GoogleApiProvider';
import { buildAccessTokenProvider } from './AccessTokenProvider';
import GoogleAuthProvider from './GoogleAuthProvider';
import { normalizeImageUrl, imageUrlInSize } from './photo';

type Photo = {
  id: string,
  largerUrl: string,
  smallerUrl: string,
  mediumUrl: string,
};
type Picker = any;
type LaunchPickerFunction = (GooglePickerProvider, GooglePickerBuilderProvider) => Promise<Picker>;

class PhotoComponent extends React.PureComponent {
  props: {
    photo: Photo,
  };

  render() {
    const { photo } = this.props;
    return (
      <span itemType="http://schema.org/Photograph">
        <picture data-photo-id={photo.id}>
          <source media="(max-width: 640px)" srcSet={photo.smallerUrl} />
          <source media="(max-width: 1024px)" srcSet={photo.mediumUrl} />
          <img src={photo.largerUrl} itemProp="image" />
        </picture>
      </span>
    );
  }
}

class PhotosListComponent extends React.PureComponent {
  props: {
    photos: Photo[],
  };

  render() {
    return (
      <div id="images">
        {this.props.photos.map((photo, idx) => <PhotoComponent photo={photo} key={idx} />)}
      </div>
    );
  }
}

class PhotoPickerComponent extends React.PureComponent {
  props: {
    launchPicker: () => Promise<Picker>,
    addPhotos: (Photo[]) => void,
  };

  state: {
    label: string,
    disabled: boolean,
  };

  constructor(props) {
    super(props);
    this.state = {
      label: 'Pick',
      disabled: false,
    };
  }

  render() {
    const { launchPicker, addPhotos } = this.props;
    return (
      <div>
        <button className="btn btn-primary btn-lg btn-block" disabled={this.state.disabled} onClick={() => {
          this.setState({ disabled: true, label: 'Requesting...' });
          launchPicker().then(picker => {
            this.setState({ disabled: false, label: 'Pick' });
            picker.setCallback(data => {
              switch (data.action) {
                case 'picked':
                const newPhotos: Photo[] = data.docs.map(doc => {
                  const normalized = normalizeImageUrl(doc.thumbnails[0].url);
                  return {
                    smallerUrl: imageUrlInSize(normalized, 's1024'),
                    mediumUrl: imageUrlInSize(normalized, 's1920'),
                    largerUrl: imageUrlInSize(normalized, 's0'),
                    id: doc.id,
                  };
                });
                addPhotos(newPhotos);
              }
            });
            picker.setVisible(true);
          });
        }}>{this.state.label}</button>
      </div>
    );
  }
}

class RootComponent extends React.PureComponent {
  props: {
    googlePickerProvider: GooglePickerProvider,
    googlePickerBuilderProvider: GooglePickerBuilderProvider,
  };

  state: {
    photos: Photo[],
  };

  constructor(props) {
    super(props);
    this.state = {
      photos: [],
    };
  }

  launchPicker(): Promise<Picker> {
    const { googlePickerProvider, googlePickerBuilderProvider } = this.props;
    return Promise.all([
      googlePickerBuilderProvider.get(),
      googlePickerProvider.get(),
    ]).then(([ builder, { PhotosView, ViewId, Feature } ]) => {
      const photosView = new PhotosView().setType('camerasync');
      const picker = builder.
        addView(ViewId.PHOTOS).
        addView(photosView).
        enableFeature(Feature.MULTISELECT_ENABLED).
        build();
      return picker;
    });
  }

  render() {
    const addPhotos = (photos: Photo[]) => {
      this.setState({ photos });
    };
    return (
      <div>
        <PhotoPickerComponent
          launchPicker={() => this.launchPicker()}
          addPhotos={addPhotos}
        />
        <PhotosListComponent photos={this.state.photos} />
      </div>
    );
  }
}

const googleApiProvider = new GoogleApiProvider();
const googleAuthProvider = new GoogleAuthProvider(googleApiProvider);
const accessTokenProvider = buildAccessTokenProvider(googleAuthProvider);
const googlePickerProvider = new GooglePickerProvider(googleApiProvider);
const googlePickerBuilderProvider = buildGooglePickerBuilder(googlePickerProvider, accessTokenProvider);

ReactDOM.render(
  <RootComponent
    googlePickerProvider={googlePickerProvider}
    googlePickerBuilderProvider={googlePickerBuilderProvider}
  />,
  document.querySelector('main')
);
