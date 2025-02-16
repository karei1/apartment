/* seasonBreakdown.js - Builds per-apartment season breakdown tables */

// Builds the season breakdown table for a single apartment
function buildSeasonBreakdownForApt(apt, adrLow, adrShoulder, adrPeak,
    formatNumber,
    lowDuration, shoulderDuration, peakDuration,
    lowOccupancy, shoulderOccupancy, peakOccupancy) {

// Calculate each season’s data
const lowBooked = lowDuration * lowOccupancy;
const shoulderBooked = shoulderDuration * shoulderOccupancy;
const peakBooked = peakDuration * peakOccupancy;
const lowGross = lowBooked * adrLow;
const shoulderGross = shoulderBooked * adrShoulder;
const peakGross = peakBooked * adrPeak;
const totalGross = lowGross + shoulderGross + peakGross;
const totalBooked = lowBooked + shoulderBooked + peakBooked;
const avgADR = totalBooked === 0 ? 0 : totalGross / totalBooked;
const NOI75 = totalGross * 0.75;  // Using 75% for this breakdown

return `
<h2>${apt.label.toUpperCase()} APARTMENT (${apt.size} M²) - Breakdown by Season</h2>
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
</table>
`;
}
