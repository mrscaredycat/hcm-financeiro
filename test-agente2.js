const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  const endpoints = [
    '/api/globalagente/Agentes?pageSize=5',
    '/api/globalagente/AgenteLista?pageSize=5',
    '/api/financeirocadastros/ContasCorrentes?pageSize=5',
    '/api/FinanceiroMovimentacao/Conta?pageSize=5',
    '/api/Financeiro/Bancos?pageSize=5',
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      console.log(ep.substring(0, 50), '->', r.status, text.substring(0, 100));
    } catch(e) { console.log(ep.substring(0, 50), '-> ERR:', e.message); }
  }
})().catch(console.error);
