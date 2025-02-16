/* baseModel.js - Base model computations and table-building */

// Optional: a helper for single-season revenue (not currently used in computeBase)
function seasonalRevenue(adr, days, occupancy) {
    const booked = days * occupancy;
    return booked * adr;
  }
  
  // Compute base-model figures for a single apartment
  function computeBase(
    label, size, adrLow, adrShoulder, adrPeak,
    pricePerM2, downPaymentPerc, interestRate,
    lowDuration, shoulderDuration, peakDuration,
    lowOccupancy, shoulderOccupancy, peakOccupancy,
    userExpenseRate
  ) {
    // Purchase Price & Financing
    const purchasePrice = size * pricePerM2;
    const downPayment = purchasePrice * (downPaymentPerc / 100);
    const financed = purchasePrice - downPayment;
  
    // Weighted average ADR (across low/shoulder/peak)
    const totalDays = lowDuration + shoulderDuration + peakDuration;
    const averageADR = (lowDuration * adrLow +
                        shoulderDuration * adrShoulder +
                        peakDuration * adrPeak) / totalDays;
  
    // Seasonal gross revenue (using user-specified occupancy)
    const grossRevenue = (lowDuration * lowOccupancy * adrLow) +
                         (shoulderDuration * shoulderOccupancy * adrShoulder) +
                         (peakDuration * peakOccupancy * adrPeak);
  
    // Net Operating Income
    const NOI = grossRevenue * (1 - userExpenseRate);
  
    // Interest expense per year
    const interest = financed * (interestRate / 100);
  
    // Annual cash flow
    const cashFlow = NOI - interest;
  
    // Cash-on-cash ROI
    const cashOnCash = (cashFlow / downPayment) * 100;
  
    // Cap Rate
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
  
  // Build a single grouped "Base Model" table for multiple apartments
  function buildBaseTable(apts, formatNumber, userExpenseRate) {
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
  