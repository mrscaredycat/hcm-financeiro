const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  console.log('=== Testando listagem de agentes ===');
  const listEndpoints = [
    '/api/globalagente/Agentes?pageSize=5',
    '/api/FinanceiroCadastros/Agente?pageSize=5',
    '/api/FinanceiroCadastros/Agentes?pageSize=5',
    '/api/Financeiro/Agente?pageSize=5',
    '/api/GlobalAgente/AgenteList?pageSize=5',
    '/api/GlobalAgente/AgenteGrid?pageSize=5'
  ];
  for (const ep of listEndpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(8000)
      });
      const text = await r.text();
      console.log(ep.substring(0,70), '->', r.status, text.substring(0, 80));
    } catch(e) { console.log(ep.substring(0,40), '-> ERR:', e.message); }
  }
})().catch(console.error);
