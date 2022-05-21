import React, { useCallback, useEffect, useState } from "react";
// import InputColor, { Color } from 'react-input-color';
import { ChromePicker, ColorResult } from 'react-color'
import { convertCompilerOptionsFromJson } from "typescript";
import './staff.css';

export interface IStaff{
  name: string; 
  color: React.CSSProperties['color'];
  textColor?: "white" | "black"
}

interface IProps {
  staff: IStaff[],
  onUpdate: (value: IStaff[]) => void;
  chosenStaff?: number;
  setChosenStaff: (value?: number) => void;
}

function isLight(color: React.CSSProperties['color']): boolean {
  if (!color) return true;
  const hex = color.replace('#', '');
  const c_r = parseInt(hex.substr(0, 2), 16);
  const c_g = parseInt(hex.substr(2, 2), 16);
  const c_b = parseInt(hex.substr(4, 2), 16);
  const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
  return brightness > 155 ? true : false;
}

const Staff = ({staff, onUpdate, chosenStaff, setChosenStaff}: IProps) => {
  // const [staff, setStaff] = useState<IStaff[]>([]);
  const [visiblePicker, setVisiblePicker] = useState<number>();
  const [error, setError] = useState("")

  const addStaff = useCallback(() => {
    if (staff.find(x => !x.name)) {
      setError("Complete existing staff member before adding a new one")
      return;
    }
    else {
      setError("")
    }
    onUpdate([...staff, {name: "", color: ""}])
  }, [onUpdate, staff])

  const deleteStaff = useCallback((index: number) => () => {
    if (error) setError("");
    const temp = [...staff];
    temp.splice(index, 1);
    onUpdate(temp);
  }, [error, onUpdate, staff])
  
  const updateStaffColor = useCallback( (index: number) => (value: ColorResult, event: React.ChangeEvent<HTMLInputElement>) => {
    const temp = [...staff];
    temp[index].color = value.hex;
    temp[index].textColor = isLight(value.hex) ? 'black' : 'white';
    onUpdate(temp);
  }, [onUpdate, staff])

  const updateStaffName = useCallback((index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =  e.target.value;
    if (error && value) setError("");

    const temp = [...staff];
    temp[index].name = value;
    onUpdate(temp);
  }, [error, onUpdate, staff])

  const onTogglePicker = useCallback((index: number) => () => {
    setVisiblePicker((prevState) => prevState === index ? undefined : index);
  }, [])

  const onChooseStaff = useCallback((index: number) => () => {
    if (!staff[index].name) return
    setChosenStaff(chosenStaff === index ? undefined : index);
  }, [chosenStaff, setChosenStaff, staff])

  useEffect(() => {
    onUpdate(staff)
  }, [onUpdate, staff]);

  // Close color picker when click happens outside of component
  useEffect(() => {
    document.addEventListener('click', (e) => {
      const event = e as unknown as {path: HTMLElement[]};
      if (!event.path.find((x) => x.className === 'chrome-picker ' || x.className === 'colorpicker-toggle' )) {
        setVisiblePicker(undefined);
      }
    });
  }, [])

  return (
      <div className="staff_wrapper">
        {staff.map( (staff, index) => 
        <div 
          className={`staff ${isLight(staff.color) ? "" : "staff-dark"}`}
          key={index}
          onClick={onChooseStaff(index)}
          style={{background: staff.color, borderColor: chosenStaff === index ? 'green' : ''}}
        >
          <input 
          name="name" 
          placeholder="Insert Name" 
          value={staff.name} 
          onChange={updateStaffName(index)} 
          spellCheck={false}
          autoComplete="off"
          />
          <div className="staff_color">
              <div className="colorpicker-toggle" onClick={onTogglePicker(index)}></div>
              {visiblePicker === index && <ChromePicker  onChange={updateStaffColor(index)} color={staff.color} />}
          </div>
          <div className="staff_remove" onClick={deleteStaff(index)}>
            <span></span><span></span>
          </div>
        </div>
        )}
        <div style={{width: '100%'}}>
          <div className="error">{error}</div>
          <button className="btn" onClick={addStaff}>Πρόσθεσε Προσωπικό</button>
        </div>
      </div>
  )
}

export default React.memo(Staff);