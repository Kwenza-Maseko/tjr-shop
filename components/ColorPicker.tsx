import React, { useState } from 'react'
import { HexColorInput, HexColorPicker } from "react-colorful";

interface Props {
    value?: string;
    onPickerChange: (color: string) => void;
}

const ColorPicker = ({ value, onPickerChange }: Props) => {
    const [isOpened, setIsOpened] = useState(false);

    return (
        <div className='flex flex-col gap-2 '>
            <HexColorPicker
                color={value} onChange={onPickerChange}
                className='w-fit'
            />
            <div className="flex gap-1 items-center bg-white p-2 rounded">
                <p>#</p>
                <HexColorInput
                    color={value} onChange={onPickerChange}
                    className='hex-input'
                />
            </div>


        </div>
    )
}

export default ColorPicker