const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  const endpoints = [
    '/api/globalagente/Agente?tipo=ContaFinanceira&pageSize=10',
    "/api/globalagente/Agente?$filter=tipo eq 'ContaFinanceira'&pageSize=10",
    "/api/globalagente/Agente?$filter=Tipos/any(t: t/Tipo eq 'ContaFinanceira')&pageSize=10",
    "/api/globalagente/Agente?expand=tipos&$filter=tipos/any(t: t/tipo eq 'ContaFinanceira')&pageSize=10"
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(10000)
      });
      const text = await r.text();
      console.log(ep.substring(0, 80), '->', r.status);
      if (r.ok) console.log(text.substring(0, 300));
    } catch(e) { console.log(ep.substring(0, 80), '-> ERR:', e.message); }
  }
})().catch(console.error);
