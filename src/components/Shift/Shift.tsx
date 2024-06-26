import moment from "moment";
import React, { useCallback, useState } from "react";
import Select, { SingleValue } from 'react-select';
import { uid } from 'uid';

import './shift.css';

export interface IShift {
  id: string;
  from: string; 
  to: string;
}

interface ISelectOption {
  value: string; 
  label: string;
}

const timeOptions: ISelectOption[] = [];
let i = 0;
while (i < 24) { 
  const val = `${i > 9 ? `${i}` : `0${i}`}:00`;
  timeOptions.push(
    {
      value: val,
      label: val
    }
    );
  i++;
}

const shiftsOverlap = (shifts: IShift[]) => {
  const currentDate = moment(new Date());
  const nextDate = currentDate.clone().add(1, "day");

  const formattedShifts = shifts.map(shift => {
    return {
      from: shift.from ? currentDate.clone().set({h: parseInt(shift.from.split(':')[0]), m: parseInt(shift.from.split(':')[1]), s: 0}) : undefined,
      to: shift.to ? (
        shift.to <= shift.from 
        ? nextDate.clone().set({h: parseInt(shift.to.split(':')[0]), m: parseInt(shift.to.split(':')[1]), s: 0})
        : currentDate.clone().set({h: parseInt(shift.to.split(':')[0]), m: parseInt(shift.to.split(':')[1]), s: 0})
        ) : undefined,
    }
  });
  if (formattedShifts.length < 2) return false;
  for (let i = 0; i < formattedShifts.length; i++) {
    const {from, to} = formattedShifts[i] as {from: moment.Moment, to: moment.Moment};
    for (let j = i + 1; j < formattedShifts.length; j++) {
      const {from: from2, to: to2} = formattedShifts[j];
      if (from2 && from.isSameOrBefore(from2) && from2.isBefore(to)) {
          return true
        }
        else if (to2 && from.isBefore(to2) && to2.isBefore(to)){
          return true
        }
        else if (from2 && to2 && from2.isBefore(from) && to2.isAfter(to)){
          return true
        }
    }
  }

  return false;
}

interface IProps {
  shifts: IShift[];
  onUpdate: (value: IShift[]) => void;
}

const Shift = ({shifts, onUpdate}: IProps) => {
  // const [shifts, setShifts] = useState<IShift[]>([]);
  const [error, setError] = useState("")

  const addShift = useCallback(() => {
    onUpdate([...shifts, {id: uid(), from: "" , to: ""}])
  }, [onUpdate, shifts])

  const deleteShift = useCallback((id: string) => () => {
    const index = shifts.findIndex(x => x.id === id);
    if (error && !shiftsOverlap(shifts.splice(index, 1))) setError("");
    const temp = [...shifts];
    temp.splice(index, 1);
    onUpdate(temp);
  }, [error, onUpdate, shifts])


  const updateShift = useCallback((id: string, fromOrTo: keyof IShift) => (value: SingleValue<ISelectOption>) => {
    const shiftsClone = shifts.map(x => { return {...x}});
    // const targetShift = shiftsClone[index];
    const targetShift = shiftsClone.find(x => x.id === id);
    if (!targetShift) return;
    targetShift[fromOrTo] = value?.label as string;

    if (shiftsOverlap(shiftsClone)){
      setError("Overlapping shifts not allowed");
      return;
    }

    setError("");

    // const temp = [...shifts];
    // temp[index][fromOrTo] = value?.label as string;
    onUpdate(shiftsClone);
  }, [shifts, onUpdate])


  return (
      <div className="shift_wrapper">
        {shifts.map( (shift, index) => 
        <div 
          className="shift"
          key={index}
        >
          <div className="selectWrapper">
            <label>From</label>
            <Select 
              options={timeOptions} 
              value={timeOptions.find(x => x.label === shift.from) || {label: '00:00', value: '00:00'}} 
              onChange={updateShift(shift.id, "from")}
              placeholder="Time"
            />
          </div>
          <div className="selectWrapper">
            <label>To</label>
            <Select 
              options={timeOptions}
              value={timeOptions.find(x => x.label === shift.to) || {label: '00:00', value: '00:00'}} 
              // value={{label: '10:00', value: '10:00'}} 
              onChange={updateShift(shift.id, "to")}
              placeholder="Time"
            />
          </div>
          <div className="shift_remove" onClick={deleteShift(shift.id)}>
            <span></span><span></span>
          </div>
        </div>
        )}
        <div style={{width: '100%'}}>
          <div className="error">{error}</div>
          <button className="btn" onClick={addShift} disabled={!!error || !!shifts.find(x => !x.from || !x.to)}>Πρόσθεσε Βάρδια</button>
        </div>
      </div>
  )
}

export default React.memo(Shift);