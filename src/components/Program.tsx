import React, { useCallback, useEffect, useState } from "react";
import Calendar, { IFilledDate } from "./Calendar/Calendar";
import Shift, { IShift } from "./Shift/Shift";
import Staff, { IStaff } from "./Staff/Staff";
import DatePicker from 'react-datepicker';

// TODO ISNTEAF OF USING INDEXES TO FIND SHIFT AND STAFF USE SOME UID OR SMTHING
const Program = () => {
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [staff, setStaff] = useState<IStaff[]>([]);
  const [dateRange, setDateRange] = useState<{start?: Date, end?: Date}>({});
  const [chosenStaff, setChosenStaff] = useState<string>();
  const [calendar, setCalendar] = useState<IFilledDate>({});
  const [defaultProgram, setDefaultProgram] = useState<IFilledDate[][]>([]);

  const onUpdateShift = useCallback((value: IShift[]) => {
    setShifts(value);
  }, [])

  const onUpdateStaff = useCallback((value: IStaff[]) => {
    setStaff(value);
  }, [])

  const onUpdateChosenStaff = useCallback((value?: string) => {
    setChosenStaff(value);
  }, [])

  const onDateRangeChange = useCallback((dates: [Date, Date]) => {
    setDateRange({start: dates[0], end: dates[1]});
  }, [])

  const onUpdateCalendar = useCallback((value: IFilledDate) => {
    setCalendar(value);
  }, [])

  const onUpdateDefaultProgram = useCallback((value: IFilledDate[][]) => {
    setDefaultProgram(value);
  }, [])

  const onSaveToLocalStorage = useCallback(() => {
      localStorage.setItem('shifts', JSON.stringify(shifts));
      localStorage.setItem('staff', JSON.stringify(staff));
      localStorage.setItem('dateRange', JSON.stringify({
        start: dateRange.start ? dateRange.start.toISOString()  : null,
        end: dateRange.end ? dateRange.end.toISOString()  : null
      }));
      localStorage.setItem('calendar', JSON.stringify(calendar));
      localStorage.setItem('defaultProgram', JSON.stringify(defaultProgram));
      console.log(JSON.stringify(calendar));
  }, [shifts, staff, dateRange, calendar, defaultProgram])

  useEffect(() => {
    const storedShifts = localStorage.getItem('shifts');
    const storedStaff = localStorage.getItem('staff');
    const storedDateRange = localStorage.getItem('dateRange');
    const storedCalendar = localStorage.getItem('calendar');
    const storedDefaultProgram = localStorage.getItem('defaultProgram');
    if (storedShifts) setShifts(JSON.parse(storedShifts))
    if (storedStaff) setStaff(JSON.parse(storedStaff))
    if (storedDateRange && storedDateRange.length > 2) {
      const dates = JSON.parse(storedDateRange);
      setDateRange({
        start: new Date(dates.start),
        end: new Date(dates.end)
      })
    }
    if (storedCalendar) setCalendar(JSON.parse(storedCalendar));
    if (storedDefaultProgram) setDefaultProgram(JSON.parse(storedDefaultProgram));
  }, [])

  console.log('start ', dateRange.start);
  console.log('end ', dateRange.end);

  return (
    <>
      <button className="btn" onClick={onSaveToLocalStorage} style={{position: "fixed", right: '15px', top:'30px'}}>Save to local storage</button>
      <Shift onUpdate={onUpdateShift} shifts={shifts}/>
      <Staff staff={staff} onUpdate={onUpdateStaff} chosenStaff={chosenStaff} setChosenStaff={onUpdateChosenStaff}/>
      <DatePicker
      selected={dateRange.start}
      onChange={onDateRangeChange}
      startDate={dateRange.start}
      endDate={dateRange.end}
      selectsRange
      inline
    />
      <Calendar defaultProgram={defaultProgram} onUpdateDefaultProgram={onUpdateDefaultProgram} calendar={calendar} onUpdateCalendar={onUpdateCalendar} shifts={shifts} staff={staff} dateRange={dateRange} chosenStaff={chosenStaff}/>
    </>
  )
}

export default Program;