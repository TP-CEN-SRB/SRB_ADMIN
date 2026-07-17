import Link from "next/link"


interface RedirectProps {
  href: string
  children: React.ReactNode
  disabled?: boolean
}

const FormRedirect = ({ href, children, disabled = false }: RedirectProps) => {
  return (
    <div className="flex justify-center mt-3">
      <Link
        className={`link-underline ${disabled ? "pointer-events-none" : ""}`}
        href={href}
      >
        {children}
      </Link>
    </div>
  )
}

export default FormRedirect
