const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  const codes = ['1001', '1098', '1099', '2534', '2535', '6658', '6520', '7298', '7323', '6084'];
  
  for (const cod of codes) {
    const urls = [
      `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/${cod}/2026-01-01/2026-12-31?pageSize=1000`,
      `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/${cod}/2026-01-01/2026-12-31?pageSize=1000`,
      // just in case they need 1- prefix
      `/api/FinanceiroMovimentacao/FaturaPagar/Saldo/Agente/1-${cod}/2026-01-01/2026-12-31?pageSize=1000`,
      `/api/FinanceiroMovimentacao/FaturaReceber/Saldo/Agente/1-${cod}/2026-01-01/2026-12-31?pageSize=1000`
    ];

    for (const ep of urls) {
      try {
        const r = await fetch('https://rest.megaerp.online' + ep, {
          headers: { 'Authorization': 'Bearer ' + accessToken },
          signal: AbortSignal.timeout(6000)
        });
        if (r.ok) {
          const d = await r.json();
          const items = Array.isArray(d) ? d : (d.items || d.value || []);
          if (items.length > 0) {
            console.log(`✅ [${cod}] Encontrou ${items.length} itens no endpoint: ${ep.split('?')[0]}`);
            
            // Check for 3500.00
            const tem3500 = items.some(i => Number(i.ValorParcela || i.Valor || 0) === 3500);
            if (tem3500) console.log(`   -> ACHEI O VALOR DE 3500.00 NESTE ENDPOINT!`);
          }
        }
      } catch(e) {}
    }
  }
})().catch(console.error);
