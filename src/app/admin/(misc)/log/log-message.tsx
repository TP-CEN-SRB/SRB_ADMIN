"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface ParsedLog {
  label: string
  fields: [string, string][]
}

// The kiosk's buffered console rows (material detections, weight readings)
// arrive flattened, e.g.
//   [kiosk eabc24b6] [MATERIAL DETECTIONS] id=1 time=17:14:35 material=plastic
// so they can be searched as plain text on this page. Re-expanding them here
// restores the console.table view they have on the kiosk itself.
//
// Returns null for anything that isn't a pure key=value payload - one-off
// state changes ("paper bin controller connected") stay plain text rather
// than being forced into a table.
function parseStructured(message: string): ParsedLog | null {
  const match = message.match(/^(?:\[kiosk[^\]]*\]\s+)?\[([A-Z][A-Z ]+)\]\s+(.+)$/)
  if (!match) return null

  const [, label, rest] = match
  const fields: [string, string][] = []

  for (const token of rest.split(" ").filter(Boolean)) {
    const equals = token.indexOf("=")
    // A token without "=" means this is prose, not a measurement row.
    if (equals <= 0) return null
    fields.push([token.slice(0, equals), token.slice(equals + 1)])
  }

  // A single field isn't worth a table.
  return fields.length >= 2 ? { label, fields } : null
}

export function LogMessage({ message }: { message: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const parsed = parseStructured(message)

  if (!parsed) {
    return <span className="text-xs whitespace-pre-wrap wrap-break-word">{message}</span>
  }

  // id/time are in the expanded table; the collapsed line leads with the
  // values actually worth scanning (material, confidence, grams).
  const summary = parsed.fields
    .filter(function ([field]) { return field !== "id" && field !== "time" })
    .map(function ([, value]) { return value })
    .join(" · ")

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={function () { setIsOpen(!isOpen) }}
        className="flex items-center gap-1 text-left hover:opacity-80"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 shrink-0" />
        )}
        <span className="text-xs font-medium">{parsed.label}</span>
        <span className="text-xs text-muted-foreground">{summary}</span>
      </button>

      {isOpen ? (
        <table className="ml-4 w-fit border-collapse text-xs">
          <tbody>
            {parsed.fields.map(function ([field, value]) {
              return (
                <tr key={field} className="border-b border-border/50 last:border-0">
                  <td className="py-0.5 pr-6 capitalize text-muted-foreground">{field}</td>
                  <td className="py-0.5 font-mono">{value}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : null}
    </div>
  )
}
