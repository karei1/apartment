/* main.js - Main entry point for the calculator */

function calculateModelNew() {
  console.log("New Model function called.");

  // -------------------------------------------------------------------------
  // HELPER: Format numbers with commas & fixed decimals
  // -------------------------------------------------------------------------
  function formatNumber(num, decimals = 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  }

  // -------------------------------------------------------------------------
  // 1) READ GLOBAL INPUTS
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
  // 2) COMPUTE BASE MODEL DATA FOR EACH APARTMENT
  // -------------------------------------------------------------------------
  // 2.5 Room
  const size2_5 = parseFloat(document.getElementById('size2_5').value);
  const adr2_5_low = parseFloat(document.getElementById('adr2_5_low').value);
  const adr2_5_shoulder = parseFloat(document.getElementById('adr2_5_shoulder').value);
  const adr2_5_peak = parseFloat(document.getElementById('adr2_5_peak').value);
  const apt2_5 = computeBase("2.5 Room", size2_5, adr2_5_low, adr2_5_shoulder, adr2_5_peak,
                            pricePerM2, downPaymentPerc, interestRate,
                            lowDuration, shoulderDuration, peakDuration,
                            lowOccupancy, shoulderOccupancy, peakOccupancy,
                            userExpenseRate);

  // 3.5 Room
  const size3_5 = parseFloat(document.getElementById('size3_5').value);
  const adr3_5_low = parseFloat(document.getElementById('adr3_5_low').value);
  const adr3_5_shoulder = parseFloat(document.getElementById('adr3_5_shoulder').value);
  const adr3_5_peak = parseFloat(document.getElementById('adr3_5_peak').value);
  const apt3_5 = computeBase("3.5 Room", size3_5, adr3_5_low, adr3_5_shoulder, adr3_5_peak,
                            pricePerM2, downPaymentPerc, interestRate,
                            lowDuration, shoulderDuration, peakDuration,
                            lowOccupancy, shoulderOccupancy, peakOccupancy,
                            userExpenseRate);

  // 4.5 Room
  const size4_5 = parseFloat(document.getElementById('size4_5').value);
  const adr4_5_low = parseFloat(document.getElementById('adr4_5_low').value);
  const adr4_5_shoulder = parseFloat(document.getElementById('adr4_5_shoulder').value);
  const adr4_5_peak = parseFloat(document.getElementById('adr4_5_peak').value);
  const apt4_5 = computeBase("4.5 Room", size4_5, adr4_5_low, adr4_5_shoulder, adr4_5_peak,
                            pricePerM2, downPaymentPerc, interestRate,
                            lowDuration, shoulderDuration, peakDuration,
                            lowOccupancy, shoulderOccupancy, peakOccupancy,
                            userExpenseRate);

  // -------------------------------------------------------------------------
  // 3) BUILD SEASON BREAKDOWN (ONE TABLE PER APARTMENT)
  // -------------------------------------------------------------------------
  let seasonBreakdownOutput = "";
  seasonBreakdownOutput += buildSeasonBreakdownForApt(apt2_5, adr2_5_low, adr2_5_shoulder, adr2_5_peak,
                                                      formatNumber, lowDuration, shoulderDuration, peakDuration,
                                                      lowOccupancy, shoulderOccupancy, peakOccupancy);
  seasonBreakdownOutput += buildSeasonBreakdownForApt(apt3_5, adr3_5_low, adr3_5_shoulder, adr3_5_peak,
                                                      formatNumber, lowDuration, shoulderDuration, peakDuration,
                                                      lowOccupancy, shoulderOccupancy, peakOccupancy);
  seasonBreakdownOutput += buildSeasonBreakdownForApt(apt4_5, adr4_5_low, adr4_5_shoulder, adr4_5_peak,
                                                      formatNumber, lowDuration, shoulderDuration, peakDuration,
                                                      lowOccupancy, shoulderOccupancy, peakOccupancy);

  // -------------------------------------------------------------------------
  // 4) BUILD THE BASE MODEL TABLE (SINGLE GROUPED TABLE)
  // -------------------------------------------------------------------------
  const baseOutput = buildBaseTable([apt2_5, apt3_5, apt4_5], formatNumber, userExpenseRate);

  // -------------------------------------------------------------------------
  // 5) BUILD DETAILED SENSITIVITY (ONE TABLE PER APARTMENT)
  // -------------------------------------------------------------------------
  let sensitivityOutput = "";
  sensitivityOutput += buildCombinedSensitivityForApt(apt2_5, adr2_5_low, adr2_5_shoulder, adr2_5_peak,
                                                      formatNumber, interestRate);
  sensitivityOutput += buildCombinedSensitivityForApt(apt3_5, adr3_5_low, adr3_5_shoulder, adr3_5_peak,
                                                      formatNumber, interestRate);
  sensitivityOutput += buildCombinedSensitivityForApt(apt4_5, adr4_5_low, adr4_5_shoulder, adr4_5_peak,
                                                      formatNumber, interestRate);

  // -------------------------------------------------------------------------
  // 6) COMBINE ALL OUTPUTS: Season Breakdown, Base Model, Sensitivity
  // -------------------------------------------------------------------------
  const finalOutput = seasonBreakdownOutput + baseOutput + sensitivityOutput;

  // Store them individually and combined in localStorage for retrieval in results.html
  localStorage.setItem("seasonBreakdownResults", seasonBreakdownOutput);
  localStorage.setItem("baseResults", baseOutput);
  localStorage.setItem("detailedSensitivity", sensitivityOutput);
  localStorage.setItem("investmentResults", finalOutput);

  // Finally, redirect to results.html
  window.location.href = "resultsnew.html";
}

// Expose it globally so the HTML button can call it
window.calculateModelNew = calculateModelNew;