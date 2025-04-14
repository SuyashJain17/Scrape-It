"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {useId, useState} from "react"
import { ParamProps } from "@/types/appNode";

export function StringParam({param, value, updateNodeParamValue}: ParamProps) {
    const [interValue, setInterValue] = useState(value);
    const id = useId();
    return(
        <div className="space-y-1 p-1 w-full"> 
            <Label htmlFor={id} className="text-xs flex">
                {param.name}
                {param.required && <p className="text-red-400 px-2">*</p>}
            </Label>
            <Input id={id} 
                value={interValue} 
                placeholder="Enter the value here"
                onChange={(e) => setInterValue(e.target.value)}
                onBlur={(e) => updateNodeParamValue(e.target.value)}
                />
            {param.helperText && (
                <p className="text-muted-foreground px-2">{param.helperText}</p>
            )}
        </div>
    )
}