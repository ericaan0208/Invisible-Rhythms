// Public introduction adapter for redesign v3. The approved research package is unchanged.
// This newly checked source has a citation label, not an invented project PAPER/CL identifier.
export const introEvidence = {
  title: 'How scalp EEG observes activity',
  summary: 'Scalp electrodes measure voltage differences relative to a reference. Their signals combine contributions from many cells, shaped by intervening tissues and the spatial and temporal organization of activity.',
  caveat: 'The head is a simplified illustration, not an activity map. Electrode placement is schematic. The displayed trace is simulated, not a recording from the illustrated person or a single neuron.',
  papers: [{
    citationLabel: 'Buzsáki, Anastassiou & Koch (2012)',
    title: 'The origin of extracellular fields and currents—EEG, ECoG, LFP and spikes',
    year: '2012',
    url: 'https://doi.org/10.1038/nrn3241',
    population: 'Review of mammalian electrophysiology and recording biophysics',
    depth: 'Opening sections and Box 1 reviewed in the author-hosted full text',
    fullTextUrl: 'https://buzsakilab.com/content/PDFs/BuzsakiKoch2012.pdf'
  }],
  claims: [],
  claimStatus: 'New introduction wording checked against the cited source; no identifier added to the approved claim registry.'
};

export const introCopy = {
  S1: 'Inside the head, electrical currents from many cells combine through brain tissue. This schematic reveal shows the setting for a measurement, not a map of someone’s activity.',
  S2: 'Electrodes on the scalp measure voltage differences over time, reflecting combined activity from many cells. This is electroencephalography, or EEG. The connection explains the recording method; the trace is simulated.',
  S3: 'Look at one repeating cycle. This separate, simulated alpha example uses a 10 Hz carrier: about ten cycles each second. Posterior alpha is prominent during relaxed, eyes-closed wakefulness; real EEG contains more than one pattern.'
};
