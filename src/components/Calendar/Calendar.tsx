import moment from "moment";
import 'moment/locale/el';
import './calendar.css';
import React, { useCallback, useEffect, useMemo, useState } from "react";
import InputColor, { Color } from 'react-input-color';
import Shift, { IShift } from "../Shift/Shift";
import Staff, { IStaff } from "../Staff/Staff";

moment.locale('el');

export type IFilledDate = Record<string, {staff: string}>;

//  string = id tou shift
// staff id tou staff
export type IDefaultProgram = Record<string, {staff: string}>[];

interface IProps {
  shifts: IShift[];
  staff: IStaff[];
  dateRange: {start?: Date, end?: Date};
  chosenStaff?: string;
  calendar: IFilledDate;
  onUpdateCalendar: (value: IFilledDate) => void;
  defaultProgram: IDefaultProgram;
  onUpdateDefaultProgram: (value: IDefaultProgram) => void;
}

// Start should be monday and end should be sunday
const Calendar = ({defaultProgram, onUpdateDefaultProgram, calendar, shifts, staff, dateRange, chosenStaff, onUpdateCalendar}: IProps) => {
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

  const clickCell = useCallback((shiftId: string, date: string) => () => {
    const key = `${date}_${shiftId}`;
    let temp = {...calendar};
    console.log('chosen staff = ', temp[key] );
    console.log('existing = ', chosenStaff );
    if (chosenStaff === undefined || temp[key]?.staff === chosenStaff) {
      if (key in calendar) {
        delete temp[key];
      }
    }
    else temp[key] = {staff: chosenStaff};
    onUpdateCalendar(temp);
    return undefined;
  }, [chosenStaff, calendar, onUpdateCalendar])

  const findName = useCallback((shiftId: string, date: string) => {
      const chosenCalendarEntry = calendar[`${date}_${shiftId}`];
      let name = undefined;
      if (chosenCalendarEntry) name = staff.find(x => x.id === chosenCalendarEntry.staff)?.name;

      if (!name) {
        let dayOfWeek = parseInt(moment(date).format('d')) - 1;
        if (dayOfWeek < 0 ) dayOfWeek = 6;
        if (defaultProgram.length === 7) {
          const entry = defaultProgram[dayOfWeek][shiftId];
          if (entry) {
            name =  staff.find(x => x.id === entry.staff)?.name;
          }
        }
      }

      return name;
  }, [calendar, staff, defaultProgram])

  const findColor = useCallback((shiftId: string, date: string, ) => {
      const chosenCalendarEntry = calendar[`${date}_${shiftId}`];
      let color = undefined;
      if (chosenCalendarEntry) color = staff.find(x => x.id === chosenCalendarEntry.staff)?.color;

      if (!color) {
        let dayOfWeek = parseInt(moment(date).format('d')) - 1;
        if (dayOfWeek < 0 ) dayOfWeek = 6;
        if (defaultProgram.length === 7) {
          const entry = defaultProgram[dayOfWeek][shiftId];
          if (entry) {
            color =  staff.find(x => x.id === entry.staff)?.color;
          }
        }
      }

      return color;
  }, [calendar, staff, defaultProgram])

  const findTextColor = useCallback((shiftId: string, date: string, ) => {
    const chosenCalendarEntry = calendar[`${date}_${shiftId}`];
    let color = undefined;
    if (chosenCalendarEntry) color = staff.find(x => x.id === chosenCalendarEntry.staff)?.textColor;

    if (!color) {
      let dayOfWeek = parseInt(moment(date).format('d')) - 1;
      if (dayOfWeek < 0 ) dayOfWeek = 6;
      if (defaultProgram.length === 7) {
        const entry = defaultProgram[dayOfWeek][shiftId];
        if (entry) {
          color =  staff.find(x => x.id === entry.staff)?.textColor;
        }
      }
    }

    return color || 'black';
}, [calendar, staff, defaultProgram])

const saveBasic = useCallback(() => {
  const tempDefaultProgram: IDefaultProgram = [];
  for (let i = 0; i < 7; i++) {
    const entry: IDefaultProgram[0] = {}
    for (const shift of shifts) {
      const dateString = visibleDates.start?.clone().add(i, 'days').toISOString();
      const key = `${dateString}_${shift.id}`;
      if (key in calendar) {
        entry[shift.id] = calendar[key]
      }
    }
    tempDefaultProgram.push(entry);
  }
  
  onUpdateDefaultProgram(tempDefaultProgram);
  return undefined;
}, [calendar, visibleDates, shifts, onUpdateDefaultProgram])

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
          <button className="btn saveBasic" onClick={saveBasic}>Αποθήκευση ως βασικό</button>
        </div>

        <div className={`calendar ${chosenStaff ? 'calendar-chosenStaff' : ''}`}>
          <div className="calendar_header">
              {numberOfVisibleDaysArray.map((x, index) => 
                <div key={index} className="cell">
                  {visibleDates.start?.clone().add(index, 'days').format('DD/MMM')}
                  <div>{visibleDates.start?.clone().add(index, 'days').format('dddd')}</div>
                </div>
              )}
          </div>
          <div className="calendar_body">
              {shifts.map((shift, shiftIndex) => 
                <div className="row" key={shiftIndex}>
                  <div className="tableShift">{shift.from} - {shift.to}</div>
                  {numberOfVisibleDaysArray.map((x, index2) => 
                    <div 
                    key={index2} 
                    className="cell" 
                    onClick={clickCell(shift.id, visibleDates.start?.clone().add(index2, 'days').toISOString() as string)}
                    style={{
                      background: findColor(shift.id, visibleDates.start?.clone().add(index2, 'days').toISOString() as string),
                      color: findTextColor(shift.id, visibleDates.start?.clone().add(index2, 'days').toISOString() as string)
                    }}
                    >
                      {findName(shift.id, visibleDates.start?.clone().add(index2, 'days').toISOString() as string)}
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