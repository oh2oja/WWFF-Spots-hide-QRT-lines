// ==UserScript==
// @name         WWFF Spots – hide QRT rows
// @namespace    wwff-hide-qrt
// @version      1.0
// @description  Hides rows on spots.wwff.co whose Info field contains "QRT" (case-insensitive).
// @author       OH2OJA
// @match        https://spots.wwff.co/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const QRT = /qrt/i;

  // Finds the index of the "Info" column from the table header row
  function infoColumnIndex(table) {
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (!headerRow) return -1;
    const cells = Array.from(headerRow.children);
    return cells.findIndex(c => c.textContent.trim().toLowerCase() === 'info');
  }

  function filter() {
    document.querySelectorAll('table').forEach(table => {
      const idx = infoColumnIndex(table);
      if (idx < 0) return;
      const rows = table.tBodies.length
        ? Array.from(table.tBodies).flatMap(b => Array.from(b.rows))
        : Array.from(table.rows).slice(1);
      rows.forEach(row => {
        const cell = row.cells[idx];
        if (!cell) return;
        const hide = QRT.test(cell.textContent);
        // Hide only QRT rows; other rows are left untouched
        if (hide && row.style.display !== 'none') {
          row.style.display = 'none';
          row.dataset.qrtHidden = '1';
        } else if (!hide && row.dataset.qrtHidden) {
          row.style.display = '';
          delete row.dataset.qrtHidden;
        }
      });
    });
  }

  filter();

  // The page updates spots automatically -> re-filter after every change
  let pending = false;
  new MutationObserver(() => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; filter(); });
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
