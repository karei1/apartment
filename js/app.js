/* js/app.js - JavaScript for the Apartment Investment Model Calculator */

// Attach the function to the global scope
window.calculateModel = calculateModel;

function calculateModel() {
  console.log("calculateModel function called.");

  // -------------------------------------------------------------------------
  // 1) HELPER: Format numbers with commas & fixed decimals
  // -------------------------------------------------------------------------
  function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  // -------------------------------------------------------------------------
  // 2) READ GLOBAL INPUTS
  // -------------------------------------------------------------------------
  const pricePerM2 = parseFloat(document.getElementById('pricePerM2').value);
  const downPaymentPerc = parseFloat(document.getElementById('downPaymentPerc').value);
  const interestRate = parseFloat(document.getElementById('interestRate').value);
  const userExpenseRate = parseFloat(document.getElementById('expenseRate').value) / 100; // for base model

  const lowDuration = parseFloat(document.getElementById('lowDuration').value);
  const shoulderDuration = parseFloat(document.getElementById('shoulderDuration').value);
  const peakDuration = parseFloat(document.getElementById('peakDuration').value);
  const lowOccupancy = parseFloat(document.getElementById('lowOccupancy').value) / 100;
  const shoulderOccupancy = parseFloat(document.getElementById('shoulderOccupancy').value) / 100;
  const peakOccupancy = parseFloat(document.getElementById('peakOccupancy').value) / 100;

  // -------------------------------------------------------------------------
  // 3) HELPER: Seasonal revenue for a single season
  // -------------------------------------------------------------------------
  function seasonalRevenue(adr, days, occupancy) {
    const booked = days * occupancy;
    return booked * adr;
  }

  // -------------------------------------------------------------------------
  // 4) COMPUTE BASE MODEL DATA FOR EACH APARTMENT
  // -------------------------------------------------------------------------
  function computeBase(label, size, adrLow, adrShoulder, adrPeak) {
    // Purchase Price & Financing
    const purchasePrice = size * pricePerM2;
    const downPayment = purchasePrice * (downPaymentPerc / 100);
    const financed = purchasePrice - downPayment;

    // Seasonal revenue using the user-specified occupancy for each season
    // Weighted average occupancy across low/shoulder/peak
    const grossRevenue = (
      (lowDuration * lowOccupancy * adrLow) +
      (shoulderDuration * shoulderOccupancy * adrShoulder) +
      (peakDuration * peakOccupancy * adrPeak)
    );

    // Weighted average ADR across all seasons
    const totalDays = lowDuration + shoulderDuration + peakDuration;
    const averageADR = (
      (lowDuration * adrLow) +
      (shoulderDuration * adrShoulder) +
      (peakDuration * adrPeak)
    ) / totalDays;

    // Base model uses userExpenseRate
    const NOI = grossRevenue * (1 - userExpenseRate);
    const interest = financed * (interestRate / 100);
    const cashFlow = NOI - interest;
    const cashOnCash = (cashFlow / downPayment) * 100;
    const capRate = (NOI / purchasePrice) * 100;

    return {
      label, size,
      purchasePrice, downPayment, financed,
      grossRevenue, NOI,
      interest, cashFlow,
      cashOnCash, capRate,
      averageADR
    };
  }

  // 4.1) Gather apartment input & compute base model for each
  // 2.5 Room
  const size2_5 = parseFloat(document.getElementById('size2_5').value);
  const adr2_5_low = parseFloat(document.getElementById('adr2_5_low').value);
  const adr2_5_shoulder = parseFloat(document.getElementById('adr2_5_shoulder').value);
  const adr2_5_peak = parseFloat(document.getElementById('adr2_5_peak').value);
  const apt2_5 = computeBase("2.5 Room", size2_5, adr2_5_low, adr2_5_shoulder, adr2_5_peak);

  // 3.5 Room
  const size3_5 = parseFloat(document.getElementById('size3_5').value);
  const adr3_5_low = parseFloat(document.getElementById('adr3_5_low').value);
  const adr3_5_shoulder = parseFloat(document.getElementById('adr3_5_shoulder').value);
  const adr3_5_peak = parseFloat(document.getElementById('adr3_5_peak').value);
  const apt3_5 = computeBase("3.5 Room", size3_5, adr3_5_low, adr3_5_shoulder, adr3_5_peak);

  // 4.5 Room
  const size4_5 = parseFloat(document.getElementById('size4_5').value);
  const adr4_5_low = parseFloat(document.getElementById('adr4_5_low').value);
  const adr4_5_shoulder = parseFloat(document.getElementById('adr4_5_shoulder').value);
  const adr4_5_peak = parseFloat(document.getElementById('adr4_5_peak').value);
  const apt4_5 = computeBase("4.5 Room", size4_5, adr4_5_low, adr4_5_shoulder, adr4_5_peak);

  // -------------------------------------------------------------------------
  // 5) BUILD SEASON BREAKDOWN (ONE TABLE PER APARTMENT)
  // -------------------------------------------------------------------------
  function buildSeasonBreakdownForApt(apt, adrLow, adrShoulder, adrPeak) {
    // Calculate each season’s data
    const totalDays = lowDuration + shoulderDuration + peakDuration;
    const lowBooked = lowDuration * lowOccupancy;
    const shoulderBooked = shoulderDuration * shoulderOccupancy;
    const peakBooked = peakDuration * peakOccupancy;
    const lowGross = lowBooked * adrLow;
    const shoulderGross = shoulderBooked * adrShoulder;
    const peakGross = peakBooked * adrPeak;
    const totalGross = lowGross + shoulderGross + peakGross;
    const totalBooked = lowBooked + shoulderBooked + peakBooked;
    const avgADR = totalGross / (totalBooked || 1);  // avoid /0
    const NOI75 = totalGross * 0.75;  // Using 75% for this breakdown

    // Build table
    let table = `<h2>${apt.label.toUpperCase()} APARTMENT (${apt.size} M²) - Breakdown by Season</h2>
    <table class="results-table">
      <tr>
        <th>Season</th>
        <th>Days</th>
        <th>Occupancy</th>
        <th>ADR (CHF)</th>
        <th>Booked Nights</th>
        <th>Gross Revenue (CHF)</th>
      </tr>
      <tr>
        <td>Low Season</td>
        <td>${formatNumber(lowDuration, 0)}</td>
        <td>${formatNumber(lowOccupancy * 100, 0)}%</td>
        <td>${formatNumber(adrLow, 0)}</td>
        <td>${formatNumber(lowBooked, 0)}</td>
        <td>${formatNumber(lowGross, 0)}</td>
      </tr>
      <tr>
        <td>Shoulder</td>
        <td>${formatNumber(shoulderDuration, 0)}</td>
        <td>${formatNumber(shoulderOccupancy * 100, 0)}%</td>
        <td>${formatNumber(adrShoulder, 0)}</td>
        <td>${formatNumber(shoulderBooked, 0)}</td>
        <td>${formatNumber(shoulderGross, 0)}</td>
      </tr>
      <tr>
        <td>Peak Season</td>
        <td>${formatNumber(peakDuration, 0)}</td>
        <td>${formatNumber(peakOccupancy * 100, 0)}%</td>
        <td>${formatNumber(adrPeak, 0)}</td>
        <td>${formatNumber(peakBooked, 0)}</td>
        <td>${formatNumber(peakGross, 0)}</td>
      </tr>
      <tr>
        <td><strong>Total Annual Gross Revenue</strong></td>
        <td>—</td>
        <td>—</td>
        <td>—</td>
        <td>—</td>
        <td><strong>${formatNumber(totalGross, 0)}</strong></td>
      </tr>
      <tr>
        <td><strong>ADR per night</strong></td>
        <td colspan="4">—</td>
        <td><strong>${formatNumber(avgADR, 2)}</strong></td>
      </tr>
      <tr>
        <td><strong>NOI (75%)</strong></td>
        <td colspan="4">—</td>
        <td><strong>${formatNumber(NOI75, 0)}</strong></td>
      </tr>
    </table>`;
    return table;
  }

  // Build the season breakdown output
  let seasonBreakdownOutput = "";
  seasonBreakdownOutput += buildSeasonBreakdownForApt(apt2_5, adr2_5_low, adr2_5_shoulder, adr2_5_peak);
  seasonBreakdownOutput += buildSeasonBreakdownForApt(apt3_5, adr3_5_low, adr3_5_shoulder, adr3_5_peak);
  seasonBreakdownOutput += buildSeasonBreakdownForApt(apt4_5, adr4_5_low, adr4_5_shoulder, adr4_5_peak);

  // -------------------------------------------------------------------------
  // 6) BUILD THE BASE MODEL TABLE (SINGLE GROUPED TABLE)
  // -------------------------------------------------------------------------
  function buildBaseTable(...apts) {
    let html = `<h2>Base Model Results (User Expense Rate: ${formatNumber(userExpenseRate * 100, 0)}%)</h2>
    <table class="results-table">
      <tr>
        <th>Parameter</th>
        ${apts.map(a => `<th>${a.label}</th>`).join('')}
      </tr>
      <tr>
        <td>Size (m²)</td>
        ${apts.map(a => `<td>${formatNumber(a.size, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>Purchase Price (CHF)</td>
        ${apts.map(a => `<td>${formatNumber(a.purchasePrice, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>Down Payment (CHF)</td>
        ${apts.map(a => `<td>${formatNumber(a.downPayment, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>Financed Amount (CHF)</td>
        ${apts.map(a => `<td>${formatNumber(a.financed, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>Average ADR (CHF/night)</td>
        ${apts.map(a => `<td>${formatNumber(a.averageADR, 2)}</td>`).join('')}
      </tr>
      <tr>
        <td>Annual Gross Revenue (CHF)</td>
        ${apts.map(a => `<td>${formatNumber(a.grossRevenue, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>NOI (after user expense rate)</td>
        ${apts.map(a => `<td>${formatNumber(a.NOI, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>Annual Mortgage Interest (CHF)</td>
        ${apts.map(a => `<td>${formatNumber(a.interest, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>Annual Cash Flow (CHF)</td>
        ${apts.map(a => `<td>${formatNumber(a.cashFlow, 0)}</td>`).join('')}
      </tr>
      <tr>
        <td>Cash-on-Cash ROI (%)</td>
        ${apts.map(a => `<td>${formatNumber(a.cashOnCash, 2)}%</td>`).join('')}
      </tr>
      <tr>
        <td>Cap Rate (%)</td>
        ${apts.map(a => `<td>${formatNumber(a.capRate, 2)}%</td>`).join('')}
      </tr>
    </table>`;
    return html;
  }

  const baseOutput = buildBaseTable(apt2_5, apt3_5, apt4_5);

  // -------------------------------------------------------------------------
  // 7) BUILD DETAILED SENSITIVITY (ONE TABLE PER APARTMENT)
  // -------------------------------------------------------------------------
  const expenseRates = [0.20, 0.25, 0.30];
  const occupancyScenarios = [
    { label: "Pessimistic (50%)", occ: 0.50 },
    { label: "Base (60%)", occ: 0.60 },
    { label: "Optimistic (70%)", occ: 0.70 }
  ];

  function buildCombinedSensitivityForApt(apt, adrLow, adrShoulder, adrPeak) {
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

    // Compute average ADR for this apartment (weighted by days)
    const totalDays = lowDuration + shoulderDuration + peakDuration;
    const avgADR = (
      (lowDuration * adrLow) +
      (shoulderDuration * adrShoulder) +
      (peakDuration * adrPeak)
    ) / totalDays;
    
    // Insert a row for "ADR per night"
    table += `<tr>
      <td>ADR per night (CHF)</td>
      ${expenseRates.map(() => occupancyScenarios.map(() =>
        `<td>${formatNumber(avgADR,2)}</td>`
      ).join('')).join('')}
    </tr>`;

    // For a given expense rate & occupancy scenario, compute scenario metrics
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
      const bookedNights = (lowDuration + shoulderDuration + peakDuration) * occ;
      return {
        bookedNights,
        gross,
        NOI,
        interest,
        CF,
        ROI,
        cRate
      };
    }

    // Helper to build a row with 9 columns
    function rowForMetric(label, callback) {
      let row = `<tr><td>${label}</td>`;
      expenseRates.forEach(expRate => {
        occupancyScenarios.forEach(s => {
          const m = scenarioMetrics(expRate, s.occ);
          row += `<td>${callback(m)}</td>`;
        });
      });
      row += `</tr>`;
      return row;
    }

    table += rowForMetric("Booked Nights", m => formatNumber(m.bookedNights, 0));
    table += rowForMetric("Gross Revenue (CHF)", m => formatNumber(m.gross, 0));
    table += rowForMetric("NOI", m => formatNumber(m.NOI, 0));
    table += rowForMetric("Annual Mortgage Interest (CHF)", m => formatNumber(m.interest, 0));
    table += rowForMetric("Annual Cash Flow (CHF)", m => formatNumber(m.CF, 0));
    table += rowForMetric("Cash-on-Cash ROI (%)", m => formatNumber(m.ROI, 2) + "%");
    table += rowForMetric("Cap Rate (%)", m => formatNumber(m.cRate, 2) + "%");

    table += `</table>`;
    return table;
  }

  let sensitivityOutput = "";
  sensitivityOutput += buildCombinedSensitivityForApt(
    apt2_5, adr2_5_low, adr2_5_shoulder, adr2_5_peak
  );
  sensitivityOutput += buildCombinedSensitivityForApt(
    apt3_5, adr3_5_low, adr3_5_shoulder, adr3_5_peak
  );
  sensitivityOutput += buildCombinedSensitivityForApt(
    apt4_5, adr4_5_low, adr4_5_shoulder, adr4_5_peak
  );

  // -------------------------------------------------------------------------
  // 8) COMBINE ALL OUTPUTS: Season Breakdown, Base Model, Sensitivity
  // -------------------------------------------------------------------------
  const finalOutput = seasonBreakdownOutput + baseOutput + sensitivityOutput;

  // Store them individually and combined
  localStorage.setItem("seasonBreakdownResults", seasonBreakdownOutput);
  localStorage.setItem("baseResults", baseOutput);
  localStorage.setItem("detailedSensitivity", sensitivityOutput);
  localStorage.setItem("investmentResults", finalOutput);

  // Redirect to results.html
  window.location.href = "results.html";
}
