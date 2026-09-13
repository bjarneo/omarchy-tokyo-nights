"""Measure audio accents and obtain local vocal timestamps for the video."""

import argparse
import json
from pathlib import Path
import subprocess

import numpy as np
from scipy.signal import butter, find_peaks, sosfilt


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--audio", default="assets/omarchy-tokyo-nights.mp3")
parser.add_argument("--output", default="assets/song-analysis.json")
parser.add_argument("--transcribe", action="store_true")
parser.add_argument("--transcript", default="/tmp/opencode/tokyo-transcript.json")
parser.add_argument("--model", default="small.en")
args = parser.parse_args()

rate = 16000
audio = np.frombuffer(subprocess.check_output([
    "ffmpeg", "-v", "error", "-i", args.audio, "-map", "0:a:0",
    "-ac", "1", "-ar", str(rate), "-f", "f32le", "-",
]), dtype=np.float32)
hop = 320
usable = len(audio) // hop * hop
bass = sosfilt(butter(3, [35, 180], btype="bandpass", fs=rate, output="sos"), audio)


def envelope(samples):
    rms = np.sqrt(np.mean(samples[:usable].reshape(-1, hop) ** 2, axis=1))
    return np.clip(rms / max(float(np.percentile(rms, 98)), 1e-6), 0, 1)


energy = envelope(audio)
low = envelope(bass)
onset = np.maximum(0, low - np.roll(low, 3))
onset[0:3] = 0
peaks, _ = find_peaks(onset, distance=12, prominence=.07, height=.06)
correlation = np.correlate(onset, onset, mode="full")[len(onset) - 1:]
lags = np.arange(round(60 / 150 / .02), round(60 / 75 / .02) + 1)
lag = int(lags[np.argmax(correlation[lags])])
analysis = {
    "duration": round(len(audio) / rate, 4),
    "step": hop / rate,
    "estimatedBpm": round(60 / (lag * hop / rate), 1),
    "energy": [round(float(value), 3) for value in energy],
    "bass": [round(float(value), 3) for value in low],
    "accents": np.round(peaks * hop / rate, 3).tolist(),
}
Path(args.output).write_text(json.dumps(analysis, separators=(",", ":")) + "\n")
print(f"Measured {analysis['duration']:.2f} seconds and {len(peaks)} audio accents.", flush=True)

if args.transcribe:
    from faster_whisper import WhisperModel

    model = WhisperModel(args.model, device="cpu", compute_type="int8", cpu_threads=6,
                         download_root="/tmp/opencode/whisper-models")
    segments, info = model.transcribe(
        audio, language="en", beam_size=5, word_timestamps=True,
        vad_filter=False, condition_on_previous_text=False,
        initial_prompt="Omarchy Tokyo Nights. Shinjuku, Aventador, Shuto, Roppongi, Shibuya.",
    )
    transcript = []
    for segment in segments:
        entry = {
            "start": segment.start, "end": segment.end, "text": segment.text,
            "words": [{"text": word.word, "start": word.start, "end": word.end,
                       "probability": word.probability} for word in segment.words or []],
        }
        transcript.append(entry)
        print(f"{segment.start:7.2f} - {segment.end:7.2f} {segment.text}", flush=True)
        Path(args.transcript).write_text(json.dumps(transcript, indent=2) + "\n")
    print("The local vocal transcript is complete.", flush=True)
