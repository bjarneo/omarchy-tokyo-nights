"""Align the supplied lyric text inside reviewed vocal time windows."""

import argparse
from difflib import SequenceMatcher
import json
from pathlib import Path
import re


parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--transcript", default="/tmp/opencode/tokyo-transcript.json")
args = parser.parse_args()

# These line boundaries follow the word timestamps in the local vocal transcript.
windows = [
    [38.92, 42.30], [42.30, 45.62], [45.62, 48.96], [48.96, 52.32],
    [52.32, 55.54], [55.54, 58.90], [58.90, 62.56], [62.56, 65.74],
    [65.74, 69.02], [69.02, 72.40], [72.40, 75.72], [75.72, 79.04],
    [79.04, 81.98], [81.98, 86.32], [86.32, 88.94], [88.94, 93.24],
    [106.50, 109.78], [109.78, 113.12], [113.12, 116.46], [116.46, 119.72],
    [119.72, 123.02], [123.02, 126.62], [126.62, 129.74], [129.74, 132.40],
    [132.40, 135.40], [135.40, 138.74], [138.74, 142.04], [142.04, 145.24],
    [145.24, 148.24], [148.24, 152.68], [152.68, 155.04], [155.04, 158.89],
    [159.50, 162.76], [162.76, 165.88], [165.88, 168.84], [168.84, 172.40],
    [172.40, 176.92], [178.66, 184.20], [184.88, 190.56], [191.74, 196.22],
]
sections = [
    {"id": "intro", "label": "Nightfall", "start": 0},
    {"id": "verse-1", "label": "Verse 1", "start": 38.92},
    {"id": "chorus-1", "label": "Chorus 1", "start": 65.74},
    {"id": "interlude", "label": "Neon run", "start": 93.24},
    {"id": "verse-2", "label": "Verse 2", "start": 106.50},
    {"id": "chorus-2", "label": "Chorus 2", "start": 132.40},
    {"id": "bridge", "label": "Tunnel run", "start": 159.50},
    {"id": "outro", "label": "Tokyo Bay", "start": 172.40},
]
lines = [line.strip() for line in Path("assets/lyrics.txt").read_text().splitlines()
         if line.strip() and not line.startswith("(")]
assert len(lines) == len(windows), "The lyric count must match the vocal windows."
transcript = json.loads(Path(args.transcript).read_text())
recognized = [word for segment in transcript for word in segment["words"]]


def normalized(word):
    return re.sub(r"[^a-z0-9]", "", word.lower()).removesuffix("g")


lyrics = []
for text, (start, end) in zip(lines, windows):
    reference = text.split()
    source = [word for word in recognized if start <= word["start"] < end]
    matcher = SequenceMatcher(None, [normalized(word) for word in reference],
                              [normalized(word["text"]) for word in source], autojunk=False)
    words = [None] * len(reference)
    for operation, a, b, c, d in matcher.get_opcodes():
        if operation == "equal":
            for index in range(b - a):
                word = source[c + index]
                words[a + index] = {"text": reference[a + index],
                                    "start": max(start, word["start"]),
                                    "end": min(end, word["end"])}
        elif b > a:
            left = source[c]["start"] if c < len(source) else end
            right = source[d - 1]["end"] if d > c else left
            left = max(start, min(left, end))
            right = max(left, min(right, end))
            for index in range(b - a):
                words[a + index] = {"text": reference[a + index],
                                    "start": round(left + (right - left) * index / (b - a), 3),
                                    "end": round(left + (right - left) * (index + 1) / (b - a), 3)}
    # Zero-length model tokens use the last 100 milliseconds of the prior token.
    for index, word in enumerate(words):
        if word["end"] <= word["start"]:
            word["start"] = max(start, word["end"] - .1)
            if index and words[index - 1]["end"] > word["start"]:
                words[index - 1]["end"] = max(words[index - 1]["start"], word["start"])
        word["start"] = round(word["start"], 3)
        word["end"] = round(word["end"], 3)
    lyrics.append({"start": start, "end": end, "text": text, "words": words})

duration = json.loads(Path("assets/song-analysis.json").read_text())["duration"]
for index, section in enumerate(sections):
    section["end"] = sections[index + 1]["start"] if index + 1 < len(sections) else duration
data = {"duration": duration, "alignment": "Local speech-model timestamps with reviewed line boundaries.",
        "sections": sections, "lyrics": lyrics}
Path("assets/song-cues.json").write_text(json.dumps(data, indent=2) + "\n")


def timestamp(seconds):
    milliseconds = round(seconds * 1000)
    return f"{milliseconds // 3600000:02}:{milliseconds // 60000 % 60:02}:{milliseconds // 1000 % 60:02},{milliseconds % 1000:03}"


srt = "\n\n".join(f"{index + 1}\n{timestamp(line['start'])} --> {timestamp(line['end'])}\n{line['text']}"
                  for index, line in enumerate(lyrics))
Path("assets/omarchy-tokyo-nights.srt").write_text(srt + "\n")
print(f"Aligned {len(lyrics)} supplied lyric lines across {len(sections)} sections.")
