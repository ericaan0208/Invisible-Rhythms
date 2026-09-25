import { spectrumMarkup } from './spectrum-view.js';
import {
  evidenceGroups, allEvidence, papers, allPapers, provenance,
  calculationSteps, broaderTimeReference, sleepHistoryContext,
} from './evidence-data.js';

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const groupNames = { eeg: 'EEG', alpha: 'Alpha', sigma: 'Sigma', spindle: 'Spindles', power: 'Power', window: 'Time window', slow: 'Infraslow', all: 'All research' };
const tabNames = { evidence: 'Evidence', methods: 'Methods', sources: 'Sources' };
let instance;

const paragraph = (text, className = '') => `<p${className ? ` class="${className}"` : ''}>${escape(text)}</p>`;
const methodMarkup = (method) => `<section class="evidence-method"><h3>${escape(method.title)}</h3>${paragraph(method.text)}</section>`;
const paperMarkup = (paper) => `<article class="evidence-paper">
  <p class="evidence-kicker">${escape(paper.year)} · ${escape(paper.journal)}</p>
  <h3><a href="${escape(paper.originalUrl)}" target="_blank" rel="noopener noreferrer">${escape(paper.title)} <span aria-hidden="true">↗</span></a></h3>
  <p class="evidence-authors">${escape(paper.authors)}</p>
  <p class="evidence-status">${escape(paper.population)} · ${escape(paper.reviewDepth)}</p>
  <p><strong>Scope.</strong> ${escape(paper.scope)}</p>
  <p class="evidence-paper-caveat"><strong>Limit.</strong> ${escape(paper.caveat)}</p>
  <div class="evidence-paper-links">
    <a href="${escape(paper.originalUrl)}" target="_blank" rel="noopener noreferrer" aria-label="PubMed record for ${escape(paper.title)}">PubMed ↗</a>
    <a href="${escape(paper.doiUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Publisher DOI for ${escape(paper.title)}">Publisher / DOI ↗</a>
    ${paper.pmcUrl ? `<a href="${escape(paper.pmcUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Full text of ${escape(paper.title)}">Full text ↗</a>` : ''}
  </div>
</article>`;

function referenceMarkup() {
  return `<section class="evidence-broader"><h3>Different quantities. A shared time reference.</h3>
    <p>These values are illustrative anchors or study-specific findings, not universal normal ranges. Similar duration does not establish a shared mechanism.</p>
    <div class="evidence-table-wrap"><table class="evidence-reference-table">
      <caption>Broader timescale reference</caption>
      <thead><tr><th scope="col">Example</th><th scope="col">Time quantity</th><th scope="col">Reference</th></tr></thead>
      <tbody>${broaderTimeReference.map((item) => `<tr><th scope="row">${escape(item.name)}</th><td>${escape(item.quantity)}</td><td>${escape(item.timeLabel)}</td></tr><tr><td colspan="3">${escape(item.note)} <span class="evidence-inline-sources">${item.sourceIds.map((id) => `<a href="${escape(papers[id].originalUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Source: ${escape(papers[id].title)}">${escape(papers[id].authorsList[0].split(' ').slice(-1)[0])} ${escape(papers[id].year)} ↗</a>`).join(' · ')}</span></td></tr>`).join('')}</tbody>
    </table></div>
    <h3>${escape(sleepHistoryContext.title)}</h3>${paragraph(sleepHistoryContext.summary)}${paragraph(sleepHistoryContext.caveat, 'evidence-status')}
    <a href="${escape(papers.PAPER_066.originalUrl)}" target="_blank" rel="noopener noreferrer">Borbély and colleagues, 2016 ↗</a>
  </section>`;
}

function provenanceMarkup() {
  return `<aside class="evidence-provenance"><p class="evidence-kicker">${escape(provenance.label)} · ${escape(provenance.recordId)}</p>${paragraph(provenance.summary)}${paragraph(provenance.evidenceNote)}</aside>`;
}

/** Initializes one accessible evidence drawer and delegates public [data-evidence] triggers. */
export function initEvidence() {
  if (instance) return instance;
  let dialog = document.getElementById('evidence-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'evidence-dialog';
    document.body.append(dialog);
  }
  dialog.classList.add('evidence-dialog');
  dialog.setAttribute('aria-labelledby', 'evidence-title');
  dialog.setAttribute('aria-describedby', 'evidence-description');
  dialog.innerHTML = `<div class="evidence-shell">
    <header class="evidence-header"><div><p class="evidence-kicker">Invisible Rhythms / Research notes</p><h2 id="evidence-title">Evidence & methods</h2><p id="evidence-description">The demonstration, the measurements, and the published evidence.</p></div><button class="evidence-close" type="button" data-evidence-close aria-label="Close evidence and return to the story">Close <span aria-hidden="true">×</span></button></header>
    <nav class="evidence-tabs" role="tablist" aria-label="Research view">${Object.entries(tabNames).map(([id, label], index) => `<button type="button" id="evidence-tab-${id}" class="evidence-tab" role="tab" aria-controls="evidence-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? '0' : '-1'}" data-evidence-tab="${id}">${label}</button>`).join('')}</nav>
    <nav class="evidence-groups" aria-label="Research topic">${Object.entries(groupNames).map(([id, label]) => `<button type="button" class="evidence-group" aria-pressed="${id === 'eeg'}" data-evidence-group="${id}">${label}</button>`).join('')}</nav>
    <div class="evidence-body" id="evidence-panel" role="tabpanel" aria-labelledby="evidence-tab-evidence" tabindex="0"></div>
  </div>`;
  const body = dialog.querySelector('.evidence-body');
  const tabs = [...dialog.querySelectorAll('[data-evidence-tab]')];
  const groupButtons = [...dialog.querySelectorAll('[data-evidence-group]')];
  const scrollPositions = new Map();
  let groupId = 'eeg';
  let tabId = 'evidence';
  let focusBefore = null;
  let previousOverflow = null;

  const stateKey = () => `${groupId}:${tabId}`;
  const rememberScroll = () => scrollPositions.set(stateKey(), body.scrollTop);

  function render() {
    const all = groupId === 'all';
    const group = evidenceGroups[groupId];
    const title = all ? 'Evidence across the story' : group.title;
    tabs.forEach((button) => {
      const selected = button.dataset.evidenceTab === tabId;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    groupButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.evidenceGroup === groupId)));
    body.setAttribute('aria-labelledby', `evidence-tab-${tabId}`);
    dialog.dataset.group = groupId;
    dialog.dataset.view = tabId;
    let markup = `<h2 class="evidence-section-title">${escape(title)}</h2>`;
    if (tabId === 'evidence') {
      if (all) {
        markup += provenanceMarkup();
        markup += allEvidence.map((item) => `<section class="evidence-overview"><p class="evidence-kicker">${escape(groupNames[item.id])}</p><h3>${escape(item.title)}</h3>${paragraph(item.summary)}<button type="button" class="evidence-inline-button" data-evidence-group="${item.id}">Read the evidence <span aria-hidden="true">↗</span></button></section>`).join('');
        markup += referenceMarkup();
      } else {
        markup += paragraph(group.summary, 'evidence-summary');
        markup += `<ul class="evidence-claim-list">${group.claims.map((claim) => `<li>${escape(claim)}</li>`).join('')}</ul>`;
        markup += `<section class="evidence-caveat"><h3>What this does — and does not — establish</h3>${group.caveats.map((caveat) => paragraph(caveat)).join('')}</section>`;
        markup += `<details class="evidence-identifiers"><summary>Evidence identifiers</summary>${paragraph(group.claimIds.join(' · '))}</details>`;
        markup += provenanceMarkup();
      }
    } else if (tabId === 'methods') {
      markup += paragraph('The figures are calculated from the same fixed teaching record. These are the demonstration’s declared operations, not methods attributed to every cited paper.', 'evidence-summary');
      markup += (all ? calculationSteps : group.methods).map(methodMarkup).join('');
      if (all || groupId === 'slow') markup += spectrumMarkup() + referenceMarkup();
      markup += provenanceMarkup();
    } else {
      const selectedPapers = all ? allPapers : group.sourceIds.map((id) => papers[id]);
      markup += paragraph(`${selectedPapers.length} selected publications. Each link opens the original indexed record, publisher page or available full text.`, 'evidence-summary');
      markup += selectedPapers.map(paperMarkup).join('');
      markup += `<p class="evidence-status">The review depth shown here is retained from the project’s research package. Selected literature supports the explanations; it does not validate the synthetic trace.</p>`;
      if (!all) markup += `<button type="button" class="evidence-inline-button" data-evidence-group="all">Browse all ${allPapers.length} preserved references <span aria-hidden="true">↗</span></button>`;
    }
    body.innerHTML = markup;
    body.scrollTop = scrollPositions.get(stateKey()) ?? 0;
  }

  function open(nextGroup = 'eeg', trigger) {
    const targetGroup = nextGroup === 'all' || evidenceGroups[nextGroup] ? nextGroup : 'eeg';
    rememberScroll();
    groupId = targetGroup;
    if (!dialog.open) {
      focusBefore = trigger instanceof HTMLElement ? trigger : document.activeElement;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      render();
      dialog.showModal();
      dialog.querySelector('[data-evidence-close]').focus({ preventScroll: true });
    } else render();
  }

  function close() {
    if (!dialog.open) return;
    rememberScroll();
    dialog.close();
  }

  function restore() {
    if (previousOverflow !== null) document.body.style.overflow = previousOverflow;
    previousOverflow = null;
    const destination = focusBefore;
    focusBefore = null;
    if (destination instanceof HTMLElement && destination.isConnected) destination.focus({ preventScroll: true });
  }

  function delegate(event) {
    const trigger = event.target.closest?.('[data-evidence]');
    if (!trigger || trigger.disabled) return;
    event.preventDefault();
    open(trigger.dataset.evidence || 'eeg', trigger);
  }

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.closest?.('[data-evidence-close]')) { close(); return; }
    const tab = event.target.closest?.('[data-evidence-tab]');
    const group = event.target.closest?.('[data-evidence-group]');
    if (tab) { rememberScroll(); tabId = tab.dataset.evidenceTab; render(); }
    if (group) {
      rememberScroll();
      groupId = group.dataset.evidenceGroup;
      render();
      if (!group.isConnected) groupButtons.find((button) => button.dataset.evidenceGroup === groupId)?.focus({ preventScroll: true });
    }
  });
  dialog.addEventListener('keydown', (event) => {
    if (!event.target.matches?.('[data-evidence-tab]')) return;
    const index = tabs.indexOf(event.target);
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    rememberScroll();
    tabId = tabs[next].dataset.evidenceTab;
    render();
    tabs[next].focus();
  });
  dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
  dialog.addEventListener('close', restore);
  document.addEventListener('click', delegate);
  render();
  instance = { open, close };
  return instance;
}
