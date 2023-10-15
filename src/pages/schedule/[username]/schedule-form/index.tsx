import { useState } from 'react'
import { CalendarStep } from './calendar-step'
import { ConfirmStep } from './confirm-step'

export function ScheduleForm() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>()

  function handleClearSelectedDateAndTime() {
    setSelectedDateTime(null)
  }

  if (selectedDateTime) {
    return (
      <ConfirmStep
        schedulingDate={selectedDateTime}
        onCancelForm={handleClearSelectedDateAndTime}
      />
    )
  }
  return <CalendarStep onSelectDateTime={setSelectedDateTime} />
}
