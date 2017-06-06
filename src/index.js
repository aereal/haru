// @flow

import React from 'react';
import ReactDOM from 'react-dom';

type Photo = {
  id: string,
  largerUrl: string,
  smallerUrl: string,
  mediumUrl: string,
};

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

const initialPhotos = [
];
ReactDOM.render(
  <PhotosListComponent photos={initialPhotos} />,
  document.querySelector('main')
);
