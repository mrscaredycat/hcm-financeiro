const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();
  
  const hoje = new Date().toISOString().slice(0, 10);
  console.log('Hoje:', hoje);
  
  // Busca pagar + receber em aberto
  const endpoints = [
    `/api/FinanceiroMovimentacao/FaturaReceber/SaldoEmAberto/2000-01-01/${hoje}?expand=agente&pageSize=500`,
    `/api/FinanceiroMovimentacao/FaturaPagar/SaldoEmAberto/2000-01-01/${hoje}?expand=agente&pageSize=500`,
  ];
  
  const agentMap = {};
  
  for (const ep of endpoints) {
    try {
      const r = await fetch('https://rest.megaerp.online' + ep, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(30000)
      });
      const data = await r.json();
      const items = Array.isArray(data) ? data : (data?.value ?? data?.items ?? []);
      console.log(`\n${ep.split('?')[0].split('/').slice(-3).join('/')}: ${items.length} itens`);
      let novos = 0;
      for (const item of items) {
        const ag = item.Agente || item.agente;
        if (ag?.Codigo && ag?.Id && !agentMap[ag.Codigo]) {
          agentMap[ag.Codigo] = { ...ag, _id: ag.Id };
          novos++;
        }
      }
      console.log(`  -> ${novos} agentes novos`);
    } catch(e) { console.log('ERR:', e.message); }
  }
  
  const agentes = Object.values(agentMap);
  console.log(`\nTotal agentes únicos: ${agentes.length}`);
  
  // Busca detalhes dos primeiros 5 pelo globalagente
  console.log('\n--- Buscando detalhes dos primeiros 5 agentes ---');
  for (const ag of agentes.slice(0, 5)) {
    try {
      const r = await fetch(`https://rest.megaerp.online/api/globalagente/Agente/${ag._id}?expand=tipos`, {
        headers: { 'Authorization': 'Bearer ' + accessToken },
        signal: AbortSignal.timeout(10000)
      });
      if (r.ok) {
        const d = await r.json();
        const tipos = (d.tipos || []).map(t => t.tipo).join(', ');
        console.log(`  Cod ${d.codigo} | Nome: ${d.nome} | Tipos: ${tipos}`);
      } else {
        console.log(`  Cod ${ag.Codigo} -> HTTP ${r.status}`);
      }
    } catch(e) { console.log(`  Cod ${ag.Codigo} -> ERR: ${e.message}`); }
  }
})().catch(console.error);
