"use client"

import { SyncLoader } from "react-spinners"

const Loading = () => {
  return (
    <div className="h-screen flex justify-center items-center">
      <SyncLoader color="#9ca3af" />
    </div>
  )
}

export default Loading
