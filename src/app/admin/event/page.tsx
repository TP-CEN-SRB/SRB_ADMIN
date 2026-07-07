
import { getEvents } from "@/app/action/event"
import EventDataTable from "./eventDataTable"

const getData = async () => {
  const { events } = await getEvents(null, undefined, undefined)
  return events.map((event) => ({
    id: event.id as string,
    name: event.title as string,
    description: event.description as string,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
  }))
}

const AllEventsPage = async () => {
  const data = await getData()
  return <EventDataTable data={data} />
}

export default AllEventsPage
