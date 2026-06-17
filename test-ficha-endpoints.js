const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const codes = [1001, 1098, 1099, 2534, 2535, 6658, 6520, 7298, 7323];
  
  for (const cod of codes) {
    const id = `1-${cod}`;
    
    // Try Ficha Financeira endpoint if it exists
    const endpoints = [
      `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/${id}`,
      `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/${id}`,
      `/api/FinanceiroMovimentacao/FaturaPagar/Fatura?agente=${id}&pageSize=100`,
      `/api/FinanceiroMovimentacao/FaturaReceber/Fatura?agente=${id}&pageSize=100`,
      `/api/FinanceiroMovimentacao/MovimentoBancario/Agente/${id}`
    ];
    
    for (const ep of endpoints) {
      try {
        const r = await fetch('https://rest.megaerp.online' + ep, {
          headers: { 'Authorization': 'Bearer ' + accessToken }
        });
        if (r.ok) {
          const d = await r.json();
          const items = Array.isArray(d) ? d : (d.items || d.value || []);
          if (items.length > 0) {
            console.log(`[Agente ${cod}] Endpoint retornou ${items.length} itens: ${ep}`);
            console.log(JSON.stringify(items[0]).substring(0, 200));
          }
        }
      } catch(e) {}
    }
  }
})().catch(console.error);
