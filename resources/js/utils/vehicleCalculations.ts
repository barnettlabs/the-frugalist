/**
 * Shared utility functions for vehicle calculations
 */

import { parseOrZero, formatNumber } from './formatters.js';

/**
 * Calculate net trade-in value
 * @param {number|string} tradeInValue - Trade-in value
 * @param {number|string} tradeInPayoff - Trade-in payoff amount
 * @returns {number} - Net trade-in value
 */
export const calculateNetTradeIn = (tradeInValue, tradeInPayoff) => {
    const value = parseOrZero(tradeInValue);
    const payoff = parseOrZero(tradeInPayoff);
    return value - payoff;
};

/**
 * Calculate total rebates
 * @param {number|string} cashRebate - Cash rebate amount
 * @param {number|string} dealerRebate - Dealer rebate amount
 * @param {number|string} otherIncentives - Other incentives amount
 * @returns {number} - Total rebates
 */
export const calculateTotalRebates = (cashRebate, dealerRebate, otherIncentives) => {
    const cash = parseOrZero(cashRebate);
    const dealer = parseOrZero(dealerRebate);
    const other = parseOrZero(otherIncentives);
    return cash + dealer + other;
};

/**
 * Calculate amount financed for a loan
 * @param {object} params - Calculation parameters
 * @param {number|string} params.msrp - Vehicle selling price
 * @param {number|string} params.downPayment - Down payment amount
 * @param {number|string} params.tradeInValue - Trade-in value
 * @param {number|string} params.tradeInPayoff - Trade-in payoff
 * @param {number|string} params.cashRebate - Cash rebate
 * @param {number|string} params.dealerRebate - Dealer rebate
 * @param {number|string} params.otherIncentives - Other incentives
 * @returns {string} - Formatted amount financed
 */
export const calculateAmountFinanced = ({
    sellingPrice,
    downPayment,
    tradeInValue,
    tradeInPayoff,
    cashRebate,
    dealerRebate,
    otherIncentives
}) => {
    const price = parseOrZero(sellingPrice);
    const down = parseOrZero(downPayment);
    const netTradeIn = calculateNetTradeIn(tradeInValue, tradeInPayoff);
    const totalRebates = calculateTotalRebates(cashRebate, dealerRebate, otherIncentives);

    const amountFinanced = price - down - netTradeIn - totalRebates;
    return formatNumber(amountFinanced, 2);
};

/**
 * Calculate capitalized cost for a lease
 * @param {object} params - Calculation parameters
 * @param {number|string} params.sellingPrice - Vehicle selling price
 * @param {number|string} params.tradeInValue - Trade-in value
 * @param {number|string} params.tradeInPayoff - Trade-in payoff
 * @param {number|string} params.cashRebate - Cash rebate
 * @param {number|string} params.dealerRebate - Dealer rebate
 * @param {number|string} params.otherIncentives - Other incentives
 * @returns {string} - Formatted capitalized cost
 */
export const calculateCapitalizedCost = ({
    msrp,
    tradeInValue,
    tradeInPayoff,
    cashRebate,
    dealerRebate,
    otherIncentives
}) => {
    const price = parseOrZero(msrp);
    const netTradeIn = calculateNetTradeIn(tradeInValue, tradeInPayoff);
    const totalRebates = calculateTotalRebates(cashRebate, dealerRebate, otherIncentives);

    const capitalizedCost = price - netTradeIn - totalRebates;
    return formatNumber(capitalizedCost, 2);
};
