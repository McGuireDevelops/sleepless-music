/**
 * Dev-only: precompute waveform peaks from WAV files for CRT display.
 * Run: npm run generate:waveforms
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const BUCKETS = 1000;

const tracks = [
  { src: "/audio/in-space.wav" },
  { src: "/audio/heavy-is-the-crown.wav" },
  { src: "/audio/the-collapse.wav" },
];

function parseWav(buffer) {
  if (buffer.length < 44 || buffer.toString("ascii", 0, 4) !== "RIFF") {
    throw new Error("Not a valid WAV file");
  }

  let offset = 12;
  let fmt = null;
  let dataOffset = 0;
  let dataSize = 0;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;

    if (id === "fmt ") {
      fmt = {
        audioFormat: buffer.readUInt16LE(chunkStart),
        channels: buffer.readUInt16LE(chunkStart + 2),
        sampleRate: buffer.readUInt32LE(chunkStart + 4),
        bitsPerSample: buffer.readUInt16LE(chunkStart + 14),
      };
    } else if (id === "data") {
      dataOffset = chunkStart;
      dataSize = size;
      break;
    }

    offset = chunkStart + size + (size % 2);
  }

  if (!fmt || !dataSize) {
    throw new Error("Missing fmt or data chunk");
  }

  const { audioFormat, channels, sampleRate, bitsPerSample } = fmt;
  if (audioFormat !== 1 && audioFormat !== 3) {
    throw new Error(`Unsupported audio format: ${audioFormat}`);
  }

  const bytesPerSample = bitsPerSample / 8;
  const frameSize = bytesPerSample * channels;
  const totalFrames = Math.floor(dataSize / frameSize);
  const duration = totalFrames / sampleRate;

  return {
    dataOffset,
    dataSize,
    channels,
    sampleRate,
    bitsPerSample,
    audioFormat,
    bytesPerSample,
    frameSize,
    totalFrames,
    duration,
  };
}

function readSample(buffer, frameIndex, fmt) {
  const pos = fmt.dataOffset + frameIndex * fmt.frameSize;
  let sum = 0;

  for (let ch = 0; ch < fmt.channels; ch++) {
    const i = pos + ch * fmt.bytesPerSample;
    if (fmt.audioFormat === 3) {
      sum += buffer.readFloatLE(i);
    } else if (fmt.bitsPerSample === 16) {
      sum += buffer.readInt16LE(i) / 32768;
    } else if (fmt.bitsPerSample === 24) {
      const b0 = buffer[i];
      const b1 = buffer[i + 1];
      const b2 = buffer[i + 2];
      let v = (b2 << 16) | (b1 << 8) | b0;
      if (v & 0x800000) v |= 0xff000000;
      sum += v / 8388608;
    } else if (fmt.bitsPerSample === 32) {
      sum += buffer.readInt32LE(i) / 2147483648;
    }
  }

  return sum / fmt.channels;
}

function computePeaks(buffer, fmt, buckets) {
  const { totalFrames } = fmt;
  const peaks = new Array(buckets).fill(0);
  const framesPerBucket = Math.max(1, Math.floor(totalFrames / buckets));

  for (let b = 0; b < buckets; b++) {
    const start = b * framesPerBucket;
    const end = b === buckets - 1 ? totalFrames : (b + 1) * framesPerBucket;
    let max = 0;
    for (let f = start; f < end; f++) {
      max = Math.max(max, Math.abs(readSample(buffer, f, fmt)));
    }
    peaks[b] = Math.round(max * 1000) / 1000;
  }

  return peaks;
}

for (const { src } of tracks) {
  const wavPath = join(root, "public", src);
  const peaksPath = wavPath.replace(/\.wav$/i, ".peaks.json");

  const buffer = readFileSync(wavPath);
  const fmt = parseWav(buffer);
  const peaks = computePeaks(buffer, fmt, BUCKETS);
  const maxPeak = Math.max(...peaks, 0.001);
  const normalized = peaks.map((p) => Math.round((p / maxPeak) * 1000) / 1000);

  const output = {
    duration: Math.round(fmt.duration * 1000) / 1000,
    peaks: normalized,
  };

  writeFileSync(peaksPath, `${JSON.stringify(output)}\n`);
  console.log(
    `Wrote ${peaksPath.replace(root, "")} (${peaks.length} peaks, ${output.duration}s)`,
  );
}
