# Invisible Rhythms

An interactive introduction to EEG, sleep spindles and infraslow modulation of sigma power. All plotted signals are deterministic **simulated teaching data**, not participant recordings or a model fitted to a participant.

## Publish with GitHub Pages

This repository includes the current production website in `docs/`; no local installation is needed to publish it.

1. Upload the **contents of this folder** to the root of a GitHub repository. `README.md`, `package.json`, `src/` and `docs/` must be at the repository root.
2. In **Settings → Pages**, choose **Deploy from a branch**.
3. Select your default branch (usually `main`) and the **/docs** folder, then Save.
4. Open the published URL shown by GitHub after deployment completes.

Upload the extracted files and folders, not the ZIP itself. Keep the directory structure. GitHub Pages configuration: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

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

## License decision

A project-wide open-source license has not yet been selected. Publishing this repository makes its source visible; it does not by itself grant an open-source reuse license. Before describing the project as open source, add a license you are authorized to grant. MIT is a permissive option that allows commercial use and modifications while requiring preservation of copyright and license notices. Third-party publications, fonts and tooling retain their own licenses.

GitHub licensing guidance: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository
