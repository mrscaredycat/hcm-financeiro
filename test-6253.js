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
    `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/${cod}/2026-01-01/2026-12-31?pageSize=100`,
    `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/${cod}/2026-01-01/2026-12-31?pageSize=100`,
    `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/1-${cod}/2026-01-01/2026-12-31?pageSize=100`,
    `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/1-${cod}/2026-01-01/2026-12-31?pageSize=100`,
    `/api/FinanceiroMovimentacao/FaturaPagar/SaldoEmAberto/2000-01-01/2026-12-31?expand=agente&pageSize=5000`
  ];

  for (const ep of urls) {
    try {
      console.log('Testing:', ep.split('?')[0]);
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(6000)
      });
      const d = await r.json();
      const items = Array.isArray(d) ? d : (d.items || d.value || []);
      console.log(`  -> Status: ${r.status} | Itens: ${items.length}`);
      if (items.length > 0 && ep.includes('SaldoEmAberto')) {
        const has6253 = items.some(i => (i.Agente?.Codigo == cod || i.agente?.Codigo == cod));
        console.log(`  -> SaldoEmAberto tem 6253? ${has6253}`);
      }
    } catch(e) {
      console.log('  -> Error:', e.message);
    }
  }
})().catch(console.error);
