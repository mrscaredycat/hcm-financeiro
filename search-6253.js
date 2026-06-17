const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const cod = '6253';
  const urls = [
    '/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Filial/200/2000-01-01/2026-12-31?expand=agente&pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Filial/200/2000-01-01/2026-12-31?expand=agente&pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Filial/100/2000-01-01/2026-12-31?expand=agente&pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Filial/100/2000-01-01/2026-12-31?expand=agente&pageSize=5000'
  ];

  for (const ep of urls) {
    try {
      console.log('Fetching', ep.split('?')[0]);
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(10000)
      });
      if (r.ok) {
        const d = await r.json();
        const items = Array.isArray(d) ? d : (d.items || d.value || []);
        console.log(`  -> ${items.length} itens encontrados.`);
        const matches = items.filter(i => String(i.Agente?.Codigo) === cod || String(i.agente?.Codigo) === cod);
        if (matches.length > 0) {
           console.log(`  -> ACHOU AGENTE 6253 NESTE ENDPOINT! Qtd: ${matches.length}`);
           console.log(`  ->`, matches[0]);
        }
      }
    } catch(e) {}
  }
})().catch(console.error);
