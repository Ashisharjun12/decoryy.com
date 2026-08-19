import { motion, useReducedMotion } from "framer-motion"
import { LoginHero } from "@/assets/silhouettes/login-hero"
import { LoginForm } from "@/components/blocks/login/login-form"
import { ModeToggle } from "@/components/ui/mode-toggle"

export function LoginPage() {
  const reduceMotion = useReducedMotion()
  const duration = reduceMotion ? 0 : 0.22

  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-muted lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <p className="font-heading text-lg font-medium tracking-tight">Decory</p>
          <p className="text-sm text-muted-foreground">Admin</p>
        </div>
        <LoginHero className="mx-auto h-auto w-auto max-w-md" />
        <p className="max-w-[28ch] text-sm text-muted-foreground">
          Manage the cities and pincodes Decory serves.
        </p>
      </div>

      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <motion.div
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-8 lg:hidden">
            <p className="font-heading text-lg font-medium tracking-tight">Decory</p>
            <p className="text-sm text-muted-foreground">Admin</p>
          </div>
          <LoginForm />
        </motion.div>
      </div>
    </div>
  )
}
