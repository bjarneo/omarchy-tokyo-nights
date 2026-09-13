# Club radio library

These 33 MP3 files come from the Omarchy Radio source playlist.
The import preserves track order, titles, artist credits, and explicit-content flags.

Source: https://radio.omarchy.org/tracks/playlist.json

The playlist records SHA-256 hashes for the source playlist and each audio file.
Artist credits remain attached to their tracks. This import does not change the tracks' rights.

To refresh the files from the sibling radio checkout, run:

```bash
npm run assets:club-radio
```

To use another source directory, run:

```bash
CLUB_RADIO_SOURCE=/path/to/public/tracks npm run assets:club-radio
```
