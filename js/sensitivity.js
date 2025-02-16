/* sensitivity.js - Detailed sensitivity analysis */

const expenseRates = [0.20, 0.25, 0.30];
const occupancyScenarios = [
  { label: "Pessimistic (50%)", occ: 0.50 },
  { label: "Base (60%)", occ: 0.60 },
  { label: "Optimistic (70%)", occ: 0.70 }
];

// Build combined sensitivity table for a single apartment
function buildCombinedSensitivityForApt(
  apt, adrLow, adrShoulder, adrPeak,
  formatNumber, interestRate
) {
  // We assume lowDuration, shoulderDuration, peakDuration, etc. are globally accessible
  // from main.js if needed. (Or you could pass them as parameters similarly.)

  // We'll read these durations/occupancies from the apt if we stored them,
// or rely on global variables. For brevity, apt.* might not have them directly.
// If you need them, pass them in just like in computeBase.

  // If needed, adapt to your usage:
  // e.g. const { lowDuration, shoulderDuration, peakDuration } = window;

  // For demonstration, suppose they're all in the global scope:
  const lowDuration     = window.lowDuration;
  const shoulderDuration= window.shoulderDuration;
  const peakDuration    = window.peakDuration;

  // HTML table header
  let table = `<h2>Detailed Sensitivity for ${apt.label}</h2>
    <table class="results-table">
      <tr>
        <th rowspan="2">Metric</th>
        <th colspan="3">20% OE → NOI = 80% of Gross</th>
        <th colspan="3">25% OE → NOI = 75% of Gross</th>
        <th colspan="3">30% OE → NOI = 70% of Gross</th>
      </tr>
      <tr>
        ${expenseRates.map(() =>
          occupancyScenarios.map(s => `<th>${s.label}</th>`).join('')
        ).join('')}
      </tr>
  `;

  // Weighted average ADR for this apartment
  const totalDays = lowDuration + shoulderDuration + peakDuration;
  const avgADR = (lowDuration * adrLow +
                  shoulderDuration * adrShoulder +
                  peakDuration * adrPeak) / (totalDays || 1);

  // Insert a row for "ADR per night"
  table += `<tr>
    <td>ADR per night (CHF)</td>
    ${
      expenseRates.map(() =>
        occupancyScenarios.map(() =>
          `<td>${formatNumber(avgADR, 2)}</td>`
        ).join('')
      ).join('')
    }
  </tr>`;

  // For each combination of expense rate + occupancy scenario,
  // compute the relevant metrics
  function scenarioMetrics(expRate, occ) {
    const gross = (
      (lowDuration * occ * adrLow) +
      (shoulderDuration * occ * adrShoulder) +
      (peakDuration * occ * adrPeak)
    );

    const NOI = gross * (1 - expRate);
    const interest = apt.financed * (interestRate / 100);
    const CF = NOI - interest;
    const ROI = (CF / apt.downPayment) * 100;
    const cRate = (NOI / apt.purchasePrice) * 100;
    const bookedNights = totalDays * occ;

    return { bookedNights, gross, NOI, interest, CF, ROI, cRate };
  }

  // Helper to build each row
  function rowForMetric(label, extractor) {
    let row = `<tr><td>${label}</td>`;
    expenseRates.forEach(expRate => {
      occupancyScenarios.forEach(s => {
        const m = scenarioMetrics(expRate, s.occ);
        row += `<td>${extractor(m)}</td>`;
      });
    });
    row += `</tr>`;
    return row;
  }

  table += rowForMetric("Booked Nights",       m => formatNumber(m.bookedNights, 0));
  table += rowForMetric("Gross Revenue (CHF)", m => formatNumber(m.gross, 0));
  table += rowForMetric("NOI",                 m => formatNumber(m.NOI, 0));
  table += rowForMetric("Annual Mortgage Interest (CHF)", m => formatNumber(m.interest, 0));
  table += rowForMetric("Annual Cash Flow (CHF)",         m => formatNumber(m.CF, 0));
  table += rowForMetric("Cash-on-Cash ROI (%)",           m => formatNumber(m.ROI, 2) + "%");
  table += rowForMetric("Cap Rate (%)",                   m => formatNumber(m.cRate, 2) + "%");

  table += `</table>`;
  return table;
}
