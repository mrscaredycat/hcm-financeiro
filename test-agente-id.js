const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  // Usar o id que veio do SaldoEmAberto: "1-2531"
  const agentIds = ['1-2531', '2531', '1-2555'];
  
  for (const id of agentIds) {
    try {
      const r = await fetch(`https://rest.megaerp.online/api/globalagente/Agente/${id}?expand=tipos`, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(10000)
      });
      const text = await r.text();
      console.log(`\n--- Agente id=${id} -> Status:`, r.status);
      if (r.ok) {
        const data = JSON.parse(text);
        console.log('Nome:', data.Nome || data.nome);
        console.log('Tipos:', JSON.stringify(data.tipos || data.Tipos));
        console.log('Keys:', Object.keys(data).join(', '));
      } else {
        console.log('Body:', text.substring(0, 200));
      }
    } catch(e) { console.log('ERR:', e.message); }
  }
})().catch(console.error);
