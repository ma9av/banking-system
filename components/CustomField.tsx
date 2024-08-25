import { Input } from "./ui/input"
import {  FormLabel, FormControl,  FormMessage, FormField, Form } from "./ui/form"
import { formSchema } from "@/lib/utils"
import { Control, FieldPath } from "react-hook-form"
import { z } from "zod"


const schema = formSchema("sign-up")

interface CustomFieldTypes {
  control: Control<z.infer<typeof schema>>,
  type: FieldPath<z.infer<typeof schema>>,
  placeholder: string,
  label: string

}
const CustomField = ({ control , type, placeholder, label}:CustomFieldTypes) => {
  return (
    <FormField
    control={control}
    name = {type}
    render={({ field }) => (
     <div className="form-item">
          <FormLabel>
              {label}
          </FormLabel>
          <div className="flex w-full flex-col">
              <FormControl>
                  <Input placeholder={placeholder} className="input-class"  type={type === 'password' ? 'password' : 'text'} {...field}/>
              </FormControl>
              <FormMessage className="form-message mt-2"/>
          </div>
      </div>
    )}
  />
      
  )
}

export default CustomField