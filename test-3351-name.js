const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const r = await fetch('https://rest.megaerp.online/api/globalagente/Agente/1-3351?expand=tipos', {
    headers: { 'Authorization': 'Bearer ' + accessToken }
  });
  if (r.ok) {
    const d = await r.json();
    console.log(JSON.stringify(d, null, 2));
  }
})().catch(console.error);
