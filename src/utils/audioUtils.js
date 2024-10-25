export function fadeOutAudio(audio, duration = 1000) {
  return new Promise((resolve) => {
    const initialVolume = audio.volume;
    const step = initialVolume / (duration / 100);
    const fadeOutInterval = setInterval(() => {
      if (audio.volume > step) {
        audio.volume -= step;
      } else {
        audio.volume = 0;
        clearInterval(fadeOutInterval);
        audio.pause();
        resolve();
      }
    }, 100);
  });
}
