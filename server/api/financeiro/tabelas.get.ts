import { fetchExternalApi } from '#imports'

export default defineEventHandler(async () => {
  try {
    // No Insomnia o id era "1-2555", então o formato é "TAB-CODIGO"
    // Testamos com 1-6924 (tab=1, codigo=6924)
    const res = await fetchExternalApi('/api/globalagente/Agente/1-6924')
    
    const text = await res.text()
    
    return {
      status: res.status,
      ok: res.ok,
      body: text.substring(0, 1000) // primeiros 1000 chars da resposta
    }
  } catch (error) {
    return { erro: String(error) }
  }
})
