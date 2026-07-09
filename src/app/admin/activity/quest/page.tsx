// import { getQuests } from "@/app/action/quest"
// import QuestDataTable from "./questDataTable"

// const getData = async () => {
//   const { quests } = await getQuests(null, undefined, undefined) 
//   return quests.map((quest) => ({
//     id: quest.id as string,
//     name: quest.title as string,
//     material: quest.materialType as string,
//   }))
// }

// const AllQuestsPage = async () => {
//   const data = await getData()
//   return <QuestDataTable data={data} />
// }

// export default AllQuestsPage
export default function AllQuestsPage() {
  return(
    <div>AllQuestsPage</div>
  )
}