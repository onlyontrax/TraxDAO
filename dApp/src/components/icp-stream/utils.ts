export const encodeArrayBuffer = (file: ArrayBuffer) => Array.from(new Uint8Array(file));

export const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = window.atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

export const getFileExtension = (type: string) => {
  switch (type) {
    case 'image/jpeg':
      return { jpeg: null };
    case 'image/gif':
      return { gif: null };
    case 'image/jpg':
      return { jpg: null };
    case 'image/png':
      return { png: null };
    case 'image/svg':
      return { svg: null };
    case 'video/avi':
      return { avi: null };
    case 'video/aac':
      return { aac: null };
    case 'video/mp4':
      return { mp4: null };
    case 'audio/wav':
      return { wav: null };
    case 'audio/mp3':
      return { mp3: null };
    default:
      return null;
  }
};

export const getReverseFileExtension = (type: { string: null }) => {
  switch (Object.keys(type)[0]) {
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'jpg':
      return 'image/jpg';
    case 'png':
      return 'image/png';
    case 'svg':
      return 'image/svg';
    case 'avi':
      return 'video/avi';
    case 'mp4':
      return 'video/mp4';
    case 'aac':
      return 'video/aac';
    case 'wav':
      return 'audio/wav';
    case 'mp3':
      return 'audio/mp3';
    default:
      return '';
  }
};
