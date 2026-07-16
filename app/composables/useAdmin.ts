export const useAdmin = () => {
  const user = useCurrentUser()

  const isAdmin = computed(() => {
    if (!user.value || !user.value.email) return false

    // Conta master hardcoded conforme solicitado
    const masterEmail = 'freitascaroline49@gmail.com'

    return user.value.email.toLowerCase() === masterEmail.toLowerCase()
  })

  return { isAdmin }
}
