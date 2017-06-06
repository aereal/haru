// @flow

export const normalizeImageUrl = (url: string): string => {
  return url.replace(/\/\w\d+(?:-\w+)?\//, '/');
};

export const imageUrlInSize = (url: string, sizeQualifier: string): string => {
  const idx = url.lastIndexOf('/');
  return url.substring(0, idx) + '/' + sizeQualifier + url.substring(idx);
};
