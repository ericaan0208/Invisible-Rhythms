# Invisible Rhythms

An interactive introduction to EEG, sleep spindles and infraslow modulation of sigma power. All plotted signals are deterministic **simulated teaching data**, not participant recordings or a model fitted to a participant.

## Develop and rebuild

Use Node.js 22.12 or later and npm:

```sh
npm install
npm run dev
npm test
npm run build
```

The build replaces `docs/`. Commit the rebuilt `docs/` when changing the source; uploading source changes alone does not rebuild the published site in this configuration. `private: true` only prevents accidental npm publication; it does not make a GitHub repository private.

## Features

- Seven guided scenes from EEG and alpha/sigma comparison to spindle events, calculated power and longer observation windows.
- A softly feathered circular focus in the opening artwork, with matching title contrast.
- Keyboard-accessible observation-window controls and an optional reading view.
- Evidence, Methods and Sources panels with 13 preserved literature references and original PubMed, DOI and available PMC links.

## Scientific scope

The fixed record lasts 240 seconds. The selected spindle-like event spans 3.875–4.875 seconds; the longest displayed window is 180 seconds. Simulation parameters illustrate measurements and do not establish biological mechanisms. Population, species, correlational limits and review-depth labels remain visible in the evidence panel. The preserved literature collection is not a systematic review.

See [scientific methods](documentation/science-model.md) and [third-party notices](THIRD_PARTY_NOTICES.md).

## Privacy and external links

The application has no backend, accounts, analytics or external font/image services. Signals are generated in the browser. Clicking a research link opens a third-party site subject to its own privacy practices. The hosting provider may process normal web request logs.

No participant data, private research files, paper PDFs, font binaries, developer environment files or local path records are included in this release.

