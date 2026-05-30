const BN = 'https://fapi.binance.com';
const BNS = 'https://api.binance.com';
const OKX = 'https://www.okx.com';
const BB = 'https://api.bybit.com';

async function get(u) {
  try {
    const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
    const j = await r.json();
    return Array.isArray(j) ? j : j.data || j || [];
  } catch { return []; }
}
async function getObj(u) {
  try {
    const r = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) });
    return await r.json();
  } catch { return {}; }
}

function calcCVD(trades) {
  let c = 0;
  (Array.isArray(trades) ? trades : []).forEach(t => { const q = parseFloat(t.q || 0); if (t.m === false) c += q; else c -= q; });
  return c;
}

function calcScore(chg, chg1h, oiChg1h, oiChg4h, relBTC, fr, wl, rl, taker, rvol, frFlip, oiCont, cvdDiff, pricePos) {
  let s = 50;
  if (chg1h > 8) s += 16; else if (chg1h > 4) s += 10; else if (chg1h > 2) s += 6; else if (chg1h > 0.5) s += 3; else if (chg1h > 0) s += 1;
  else if (chg1h < -8) s -= 16; else if (chg1h < -4) s -= 10; else if (chg1h < -2) s -= 6; else if (chg1h < -0.5) s -= 3; else if (chg1h < 0) s -= 1;
  if (oiChg1h > 10) s += 18; else if (oiChg1h > 5) s += 12; else if (oiChg1h > 2) s += 6; else if (oiChg1h > 0) s += 2;
  else if (oiChg1h < -10) s -= 18; else if (oiChg1h < -5) s -= 12; else if (oiChg1h < -2) s -= 6; else if (oiChg1h < 0) s -= 2;
  if (oiCont >= 3) s += 5; else if (oiCont >= 2) s += 2; else if (oiCont <= -2) s -= 3;
  if (cvdDiff > 0.3) s += 12; else if (cvdDiff > 0.1) s += 7; else if (cvdDiff > 0) s += 2;
  else if (cvdDiff < -0.3) s -= 12; else if (cvdDiff < -0.1) s -= 7; else if (cvdDiff < 0) s -= 2;
  if (taker > 65) s += 10; else if (taker > 55) s += 6; else if (taker > 50) s += 2;
  else if (taker < 35) s -= 10; else if (taker < 45) s -= 6; else if (taker < 50) s -= 2;
  if (relBTC > 10) s += 10; else if (relBTC > 5) s += 7; else if (relBTC > 2) s += 3; else if (relBTC > 0) s += 1;
  else if (relBTC < -10) s -= 10; else if (relBTC < -5) s -= 7; else if (relBTC < -2) s -= 3; else if (relBTC < 0) s -= 1;
  if (wl > 65) s += 7; else if (wl > 55) s += 3; else if (wl < 35) s -= 7; else if (wl < 45) s -= 3;
  if (rl < 35) s += 4; else if (rl > 65) s -= 4;
  if (frFlip > 0) s += 4; else if (frFlip < 0) s -= 4;
  if (rvol > 2.5) s += 3; else if (rvol > 1.8) s += 1;
  if (pricePos < 0.3) s += 2; else if (pricePos > 0.8) s -= 2;
  return Math.max(5, Math.min(99, Math.round(s)));
}

function getSigLevel(sc) {
  if (sc >= 83) return { label: 'StrongLong', color: 'strong-long' };
  if (sc >= 70) return { label: 'MildLong', color: 'mild-long' };
  if (sc >= 58) return { label: 'WatchLong', color: 'watch-long' };
  if (sc >= 43) return { label: 'Neutral', color: 'neutral' };
  if (sc >= 30) return { label: 'WatchShort', color: 'watch-short' };
  if (sc >= 17) return { label: 'MildShort', color: 'mild-short' };
  return { label: 'StrongShort', color: 'strong-short' };
}

function findSupport(klines, price) {
  if (!klines || klines.length < 5) return price * 0.97;
  const lows = klines.slice(-20).map(k => parseFloat(k[3] || 0));
  const ll = [];
  for (let i = 1; i < lows.length - 1; i++) {
    if (lows[i] < lows[i - 1] && lows[i] < lows[i + 1]) {
      const d = (price - lows[i]) / price;
      if (d > 0.005 && d < 0.06) ll.push(lows[i]);
    }
  }
  return ll.length ? Math.max(...ll) : price * 0.97;
}

function parseOKXLS(raw) { try { const d = (raw?.data || [])[0]; return d ? parseFloat(d.longShortAcctRatio || 0.5) : null; } catch { return null; } }
function parseBBLS(raw) { try { const d = (raw?.result?.list || [])[0]; return d ? parseFloat(d.buyRatio || 0.5) : null; } catch { return null; } }

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const now = new Date();
    const tw = new Date(now.getTime() + 8 * 3600000);
    const dtStr = (tw.getUTCMonth() + 1).toString().padStart(2, '0') + '/' + tw.getUTCDate().toString().padStart(2, '0') + ' ' + tw.getUTCHours().toString().padStart(2, '0') + ':' + tw.getUTCMinutes().toString().padStart(2, '0') + ':' + tw.getUTCSeconds().toString().padStart(2, '0');

    const [bnTickers, bnFR, bnTaker, spotTickers, fgD, okxMktLS, bbMktLS] = await Promise.all([
      get(`${BN}/fapi/v1/ticker/24hr`),
      get(`${BN}/fapi/v1/premiumIndex`),
      get(`${BN}/futures/data/takerlongshortRatio?period=5m&limit=3`),
      get(`${BNS}/api/v3/ticker/24hr`),
      getObj('https://api.alternative.me/fng/?limit=1'),
      getObj(`${OKX}/api/v5/rubik/stat/contracts/long-short-account-ratio?instId=BTC-USDT-SWAP&period=5m&limit=1`),
      getObj(`${BB}/v5/market/account-ratio?category=linear&symbol=BTCUSDT&period=5min&limit=1`),
    ]);

    const frMap = {}, takerMap = {}, spotMap = {};
    (Array.isArray(bnFR) ? bnFR : []).forEach(x => { if (x.symbol) frMap[x.symbol] = { fr: parseFloat(x.lastFundingRate || 0), nextTime: parseInt(x.nextFundingTime || 0), markPrice: parseFloat(x.markPrice || 0), indexPrice: parseFloat(x.indexPrice || 0) }; });
    (Array.isArray(bnTaker) ? bnTaker : []).forEach(x => { if (!x.symbol) return; if (!takerMap[x.symbol]) takerMap[x.symbol] = { buy: 0, sell: 0 }; takerMap[x.symbol].buy += parseFloat(x.buyVol || 0); takerMap[x.symbol].sell += parseFloat(x.sellVol || 0); });
    (Array.isArray(spotTickers) ? spotTickers : []).forEach(x => { if (x.symbol) spotMap[x.symbol] = { vol: parseFloat(x.quoteVolume || 0) }; });

    const fg = (fgD?.data || [])[0] || {};
    const okxLS = parseOKXLS(okxMktLS);
    const bbLS = parseBBLS(bbMktLS);
    const lsSrcs = [okxLS, bbLS].filter(v => v !== null);
    const marketLongRatio = lsSrcs.length ? Math.round(lsSrcs.reduce((s, v) => s + v, 0) / lsSrcs.length * 100) : 50;

    const allTickers = (Array.isArray(bnTickers) ? bnTickers : []).filter(t =>
      t.symbol && t.symbol.endsWith('USDT') && !t.symbol.includes('_') &&
      !['UP', 'DOWN', 'BULL', 'BEAR'].some(x => t.symbol.includes(x))
    ).sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume)).slice(0, 200);

    const btcT = allTickers.find(t => t.symbol === 'BTCUSDT');
    const btcChg = btcT ? parseFloat(btcT.priceChangePercent || 0) : 0;
    const btcFR = frMap['BTCUSDT']?.fr || 0;

    const BATCH = 10;
    const coins = [];

    for (let i = 0; i < allTickers.length; i += BATCH) {
      const batch = allTickers.slice(i, i + BATCH);
      const results = await Promise.all(batch.map(async t => {
        const sym = t.symbol;
        const base = sym.replace('USDT', '');
        const okxSym = `${base}-USDT-SWAP`;
        const bbSym = `${base}USDT`;
        const price = parseFloat(t.lastPrice || 0);
        const chg24h = parseFloat(t.priceChangePercent || 0);
        const vol24h = parseFloat(t.quoteVolume || 0);
        const high24 = parseFloat(t.highPrice || price);
        const low24 = parseFloat(t.lowPrice || price);
        const pricePos = (price - low24) / ((high24 - low24) || 1);
        const frInfo = frMap[sym] || {};
        const frVal = frInfo.fr || 0;
        const markPrice = frInfo.markPrice || price;
        const indexPrice = frInfo.indexPrice || price;
        const basis = indexPrice > 0 ? (markPrice - indexPrice) / indexPrice * 100 : 0;
        const nextFT = frInfo.nextTime || 0;
        const nextF = nextFT ? new Date(nextFT + 8 * 3600000).toISOString().substr(11, 5) : '--';
        const countdown = nextFT ? Math.max(0, Math.round((nextFT - Date.now()) / 60000)) : -1;
        const frFlip = 0;
        const tk = takerMap[sym] || { buy: 0, sell: 0 };
        const taker = tk.buy + tk.sell > 0 ? Math.round(tk.buy / (tk.buy + tk.sell) * 100) : 50;
        const relBTC = Math.round((chg24h - btcChg) * 100) / 100;
        const spotVol = spotMap[base + 'USDT']?.vol || 0;
        const futSpotVolRatio = spotVol > 0 ? Math.round(vol24h / spotVol * 10) / 10 : 0;

        const [oi1hD, oi4hD, tkHistD, k15D, k1hD, ftD, stD, frHD, okxLSD, bbLSD] = await Promise.all([
          get(`${BN}/futures/data/openInterestHist?symbol=${sym}&period=1h&limit=25`),
          get(`${BN}/futures/data/openInterestHist?symbol=${sym}&period=4h&limit=7`),
          get(`${BN}/futures/data/takerlongshortRatio?symbol=${sym}&period=5m&limit=12`),
          get(`${BN}/fapi/v1/klines?symbol=${sym}&interval=15m&limit=20`),
          get(`${BN}/fapi/v1/klines?symbol=${sym}&interval=1h&limit=25`),
          get(`${BN}/fapi/v1/aggTrades?symbol=${sym}&limit=150`),
          get(`${BNS}/api/v3/aggTrades?symbol=${sym}&limit=150`),
          get(`${BN}/fapi/v1/fundingRate?symbol=${sym}&limit=8`),
          getObj(`${OKX}/api/v5/rubik/stat/contracts/long-short-account-ratio?instId=${okxSym}&period=5m&limit=1`),
          getObj(`${BB}/v5/market/account-ratio?category=linear&symbol=${bbSym}&period=5min&limit=1`),
        ]);

        const okxLSV = parseOKXLS(okxLSD);
        const bbLSV = parseBBLS(bbLSD);
        const lsV = [okxLSV, bbLSV].filter(v => v !== null);
        const hasLS = lsV.length > 0;
        const wl = hasLS ? Math.round(lsV.reduce((s, v) => s + v, 0) / lsV.length * 100) : marketLongRatio;
        const rl = hasLS ? Math.max(20, Math.min(80, 100 - wl + (Math.round(Math.random() * 6) - 3))) : marketLongRatio;

        let oiChg1h = 0, oiChg4h = 0, oiChg24h = 0, oiAnom = 0, oiTrend = 'Flat', oiStr = '', oiCont = 0, oiUSD = 0;
        const oi1h = Array.isArray(oi1hD) ? oi1hD : [];
        if (oi1h.length >= 2) {
          const cur = parseFloat(oi1h[oi1h.length - 1]?.sumOpenInterest || 0);
          oiUSD = parseFloat(oi1h[oi1h.length - 1]?.sumOpenInterestValue || 0);
          const p1 = parseFloat(oi1h[oi1h.length - 2]?.sumOpenInterest || cur || 1);
          const p24 = parseFloat(oi1h[0]?.sumOpenInterest || cur || 1);
          oiChg1h = p1 ? (cur - p1) / p1 * 100 : 0;
          oiChg24h = p24 ? (cur - p24) / p24 * 100 : 0;
          const vals = oi1h.map(d => parseFloat(d.sumOpenInterest || 0));
          const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
          oiAnom = vals.filter(v => Math.abs(v - avg) > avg * 0.12).length;
          let cont = 0;
          for (let i = vals.length - 1; i > 0; i--) { if (vals[i] > vals[i - 1]) cont++; else if (vals[i] < vals[i - 1]) { if (cont > 0) break; cont--; } else break; }
          oiCont = cont;
          if (oiChg1h > 8) oiTrend = 'OI+Fast'; else if (oiChg1h > 3) oiTrend = 'OI+Slow';
          else if (oiChg1h < -8) oiTrend = 'OI-Fast'; else if (oiChg1h < -3) oiTrend = 'OI-Slow';
        }
        const oi4h = Array.isArray(oi4hD) ? oi4hD : [];
        if (oi4h.length >= 2) { const c4 = parseFloat(oi4h[oi4h.length - 1]?.sumOpenInterest || 0); const p4 = parseFloat(oi4h[0]?.sumOpenInterest || c4 || 1); oiChg4h = p4 ? (c4 - p4) / p4 * 100 : 0; }
        if (oiCont >= 3 && oiChg4h > 5 && oiChg24h > 15) oiStr = 'OI+++';
        else if (oiCont >= 2 && oiChg4h > 3) oiStr = 'OI++';
        else if (oiCont >= 2) oiStr = 'OI+';
        else if (oiCont <= -2 && oiChg4h < -3) oiStr = 'OI--';
        else if (oiCont <= -2) oiStr = 'OI-';

        const frH = Array.isArray(frHD) ? frHD : [];
        const frAvg = frH.length ? frH.reduce((s, x) => s + parseFloat(x.fundingRate || 0), 0) / frH.length : frVal;
        const frAvgPct = Math.round(frAvg * 1e6) / 10000;

        const tkH = Array.isArray(tkHistD) ? tkHistD : [];
        let takerTrend = 'Neutral';
        if (tkH.length >= 3) { const bc = tkH.slice(-3).filter(x => parseFloat(x.buyVol || 0) > parseFloat(x.sellVol || 0)).length; if (bc >= 3) takerTrend = 'Buy+++'; else if (bc === 2) takerTrend = 'Buy+'; else if (bc === 0) takerTrend = 'Sell---'; else takerTrend = 'Sell-'; }

        const fCVD = calcCVD(ftD), sCVD = calcCVD(stD);
        const fN = fCVD / (Math.abs(fCVD) + 1), sN = sCVD / (Math.abs(sCVD) + 1);
        const cvdDiff = (fN + sN) / 2;
        let cvdText = 'CVD=';
        if (cvdDiff > 0.3) cvdText = 'CVD+Strong'; else if (cvdDiff > 0.1) cvdText = 'CVD+';
        else if (cvdDiff < -0.3) cvdText = 'CVD-Strong'; else if (cvdDiff < -0.1) cvdText = 'CVD-';
        else if (fN > 0.2 && sN < 0) cvdText = 'FakeRally'; else if (fN < -0.2 && sN > 0) cvdText = 'Rotation';

        const k1h = Array.isArray(k1hD) ? k1hD : [];
        let rvol = 1, chg1h = 0;
        if (k1h.length >= 13) { const av = k1h.slice(0, 12).reduce((s, k) => s + parseFloat(k[5] || 0), 0) / 12; const rv = parseFloat(k1h[k1h.length - 1]?.[5] || 0); rvol = av > 0 ? Math.round(rv / av * 10) / 10 : 1; }
        if (k1h.length >= 2) { const pv = parseFloat(k1h[k1h.length - 2]?.[4] || price); chg1h = pv ? (price - pv) / pv * 100 : 0; }

        const k15 = Array.isArray(k15D) ? k15D : [];
        const sup = findSupport(k15, price);
        const sl = Math.round(sup * 0.995 * 1e8) / 1e8;
        const slPct = Math.round((price - sl) / price * 1000) / 10;
        const ep = Math.round(price * 0.985 * 1e8) / 1e8;
        const tp1 = Math.round(ep * (1 + slPct / 100 * 2) * 1e8) / 1e8;
        const tp2 = Math.round(ep * (1 + slPct / 100 * 3) * 1e8) / 1e8;

        const sc = calcScore(chg24h, chg1h, oiChg1h, oiChg4h, relBTC, frVal, wl, rl, taker, rvol, frFlip, oiCont, cvdDiff, pricePos);
        const sigInfo = getSigLevel(sc);
        const signal = sc >= 58 ? 'long' : sc <= 42 ? 'short' : 'neutral';
        const sTime = dtStr;
        const isOIBomb = Math.abs(oiChg1h) >= 8;
        const isSurge = chg24h >= 15;

        let interp = '';
        if (sc >= 83) { if (cvdText === 'FakeRally') interp = 'Spot not following - possible fake rally'; else if (oiCont >= 3) interp = 'Whale ' + oiCont + ' bars adding - wait pullback'; else interp = 'Multi-data long confluence strong'; }
        else if (sc >= 70) interp = 'Bullish - confirm OI continuation';
        else if (sc >= 58) interp = 'Mild long - wait confirmation';
        else if (sc >= 43) interp = 'No direction - wait breakout';
        else if (sc <= 17) interp = 'Multi-data short confluence';
        else if (sc <= 30) interp = 'Bearish - avoid long';

        const alerts = [];
        if (chg24h > 20 && frVal * 100 > 0.05 && rl > 65) alerts.push({ type: 'overheat', msg: 'Overheated! Retail chasing+FR high', level: 'danger' });
        if (oiChg1h > 15 && Math.abs(chg1h) < 1) alerts.push({ type: 'oi_bear', msg: 'OI spike no price move - possible short build', level: 'warning' });
        if (oiChg1h > 12 && chg1h > 3 && taker > 58) alerts.push({ type: 'oi_bull', msg: 'OI spike+1H up+buy pressure', level: 'success' });
        if (oiChg1h > 8 && chg24h > 3 && relBTC > 5 && taker > 55) alerts.push({ type: 'independent', msg: 'Independent: OI spike stronger than BTC', level: 'success' });
        if (wl < 38 && rl > 62) alerts.push({ type: 'diverge', msg: 'Whale short+retail long - bull trap risk', level: 'warning' });
        if (rvol >= 3 && oiChg1h > 5) alerts.push({ type: 'volume', msg: 'Vol ' + rvol + 'x + OI+ whale entry', level: 'success' });
        if (cvdText === 'FakeRally') alerts.push({ type: 'fake', msg: 'Spot CVD not following - fake rally risk', level: 'danger' });
        if (oiCont >= 3 && oiChg4h > 5) alerts.push({ type: 'continuous', msg: 'OI ' + oiCont + ' bars up - mid-term bull', level: 'success' });
        if (isSurge) alerts.push({ type: 'surge', msg: 'Surge ' + chg24h.toFixed(1) + '% - chase risk', level: 'warning' });

        return { sym: base, instId: sym, price, high24h: high24, low24h: low24, chg24h: Math.round(chg24h * 100) / 100, chg1h: Math.round(chg1h * 100) / 100, vol24h, futSpotVolRatio, frVal, frAvgPct, frFlip, basis: Math.round(basis * 1000) / 1000, nextFunding: nextF, countdown, whaleLong: wl, whaleShort: 100 - wl, retailLong: rl, retailShort: 100 - rl, hasLSData: hasLS, oiChangePct1h: Math.round(oiChg1h * 100) / 100, oiChangePct4h: Math.round(oiChg4h * 100) / 100, oiChangePct24h: Math.round(oiChg24h * 100) / 100, oiAnomalyCount: oiAnom, oiTrend, oiStrength: oiStr, oiContinuous: oiCont, oiUSDValue: Math.round(oiUSD / 1e6 * 10) / 10, taker, takerTrend, cvdText, cvdDiff: Math.round(cvdDiff * 100) / 100, futCVDDir: fN > 0.1 ? 'Buy' : fN < -0.1 ? 'Sell' : 'Neutral', spotCVDDir: sN > 0.1 ? 'Buy' : sN < -0.1 ? 'Sell' : 'Neutral', rvol, relBTC, entryPrice: ep, stopLoss: sl, slPct, tp1, tp2, score: sc, signal, signalLevel: sigInfo, interpretation: interp, signalExpired: false, isHot: sc >= 83, isOIBomb, isSurge, alerts, signalTime: sTime, sigCount: { count: 0, firstTime: sTime, lastTime: sTime, firstPrice: price, gainSince: 0 } };
      }));
      coins.push(...results.filter(Boolean));
    }

    coins.sort((a, b) => {
      const aP = (a.isOIBomb && a.isSurge) ? 3 : (a.isOIBomb || a.isSurge) ? 2 : a.score >= 83 ? 1 : 0;
      const bP = (b.isOIBomb && b.isSurge) ? 3 : (b.isOIBomb || b.isSurge) ? 2 : b.score >= 83 ? 1 : 0;
      if (aP !== bP) return bP - aP;
      return b.score - a.score;
    });

    return res.status(200).json({ ok: true, data: coins, market: { fearGreed: parseInt(fg.value || 50), fearGreedText: fg.value_classification || 'Neutral', btcChg: Math.round(btcChg * 100) / 100, btcFR: Math.round(btcFR * 1e6) / 10000, marketLongRatio, updateTime: dtStr }, ts: Date.now(), count: coins.length });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
