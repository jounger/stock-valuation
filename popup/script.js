let btnCalcDataHTML = document.getElementById("btnCalcData");
let btnGetDataHTML = document.getElementById("btnGetData");
let btnResetDataHTML = document.getElementById("btnResetData");

const symbolHTML = document.getElementById("symbol");
const sharesOutstandingHTML = document.getElementById("sharesOutstanding");
const netProfitHTML = document.getElementById("netProfit");
const unitHTML = document.getElementById("unit");
const peHTML = document.getElementById("pe");
const industryPeHTML = document.getElementById("industryPe");
const historyHTML = document.getElementById("history");

chrome.runtime.sendMessage({ name: "onload" }, (response) => {
    if (response.symbol) {
        symbolHTML.value = response.symbol;
        fillDataHTML(response);
    }
});

chrome.storage.sync.get("rows", ({ rows }) => setHistoryTable(rows));

btnGetDataHTML.addEventListener("click", () => {
    chrome.runtime.sendMessage({ name: "getData", symbol: symbol.value }, (response) => fillDataHTML(response));
});

btnResetDataHTML.addEventListener("click", () => {
    chrome.runtime.sendMessage({ name: "resetData" });
});

btnCalcDataHTML.addEventListener("click", () => {
    const netProfit = netProfitHTML.value.replace(/\s+/g, '').split(";");
    const sumNetProfit = netProfit.reduce((p, c) => parseInt(p) + parseInt(c), 0);
    const lowPrice = calcStockValuation(sumNetProfit, sharesOutstandingHTML.value, peHTML.value, unitHTML.value);
    const highPrice = calcStockValuation(sumNetProfit, sharesOutstandingHTML.value, industryPeHTML.value, unitHTML.value);
    const row = `<tr><td>${symbolHTML.value}</td><td>${lowPrice.toFixed(2)}</td><td>${highPrice.toFixed(2)}</td></tr>`;
    chrome.storage.sync.get("rows", ({ rows }) => {
        rows.push(row);
        if (rows.length > 5) {
            rows.shift();
        }
        chrome.storage.sync.set({ rows });
        setHistoryTable(rows);
    });
});

function calcStockValuation(sumNetProfit, sharesOutstanding, pe, unit) {
    return sumNetProfit / sharesOutstanding * pe * unit;
}

function setHistoryTable(rows) {
    historyHTML.innerHTML = rows.reverse().reduce((accumulator, item) => `${accumulator}${item}`, '');
}

function fillDataHTML(response) {
    sharesOutstandingHTML.value = response.fundamental.sharesOutstanding;
    peHTML.value = response.fundamental.pe.toFixed(2);
    netProfitHTML.value = response.financial.rows[3].filter(x => !isNaN(x))
        .map(y => (parseInt(y) / unit.value).toFixed(2))
        .reduce((accumulator, item, i) => `${accumulator}${i ? ';' : ''}${item}`, '');
}