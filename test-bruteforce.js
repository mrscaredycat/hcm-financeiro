const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
(async () => {
  const loginResp = await fetch('https://rest.megaerp.online/api/Auth/SignIn', {
    method: 'POST',
    headers: { 'tenantid': '0f6faa90-92f3-11f0-ad92-a17be13a0703', 'granttype': 'api', 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'hcm.api', password: '@Mudar123' })
  });
  const { accessToken } = await loginResp.json();

  console.log('Iniciando varredura 1..3000');
  const t0 = Date.now();
  const BATCH = 50;
  const maxCodigo = 3000;
  let contasFinanceiras = 0;

  for (let base = 1; base <= maxCodigo; base += BATCH) {
    const codigos = Array.from({ length: BATCH }, (_, i) => base + i).filter(c => c <= maxCodigo);
    const results = await Promise.all(codigos.map(async (cod) => {
      try {
        const r = await fetch(`https://rest.megaerp.online/api/globalagente/Agente/1-${cod}?expand=tipos`, {
          headers: { 'Authorization': 'Bearer ' + accessToken },
          signal: AbortSignal.timeout(5000)
        });
        if (!r.ok) return null;
        const d = await r.json();
        const tipos = (d.tipos || []).map(t => t.tipo || t.Tipo);
        if (tipos.includes('ContaFinanceira')) {
            console.log(`✅ [${cod}] ${d.nome}`);
            return 1;
        }
        return 0;
      } catch { return 0; }
    }));
    contasFinanceiras += results.reduce((a,b) => a + (b||0), 0);
  }
  
  console.log(`Tempo total: ${(Date.now()-t0)/1000}s`);
  console.log(`Contas financeiras encontradas: ${contasFinanceiras}`);
})().catch(console.error);
