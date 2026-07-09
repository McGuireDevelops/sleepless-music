# Audio tracks

Place the demo reel audio files here (MP3 or WAV), then update the `tracks`
array in [`lib/site.ts`](../../lib/site.ts) so each `src` points to the file.

After adding or changing audio, regenerate waveform peaks for the CRT display:

```bash
npm run generate:waveforms
```

This writes a `.peaks.json` file next to each WAV (e.g. `in-space.peaks.json`).
Commit both the audio and peaks files.

Until real files exist, the TV shows a "NO SIGNAL" state.
