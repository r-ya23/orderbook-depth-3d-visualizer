export const getBinanceSymbols = async () => {
  const response = await fetch("https://api.binance.com/api/v3/exchangeInfo");
  const json = await response.json();
  const filteredsymbols = json?.symbols.filter((s: any) => s.status == "TRADING");
  return filteredsymbols;
  console.log("symbols", filteredsymbols);
};
