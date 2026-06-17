const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const hoje = new Date().toISOString().slice(0, 10);

  // Os bancos (ContaFinanceira) aparecem em outros endpoints - movimentações bancárias
  // Tenta vários endpoints que possam ter conta financeira como agente/conta
  const endpoints = [
    // FaturaPagar e FaturaReceber com SaldoEmAberto JÁ TESTAMOS (não aparece bancos)
    // Tentar endpoints de extrato / movimentação bancária
    `/api/FinanceiroMovimentacao/ExtratoFinanceiro?pageSize=5`,
    `/api/FinanceiroMovimentacao/ExtratoFinanceiro/Filial/100/2025-01-01/${hoje}?pageSize=5`,
    `/api/FinanceiroMovimentacao/Extrato/Filial/100/2025-01-01/${hoje}?pageSize=5`,
    `/api/FinanceiroMovimentacao/MovimentacaoFinanceira?pageSize=5`,
    `/api/FinanceiroMovimentacao/MovimentacaoFinanceira/Filial/100/2025-01-01/${hoje}?pageSize=5`,
    `/api/FinanceiroMovimentacao/ExtratoContaFinanceira?pageSize=5`,
    `/api/FinanceiroMovimentacao/SaldoContaFinanceira?pageSize=5`,
    `/api/FinanceiroMovimentacao/ContaFinanceira?pageSize=5`,
    `/api/FinanceiroMovimentacao/ContaFinanceira/Saldo?pageSize=5`,
    `/api/FinanceiroMovimentacao/SaldoContaFinanceira/Filial/100/${hoje}?pageSize=5`,
    // Talvez com "Agente" no path
    `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/1001/2025-01-01/${hoje}?expand=agente&pageSize=5`,
    `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/1001/2025-01-01/${hoje}?expand=agente&pageSize=5`,
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(10000)
      });
      const text = await r.text();
      const label = ep.replace('https://rest.megaerp.online', '').split('?')[0];
      console.log(label, '->', r.status, r.ok ? text.substring(0, 80) : '');
    } catch(e) { console.log(ep.split('/').slice(-2).join('/'), '-> ERR:', e.message.substring(0, 40)); }
  }
})().catch(console.error);
