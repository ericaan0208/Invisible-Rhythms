// Selected public-facing metadata and original summaries from the approved research package.
// No raw source cache, participant data or unpublished results are included.

export const sources = {
  "alpha": {
    "title": "Posterior alpha",
    "summary": "Posterior alpha is prominent during relaxed, eyes-closed wakefulness. Here, 8–13 Hz describes the chosen band: about 77–125 milliseconds per electrical cycle.",
    "claims": [
      "RHY_ALPHA",
      "CL_GLOSSARY",
      "CL_APERIODIC"
    ],
    "papers": [
      {
        "id": "PAPER_020",
        "title": "A revised glossary of terms most commonly used by clinical electroencephalographers and updated proposal for the report format of the EEG findings. Revision 2017.",
        "year": "2017",
        "url": "https://pubmed.ncbi.nlm.nih.gov/30214992/",
        "population": "human clinical EEG",
        "depth": "Abstract and selected full-text sections reviewed"
      },
      {
        "id": "PAPER_004",
        "title": "Parameterizing neural power spectra into periodic and aperiodic components.",
        "year": "2020",
        "url": "https://pubmed.ncbi.nlm.nih.gov/33230329/",
        "population": "simulations and human electrophysiology",
        "depth": "Abstract reviewed"
      }
    ],
    "caveat": "Frequency alone does not identify a physiological rhythm. Location, state and the nonoscillatory background also matter."
  },
  "comparison": {
    "title": "Similar speed. Different state.",
    "summary": "Posterior alpha and spindle-related sigma overlap in frequency. Their context and organization distinguish them.",
    "claims": [
      "RHY_ALPHA",
      "RHY_SIGMA_POWER",
      "RHY_SLEEP_SPINDLE",
      "CL_GLOSSARY"
    ],
    "papers": [
      {
        "id": "PAPER_020",
        "title": "A revised glossary of terms most commonly used by clinical electroencephalographers and updated proposal for the report format of the EEG findings. Revision 2017.",
        "year": "2017",
        "url": "https://pubmed.ncbi.nlm.nih.gov/30214992/",
        "population": "human clinical EEG",
        "depth": "Abstract and selected full-text sections reviewed"
      },
      {
        "id": "PAPER_060",
        "title": "Sleep Spindles: Mechanisms and Functions.",
        "year": "2020",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31804897/",
        "population": "human and rodent synthesis",
        "depth": "Abstract reviewed"
      }
    ],
    "caveat": "The two synthetic examples are separate illustrations. One does not transform biologically into the other. Band boundaries vary between studies."
  },
  "spindle": {
    "title": "A band, a measurement, an event",
    "summary": "Sigma power measures activity in a chosen frequency band. A spindle marks a brief oscillatory burst during NREM sleep, especially N2.",
    "claims": [
      "RHY_SIGMA_POWER",
      "RHY_SLEEP_SPINDLE",
      "CL_SPINDLE_REVIEW",
      "CL_SPINDLE_DETECTION"
    ],
    "papers": [
      {
        "id": "PAPER_060",
        "title": "Sleep Spindles: Mechanisms and Functions.",
        "year": "2020",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31804897/",
        "population": "human and rodent synthesis",
        "depth": "Abstract reviewed"
      },
      {
        "id": "PAPER_057",
        "title": "Sleep-spindle detection: crowdsourcing and evaluating performance of experts, non-experts and automated methods.",
        "year": "2014",
        "url": "https://pubmed.ncbi.nlm.nih.gov/24562424/",
        "population": "human EEG",
        "depth": "Abstract reviewed"
      }
    ],
    "caveat": "Here sigma spans 10–16 Hz; the spindle carrier convention is 11–16 Hz. An illustrative 0.5–2-second packet contains many electrical cycles. Band power includes spindle and nonspindle activity.",
    "method": "Event detection and band-power estimation are separate measurements; a higher power value is not automatically a detected spindle."
  },
  "iso": {
    "title": "Fast activity. Slower organization.",
    "summary": "Human sleep studies find slow temporal organization in sigma power and spindle timing. The fast electrical cycles and the slower variation of power are different quantities.",
    "claims": [
      "RHY_SIGMA_ISO",
      "CL_LECCI",
      "CL_SPINDLE_ISO",
      "CL_SIGMA_DEVELOPMENT2026"
    ],
    "papers": [
      {
        "id": "PAPER_030",
        "title": "Coordinated infraslow neural and cardiac oscillations mark fragility and offline periods in mammalian sleep.",
        "year": "2017",
        "url": "https://pubmed.ncbi.nlm.nih.gov/28246641/",
        "population": "mice and humans",
        "depth": "Abstract and selected full-text sections reviewed"
      },
      {
        "id": "PAPER_059",
        "title": "Infraslow oscillations in human sleep spindle activity.",
        "year": "2019",
        "url": "https://pubmed.ncbi.nlm.nih.gov/30571990/",
        "population": "34 healthy young humans",
        "depth": "Abstract and selected full-text sections reviewed"
      },
      {
        "id": "PAPER_051",
        "title": "The infraslow fluctuation of sigma power during sleep and its links to markers of arousal and memory reactivation across development.",
        "year": "2026",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42310467/",
        "population": "154 humans aged 8-26",
        "depth": "Abstract and selected full-text sections reviewed"
      }
    ],
    "caveat": "The 0.01–0.04 Hz window corresponds to 25–100 seconds. It is a declared study window, not a universal clock. Peaks, phase relationships and their interpretation vary with age, state and method.",
    "method": "This demonstration is synthetic. Estimating power and changing the displayed duration are separate steps. The constructed pattern teaches a measurement; the linked studies provide the biological evidence."
  },
  "atlas": {
    "title": "Different quantities. Shared time.",
    "summary": "Time lets us compare electrical cycles, slower modulation and sleep episodes. Similar duration does not imply a shared mechanism.",
    "claims": [
      "RHY_ALPHA",
      "RHY_SIGMA_POWER",
      "RHY_SLEEP_SPINDLE",
      "RHY_SLOW_OSCILLATION",
      "RHY_HEARTBEAT",
      "RHY_RESPIRATION",
      "RHY_SIGMA_ISO",
      "RHY_SLEEP_CYCLE",
      "CL_CYCLE_VARIABILITY",
      "RHY_CIRCADIAN",
      "CL_CZEISLER",
      "RHY_HOMEOSTASIS",
      "CL_TWO_REVIEW"
    ],
    "papers": [
      {
        "id": "PAPER_020",
        "title": "A revised glossary of terms most commonly used by clinical electroencephalographers and updated proposal for the report format of the EEG findings. Revision 2017.",
        "year": "2017",
        "url": "https://pubmed.ncbi.nlm.nih.gov/30214992/",
        "population": "human clinical EEG",
        "depth": "Abstract and selected full-text sections reviewed"
      },
      {
        "id": "PAPER_056",
        "title": "The Slow Oscillation in Cortical and Thalamic Networks: Mechanisms and Functions.",
        "year": "2015",
        "url": "https://pubmed.ncbi.nlm.nih.gov/26834569/",
        "population": "cortical and thalamic synthesis",
        "depth": "Abstract reviewed"
      },
      {
        "id": "PAPER_044",
        "title": "Infra-slow (<0.1 Hz) Modulation of Human Brain Pulsations in Awake and Sleep States.",
        "year": "2026",
        "url": "https://pubmed.ncbi.nlm.nih.gov/42248685/",
        "population": "23 healthy humans",
        "depth": "Abstract and selected full-text sections reviewed"
      },
      {
        "id": "PAPER_073",
        "title": "Nasal Respiration Entrains Human Limbic Oscillations and Modulates Cognitive Function.",
        "year": "2016",
        "url": "https://pubmed.ncbi.nlm.nih.gov/27927961/",
        "population": "epilepsy patients and healthy behavioral participants",
        "depth": "Abstract reviewed"
      },
      {
        "id": "PAPER_012",
        "title": "Ultradian sleep cycles: Frequency, duration, and associations with individual and environmental factors-A retrospective study.",
        "year": "2024",
        "url": "https://pubmed.ncbi.nlm.nih.gov/37914631/",
        "population": "369 human participants; 6064 cycles",
        "depth": "Abstract reviewed"
      },
      {
        "id": "PAPER_013",
        "title": "Stability, precision, and near-24-hour period of the human circadian pacemaker.",
        "year": "1999",
        "url": "https://pubmed.ncbi.nlm.nih.gov/10381883/",
        "population": "human",
        "depth": "Abstract reviewed"
      },
      {
        "id": "PAPER_066",
        "title": "The two-process model of sleep regulation: a reappraisal.",
        "year": "2016",
        "url": "https://pubmed.ncbi.nlm.nih.gov/26762182/",
        "population": "human and animal synthesis",
        "depth": "Abstract reviewed"
      },
      {
        "id": "PAPER_060",
        "title": "Sleep Spindles: Mechanisms and Functions.",
        "year": "2020",
        "url": "https://pubmed.ncbi.nlm.nih.gov/31804897/",
        "population": "human and rodent synthesis",
        "depth": "Abstract reviewed"
      },
      {
        "id": "PAPER_059",
        "title": "Infraslow oscillations in human sleep spindle activity.",
        "year": "2019",
        "url": "https://pubmed.ncbi.nlm.nih.gov/30571990/",
        "population": "34 healthy young humans",
        "depth": "Abstract and selected full-text sections reviewed"
      }
    ],
    "caveat": "Positions are comparison anchors, not normal ranges. The 96-minute sleep-cycle anchor is one study’s median across 6,064 cycles in 369 people. The 24-hour circadian anchor is an entrained display reference; a controlled study estimated a mean intrinsic period of 24.18 hours."
  }
};

export const atlas = [
  {
    "id": "alpha",
    "name": "Alpha",
    "seconds": 0.1,
    "timeLabel": "100 ms",
    "quantity": "Electrical cycle",
    "available": true,
    "note": "10 Hz illustration within the 8–13 Hz convention; posterior, eyes-closed wakefulness.",
    "claims": [
      "RHY_ALPHA",
      "CL_GLOSSARY"
    ]
  },
  {
    "id": "sigma",
    "name": "Sigma / spindles",
    "seconds": 0.07692307692307693,
    "timeLabel": "≈77 ms",
    "quantity": "Electrical carrier cycle",
    "available": true,
    "note": "13 Hz carrier illustration. A spindle packet lasts much longer: here, 0.5–2 seconds.",
    "claims": [
      "RHY_SIGMA_POWER",
      "RHY_SLEEP_SPINDLE"
    ]
  },
  {
    "id": "slow",
    "name": "Slow oscillation",
    "seconds": 1.3333333333333333,
    "timeLabel": "≈1.3 s",
    "quantity": "Electrical cycle",
    "available": false,
    "note": "0.75 Hz illustration within the chosen 0.5–1 Hz window; definitions may include slower activity.",
    "claims": [
      "RHY_SLOW_OSCILLATION",
      "CL_SLOW_REVIEW"
    ]
  },
  {
    "id": "heart",
    "name": "Heartbeat",
    "seconds": 1,
    "timeLabel": "1 s",
    "quantity": "Beat interval",
    "available": false,
    "note": "Illustrative 1 Hz comparison anchor; heart rate changes with person, state and activity.",
    "claims": [
      "RHY_HEARTBEAT"
    ]
  },
  {
    "id": "breath",
    "name": "Breathing",
    "seconds": 4,
    "timeLabel": "4 s",
    "quantity": "Respiratory cycle",
    "available": false,
    "note": "Illustrative 0.25 Hz anchor. Respiratory timing varies; this is not a normal-range boundary.",
    "claims": [
      "RHY_RESPIRATION"
    ]
  },
  {
    "id": "iso",
    "name": "Sigma ISO",
    "seconds": 50,
    "timeLabel": "25–100 s",
    "quantity": "Power-modulation period",
    "available": true,
    "note": "Positioned at an illustrative 50 seconds. The 0.01–0.04 Hz study window does not define a universal clock.",
    "claims": [
      "RHY_SIGMA_ISO",
      "CL_LECCI",
      "CL_SPINDLE_ISO",
      "CL_SIGMA_DEVELOPMENT2026"
    ]
  },
  {
    "id": "sleep",
    "name": "NREM–REM organization",
    "seconds": 5760,
    "timeLabel": "96 min*",
    "quantity": "Variable sleep-cycle duration",
    "available": false,
    "note": "*Study-specific median: 6,064 cycles in 369 people. Durations vary within nights and between people.",
    "claims": [
      "RHY_SLEEP_CYCLE",
      "CL_CYCLE_VARIABILITY"
    ]
  },
  {
    "id": "circadian",
    "name": "Circadian timing",
    "seconds": 86400,
    "timeLabel": "24 h*",
    "quantity": "Daily timing",
    "available": false,
    "note": "*Entrained display anchor. Intrinsic period is a different measurement; one controlled study found a mean of 24.18 hours.",
    "claims": [
      "RHY_CIRCADIAN",
      "CL_CZEISLER"
    ]
  }
];

export const processS = {
  "id": "process-s",
  "name": "Sleep history",
  "label": "Process S · context",
  "summary": "Sleep pressure depends on prior sleep and wake. Process S models this history-dependent regulation.",
  "note": "Context beside the atlas; no fixed frequency or period is assigned.",
  "claims": [
    "RHY_HOMEOSTASIS",
    "CL_TWO_REVIEW"
  ],
  "papers": [
    "PAPER_066"
  ]
};

