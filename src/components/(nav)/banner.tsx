import Image from "next/image"
export function Banner(){
    return(
        <Image
            src="/temasekPolyBanner.png"
            alt="AIRS Logo"
            width={130}
            height={20}
        />
    )
}