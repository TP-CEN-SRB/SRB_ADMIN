

const AuthLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return <div className="bg-(--pastel-green)">{children}</div>
}

export default AuthLayout
