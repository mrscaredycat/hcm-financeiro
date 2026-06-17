const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const cod = '6253';
  for (let year = 2026; year >= 2020; year--) {
    const urls = [
      `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/${cod}/${year}-01-01/${year}-12-31`,
      `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/${cod}/${year}-01-01/${year}-12-31`
    ];
    for (const ep of urls) {
      try {
        const r = await fetch('https://rest.megaerp.online' + ep, {
          headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        if (r.ok) {
          const d = await r.json();
          const items = Array.isArray(d) ? d : (d.items || d.value || []);
          if (items.length > 0) {
            console.log(`✅ Ano ${year}: encontrou ${items.length} itens no endpoint ${ep.includes('Pagar') ? 'Pagar' : 'Receber'}`);
          }
        } else {
           console.log(`❌ Ano ${year}: erro ${r.status}`);
        }
      } catch(e) {}
    }
  }
})().catch(console.error);
