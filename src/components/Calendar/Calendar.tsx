import moment from "moment";
import 'moment/locale/el';
import './calendar.css';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import InputColor, { Color } from 'react-input-color';
import Shift, { IShift } from "../Shift/Shift";
import Staff, { IStaff } from "../Staff/Staff";

moment.locale('el');

export type IFilledDate = Record<string, {shift: number, staff: number}>;

interface IProps {
  shifts: IShift[];
  staff: IStaff[];
  dateRange: {start?: Date, end?: Date};
  chosenStaff?: number;
  calendar: IFilledDate;
  onUpdateCalendar: (value: IFilledDate) => void;
}

const days = ["Δευτέρα", "Τρίτη", "Τετάρτη", "Πέμπτη", "Παρασκευή", "Σάββατο", "Κυριακή"]

const initCalendar = [

]

// Start should be monday and end should be sunday
const Calendar = ({calendar, shifts, staff, dateRange, chosenStaff, onUpdateCalendar}: IProps) => {
  const [visibleDates, setVisibleDates] = useState<{start?: moment.Moment, end?: moment.Moment}>({});
  const [numberOfVisibleDays, setNumberOfVisibleDays] = useState(7);

  const changeVisibleDates = useCallback((action: 'add' | 'substract', days: number) => () => {
    if (action === 'add') {
      setVisibleDates({
        start: visibleDates.start?.add(days, 'days'),
        end: visibleDates.end?.add(days, 'days')
      })
    }
    else {
      setVisibleDates({
        start: visibleDates.start?.subtract(days, 'days'),
        end: visibleDates.end?.subtract(days, 'days')
      })
    }
    return undefined;
  }, [visibleDates])

  const numberOfVisibleDaysArray: number[] = useMemo(() => {
    return Array.from(Array(numberOfVisibleDays).keys())
  }, [numberOfVisibleDays]);

  const clickCell = useCallback((shift: number, date: string) => () => {
    const key = `${date}_${shift}`;
    let temp = {...calendar};
    if (chosenStaff === undefined) {
      if (key in calendar) {
        delete temp[key];
      }
    }
    else temp[key] = {shift, staff: chosenStaff};
    onUpdateCalendar(temp);
    return undefined;
  }, [chosenStaff, calendar, onUpdateCalendar])

  const findName = useCallback((shift: number, date: string) => {
      const chosenCalendarEntry = calendar[`${date}_${shift}`];
      let chosenStaff = undefined;
      if (chosenCalendarEntry) chosenStaff = staff[chosenCalendarEntry.staff].name;
      return chosenStaff;
  }, [calendar, staff])

  const findColor = useCallback((shift: number, date: string, ) => {
      const chosenCalendarEntry = calendar[`${date}_${shift}`];
      let color = undefined;
      if (chosenCalendarEntry) color = staff[chosenCalendarEntry.staff].color;
      return color;
  }, [calendar, staff])

  const findTextColor = useCallback((shift: number, date: string, ) => {
    const chosenCalendarEntry = calendar[`${date}_${shift}`];
    let color = undefined;
    if (chosenCalendarEntry) color = staff[chosenCalendarEntry.staff].textColor;
    return color || 'black';
}, [calendar, staff])

  // initialize date
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      setVisibleDates({
        start: moment(dateRange.start),
        end: moment(dateRange.start).add(6, 'days')
      })
    }
  }, [dateRange])

  return (
    <>
      {!shifts.length && <p className="error">fill shifts</p>}
      {!staff.length && <p className="error">fill staff</p>}
      {!!(!dateRange.start || !dateRange.end) && <p className="error">fill daterange</p>}
      {!!(visibleDates.start && visibleDates.end) && <>
        <div className="date_pagination">
          <button 
          disabled={visibleDates.start?.isSameOrBefore(moment(dateRange.start))}
          onClick={changeVisibleDates('substract', numberOfVisibleDays)}
          >prev</button>
          {visibleDates.start?.format('DD/MMM')}
          -
          {visibleDates.end?.format('DD/MMM')}
          <button 
          disabled={visibleDates.end?.isSameOrAfter(moment(dateRange.end))}
          onClick={changeVisibleDates('add', numberOfVisibleDays)}
          >next</button>
        </div>

        <div className="calendar">
          <div className="calendar_header">
              {numberOfVisibleDaysArray.map((x, index) => 
                <div key={index} className="cell">
                  {visibleDates.start?.clone().add(index, 'days').format('DD/MMM')}
                  <div>{visibleDates.start?.clone().add(index, 'days').format('dddd')}</div>
                </div>
              )}
          </div>
          <div className="calendar_body">
              {shifts.map((x, shiftIndex) => 
                <div className="row" key={shiftIndex}>
                  <div className="tableShift">{x.from} - {x.to}</div>
                  {numberOfVisibleDaysArray.map((x, index2) => 
                    <div 
                    key={index2} 
                    className="cell" 
                    onClick={clickCell(shiftIndex, visibleDates.start?.clone().add(index2, 'days').toISOString() as string)}
                    style={{
                      background: findColor(shiftIndex, visibleDates.start?.clone().add(index2, 'days').toISOString() as string),
                      color: findTextColor(shiftIndex, visibleDates.start?.clone().add(index2, 'days').toISOString() as string)
                    }}
                    >
                      {findName(shiftIndex, visibleDates.start?.clone().add(index2, 'days').toISOString() as string)}
                    </div>
                  )}
                </div>
              )}
              <div></div>
          </div>
        </div>
      </>}
    </>
  )
}

export default Calendar;