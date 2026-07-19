"use client"

import { useTimeout } from "@/hooks/use-timeout"
import { useEffect } from "react"
interface TimerRedirectProps {
  redirectTo: string
  delayInMs: number
  resetTimeInMs?: number
  resetCondition?: boolean
}
const TimerRedirect = ({
  redirectTo,
  delayInMs,
  resetTimeInMs = 30000, // default 30000 milliseconds
  resetCondition = false,
}: TimerRedirectProps) => {
  const { remainingTime, resetTimer } = useTimeout(delayInMs, redirectTo)
  useEffect(function(){
    if (resetCondition) {
      resetTimer(resetTimeInMs)
    }
  }, [resetCondition, resetTimeInMs, resetTimer])
  return (
    <div className="text-center">
      <p className="text-slate-600 font-semibold mt-4">
        Redirecting in
        <span className="text-green-500 text-xl"> {remainingTime}</span> seconds
      </p>
    </div>
  )
}

export default TimerRedirect
