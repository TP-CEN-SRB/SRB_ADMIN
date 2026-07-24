"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useTransition } from "react"

const SEARCH_DEBOUNCE_MS = 400

type PageDirection = "start" | "prev" | "next" | "end"

interface UseTableQueryParamsArgs {
  currentPage: number
  totalPages: number
}

// Shared URL-search-param plumbing for admin data-table headers: pagination,
// limit, single-select sort, comma-joined multi-select filters, and search —
// every header under src/app/admin/**/header.tsx wires these the same way,
// only the filter option lists and dropdown JSX differ per page.
export function useTableQueryParams({ currentPage, totalPages }: UseTableQueryParamsArgs) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(function () {
    return function () {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    }
  }, [])

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString())
    mutate(params)
    startTransition(function () {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function setLimit(newLimit: string) {
    pushParams(function (params) {
      params.set("limit", newLimit)
      params.set("page", "1")
    })
  }

  function goToPage(direction: PageDirection) {
    let newPage = currentPage
    switch (direction) {
      case "start":
        newPage = 1
        break
      case "prev":
        newPage = currentPage - 1
        break
      case "next":
        newPage = currentPage + 1
        break
      case "end":
        newPage = totalPages
        break
    }
    const clampedPage = Math.max(1, Math.min(newPage, totalPages))
    pushParams(function (params) {
      params.set("page", clampedPage.toString())
    })
  }

  function setSort(sortValue: string, isChecked: boolean) {
    if (!isChecked) return
    pushParams(function (params) {
      params.set("sort", sortValue)
      params.set("page", "1")
    })
  }

  function toggleListParam(
    paramName: string,
    value: string,
    isChecked: boolean,
    currentValues: string[]
  ) {
    let nextValues = [...currentValues]
    if (isChecked) {
      nextValues.push(value)
    } else {
      nextValues = nextValues.filter(function (v) {
        return v !== value
      })
    }
    pushParams(function (params) {
      params.set(paramName, nextValues.join(","))
      params.set("page", "1")
    })
  }

  // Debounced so a page navigation (and the resulting Suspense refetch)
  // only fires once typing pauses, instead of on every keystroke.
  function setSearch(paramName: string, value: string) {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(function () {
      pushParams(function (params) {
        params.set(paramName, value)
        params.set("page", "1")
      })
    }, SEARCH_DEBOUNCE_MS)
  }

  return {
    searchParams,
    isPending,
    pushParams,
    setLimit,
    goToPage,
    setSort,
    toggleListParam,
    setSearch,
  }
}
