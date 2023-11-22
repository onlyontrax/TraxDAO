export function videoDuration(s) {
  if (!s) {
    return '00:00';
  }
  const secNum: any = parseInt(s, 10); // don't forget the second param
  let hours: any = Math.floor(secNum / 3600);
  let minutes: any = Math.floor((secNum - (hours * 3600)) / 60);
  let seconds: any = secNum - (hours * 3600) - (minutes * 60);

  if (hours < 10) hours = `0${hours}`;
  if (minutes < 10) minutes = `0${minutes}`;
  if (seconds < 10) seconds = `0${seconds}`;
  return `${(hours !== '00' ? `${hours}:` : '') + minutes}:${seconds}`;
}
