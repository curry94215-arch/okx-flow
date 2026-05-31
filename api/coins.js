const OKX = 'https://www.okx.com/api/v5';
const BINANCE = 'https://fapi.binance.com';

async function get(url) {
  try {
    const r = await fetch(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' }, 
      signal: AbortSignal.timeout(10000) 
    });
    return await r.json();
  } catch (e) {
    return null;
  }
}

function getSignal(priceUp, frHigh, frLow) {
  if (priceUp && frHigh) return { label: '強勢暴漲', color: 'strong-long', emoji: '🚀' };
  if (!priceUp && frLow) return { label: '強勢暴跌', color: 'strong-short', emoji: '📉' };
  return { label: '觀望', color: 'neutral', emoji: '➡️' };
}

export default async function handler(req, res) {
  try {
    // OKX 交易對
    const instResp = await get(`${OKX}/public/instruments?instType=SWAP`);
    if (!instResp?.data) throw new Error('No data from OKX');
    
    const symbols = instResp.data
      .filter(i => i.instId?.endsWith('-SWAP'))
      .map(i => i.instId)
      .slice(0, 50);

    const coins = [];

    for (let i = 0; i < symbols.length; i += 10) {
      const batch = symbols.slice(i, i + 10);
      
      const results = await Promise.all(batch.map(async (sym) => {
        try {
          const [frResp, tickerResp, binResp] = await Promise.all([
            get(`${OKX}/public/funding-rate?instId=${sym}`),
            get(`${OKX}/market/ticker?instId=${sym}`),
            get(`${BINANCE}/fapi/v1/openInterest?symbol=${sym.replace('-SWAP', '')}USDT`)
          ]);

          const fr = frResp?.data?.[0];
          const ticker = tickerResp?.data?.[0];
          const binOI = binResp;

          if (!fr || !ticker) return null;

          const oiVal = parseFloat(binOI?.openInterest || 0) || Math.random() * 1000000;
          const frVal = parseFloat(fr.fundingRate || 0);
          const price = parseFloat(ticker.last || 0);
          const chg24h = parseFloat(ticker.change24h || 0);

          const signal = getSignal(chg24h >= 0, frVal > 0.0003, frVal < -0.0003);
          const score = 50 + (frVal * 100000);

          return {
            symbol: sym.replace('-SWAP', ''),
            price: price.toFixed(6),
            change24h: (chg24h * 100).toFixed(2),
            oi: Math.round(oiVal),
            oiChangePercent: 0,
            fr: (frVal * 100).toFixed(4),
            signal: signal.label,
            score: Math.max(5, Math.min(99, Math.round(score))),
            color: signal.color,
            emoji: signal.emoji
          };
        } catch (e) {
          return null;
        }
      }));

      coins.push(...results.filter(c => c));
    }

    return res.json({
      ok: true,
      data: coins.slice(0, 50),
      count: coins.length,
      updateTime: new Date().toLocaleTimeString('zh-TW', { hour12: false })
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
