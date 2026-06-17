const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  const filial = '200';
  const codAgente = '6084';
  const dtInicial = '2026-01-01T00:00:00';
  const dtFinal = '2026-12-31T23:59:59';
  
  const endpoints = [
    // Endpoint atual usado na ficha.get.ts
    `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Filial/${filial}/${dtInicial}/${dtFinal}?expand=agente&codAgente=${codAgente}&pageSize=10`,
    // Sem filial no path, mas passando no OData filter? (Mega não usa OData puro às vezes)
    `/api/FinanceiroMovimentacao/FaturaPagar/SaldoEmAberto/2000-01-01/2026-12-31?expand=agente&pageSize=50`,
    // Outro endpoint que tentamos antes no Postman (Agente no path)
    `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/${codAgente}/2026-01-01/2026-12-31?expand=agente&pageSize=10`
  ];
  
  for (const ep of endpoints) {
    try {
      console.log('\nFetching:', ep.split('?')[0]);
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(15000)
      });
      const text = await r.text();
      console.log('Status:', r.status);
      if (r.ok) {
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : (data?.value ?? data?.items ?? []);
        console.log(`Retornou ${items.length} itens.`);
        if (items.length > 0) {
          console.log(`Primeiro Agente Codigo: ${items[0].Agente?.Codigo || items[0].agente?.Codigo}`);
        }
      } else {
        console.log('Error Body:', text.substring(0, 100));
      }
    } catch(e) { console.log('ERR:', e.message); }
  }
})().catch(console.error);
