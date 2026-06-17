const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  console.log('Hoje:', hoje);
  
  // Tenta SaldoEmAberto com datas de 2000 a hoje
  const endpoints = [
    `/api/FinanceiroMovimentacao/FaturaReceber/SaldoEmAberto/2000-01-01/${hoje}?expand=agente&pageSize=5`,
    `/api/FinanceiroMovimentacao/FaturaReceber/SaldoEmAberto/2000-01-01T00:00:00/${hoje}T23:59:59?expand=agente&pageSize=5`,
    `/api/FinanceiroMovimentacao/FaturaReceber/SaldoEmAberto/2000-01-01T00:00:00/${hoje}T23:59:59?expand=string&pageSize=5`,
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(15000)
      });
      const text = await r.text();
      console.log('\n--- ENDPOINT:', ep.substring(0, 100));
      console.log('Status:', r.status);
      if (r.ok) {
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : (data?.value ?? data?.items ?? []);
        console.log('Total itens:', items.length);
        if (items.length > 0) {
          const first = items[0];
          console.log('Primeiro item (keys):', Object.keys(first).join(', '));
          console.log('Agente do primeiro:', JSON.stringify(first.Agente || first.agente || 'n/a'));
        }
      } else {
        console.log('Body:', text.substring(0, 300));
      }
    } catch(e) { console.log('ERR:', e.message); }
  }
})().catch(console.error);
