const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const endpoints = [
    '/api/FinanceiroMovimentacao/FaturaPagar/SaldoEmAberto/2000-01-01/2026-12-31?pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaReceber/SaldoEmAberto/2000-01-01/2026-12-31?pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Filial/200/2000-01-01/2026-12-31?pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Filial/200/2000-01-01/2026-12-31?pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Filial/100/2000-01-01/2026-12-31?pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Filial/100/2000-01-01/2026-12-31?pageSize=5000'
  ];

  for (const ep of endpoints) {
    try {
      console.log('Fetching', ep.split('?')[0]);
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      if (r.ok) {
        const d = await r.json();
        const items = Array.isArray(d) ? d : (d.items || d.value || []);
        console.log(`  -> ${items.length} itens encontrados.`);
        const matches = items.filter(i => {
           const v = Number(i.ValorParcela || i.Valor || 0);
           return v === 3500 || v === 500;
        });
        if (matches.length > 0) {
           console.log(`  -> ACHOU VALOR 3500 OU 500!`);
           console.log(`  -> Agente:`, matches[0].Agente?.Codigo || matches[0].agente?.Codigo, matches[0].Agente?.NomeFantasia || matches[0].agente?.NomeFantasia);
           console.log(`  -> Filial:`, matches[0].Filial?.Codigo || matches[0].filial?.Codigo);
           console.log(`  -> Data:`, matches[0].DataVencimento || matches[0].DataEmissao);
        }
      }
    } catch(e) {}
  }
})().catch(console.error);
