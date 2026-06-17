const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  const hoje = new Date().toISOString().slice(0, 10);
  
  const ep = `/api/FinanceiroMovimentacao/FaturaReceber/SaldoEmAberto/2000-01-01/${hoje}?expand=agente&pageSize=5`;
  
  try {
    const r = await fetch('https://rest.megaerp.online' + ep, {
      headers: { 'Authorization': 'Bearer ' + accessToken },
      signal: AbortSignal.timeout(30000)
    });
    const data = await r.json();
    const items = Array.isArray(data) ? data : (data?.value ?? data?.items ?? []);
    if (items.length > 0) {
      console.log('Primeiro item Filial:', JSON.stringify(items[0].Filial || items[0].filial));
    } else {
      console.log('Nenhum item');
    }
  } catch(e) { console.log('ERR:', e.message); }
})().catch(console.error);
