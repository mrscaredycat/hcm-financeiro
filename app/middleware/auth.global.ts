export default defineNuxtRouteMiddleware(async (to, from) => {
  const user = await getCurrentUser()

  // Se o usuário tentar acessar qualquer página que não seja login sem estar autenticado
  if (!user && to.path !== '/login') {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Se o usuário estiver autenticado e tentar acessar login, manda pra index
  if (user && to.path === '/login') {
    return navigateTo('/')
  }
})
