// import Card from "@/components/Card/Card"
// import CardHeader from "@/components/Card/CardHeader"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { prisma } from "@/lib/db"
// import { authClient } from "@/lib/auth-client"

// import { getNameInitials } from "@/utils/getNameInitials"
// import AdminProfileMore from "@/components/Dropdown/AdminProfileMore"

// const AdminProfilePage = async () => {
//   const { data: session } = await authClient.getSession()
//   const sessionUser = session?.user
//   if (!sessionUser) return null

//   const user = await prisma.user.findUnique({
//     where: { id: sessionUser.id },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       faculty: true,
//       createdAt: true,
//       updatedAt: true,
//       emailVerified: true,
//       profileImageUrl: true, // ✅ IMPORTANT
//     },
//   })

//   if (!user) return null

//   return (
//     <div className="p-4 space-y-4">
//       {/* HEADER CARD */}
//       <Card isAdmin>
//         <div className="flex items-center gap-x-10">
//           <Avatar className="border border-slate-800 w-24 h-24 text-3xl font-bold overflow-hidden">
//             {user.profileImageUrl ? (
//               <AvatarImage
//                 src={user.profileImageUrl}
//                 alt={user.name ?? "User profile"}
//                 className="object-cover"
//               />
//             ) : (
//               <AvatarFallback>
//                 {getNameInitials(user.name)}
//               </AvatarFallback>
//             )}
//           </Avatar>

//           <div>
//             <h1 className="text-slate-800 text-2xl font-bold">{user.name}</h1>
//             <p className="text-slate-600 mt-1 text-sm">{user.faculty}</p>
//           </div>
//         </div>
//       </Card>

//       {/* PROFILE INFO */}
//       <Card isAdmin>
//         <div className="flex flex-wrap justify-between items-center">
//           <h1 className="text-2xl md:text-4xl text-left text-slate-800">
//             Profile Information
//           </h1>
//           <AdminProfileMore email={user.email} />
//         </div>

//         <div className="mt-5">
//           <div className="flex md:flex-row flex-col md:gap-0 gap-6">
//             <div className="flex flex-col flex-1 gap-6">
//               <div>
//                 <p className="text-slate-600">Name</p>
//                 <p className="text-slate-700 font-bold text-xl">{user.name}</p>
//               </div>

//               <div>
//                 <p className="text-slate-600">Email</p>
//                 <p className="text-slate-700 font-bold text-xl">{user.email}</p>
//               </div>

//               <div>
//                 <p className="text-slate-600">Faculty</p>
//                 <p className="text-slate-700 font-bold text-xl">{user.faculty}</p>
//               </div>
//             </div>

//             <div className="flex flex-col flex-1 gap-6">
//               <div>
//                 <p className="text-slate-600">Account created</p>
//                 <p className="text-slate-700 font-bold text-xl">
//                   {user.createdAt.toLocaleDateString()}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-slate-600">Account verified</p>
//                 <p className="text-slate-700 font-bold text-xl">
//                   {user.emailVerified ? "Verified" : "Not verified"}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-slate-600">Last updated</p>
//                 <p className="text-slate-700 font-bold text-xl">
//                   {user.updatedAt.toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Card>
//     </div>
//   )
// }

// export default AdminProfilePage

export default function AdminProfilePage() {
  return(
    <div>AdminProfilePage</div>
  )
}