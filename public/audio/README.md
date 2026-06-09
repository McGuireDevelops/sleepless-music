# Audio tracks

Place the demo reel audio files here (MP3 or WAV), then update the `tracks`
array in [`lib/site.ts`](../../lib/site.ts) so each `src` points to the file.

```
public/audio/track-01.mp3
public/audio/track-02.mp3
public/audio/track-03.mp3
```

Naming is up to you — just keep the `src` paths in `lib/site.ts` in sync.
Until real files exist, the TV shows a "NO SIGNAL" state and the player
surfaces a friendly message instead of failing.
