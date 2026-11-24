export function teacherNoiseConstraints(enabled: boolean): MediaTrackConstraints {
  return {
    channelCount: 1,
    echoCancellation: enabled,
    noiseSuppression: enabled,
    autoGainControl: enabled,
  };
}

export function shapeTeacherNoise(stream: MediaStream | null, enabled: boolean): void {
  const Context = globalThis.AudioContext;
  if (!enabled || Context === undefined || stream === null) {
    return;
  }
  const context = new Context();
  const source = context.createMediaStreamSource(stream);
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 85;
  const compressor = context.createDynamicsCompressor();
  const silence = context.createGain();
  silence.gain.value = 0;
  source.connect(highpass);
  highpass.connect(compressor);
  compressor.connect(silence);
  silence.connect(context.destination);
}
