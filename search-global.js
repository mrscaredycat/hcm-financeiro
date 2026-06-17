const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const urls = [
    '/api/FinanceiroMovimentacao/FaturaPagar/Saldo/2026-01-01/2026-12-31?expand=agente&pageSize=5000',
    '/api/FinanceiroMovimentacao/FaturaReceber/Saldo/2026-01-01/2026-12-31?expand=agente&pageSize=5000'
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
        console.log(`  -> ${items.length} itens.`);
        const matches = items.filter(i => String(i.Agente?.Codigo) === '6253' || String(i.agente?.Codigo) === '6253');
        console.log(`  -> Qtd 6253: ${matches.length}`);
      } else {
        console.log('  -> Erro HTTP:', r.status);
      }
    } catch(e) {
      console.log('  -> Timeout/Error');
    }
  }
})().catch(console.error);
