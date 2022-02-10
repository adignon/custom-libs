import React from 'react';


export const useForm=(formDatas={}):Array<any>=>{
    const [form, setForm]=React.useState(formDatas);
    const handleForm=function (e:any, value:any, name:any){
        const target=e.target ? e.target: e.currentTarget;
        if(value){
            setForm(prev=>({...prev, [(name ?? target.name)]: value}))
        }else{
            if(target.hasOwnProperty("checked"))
                setForm(prev=>({...prev, [name ?? target.name]: target.checked}))
            else
                setForm(prev=>({...prev, [name ?? target.name]: target.value}))
        }
    }
    return [form, handleForm];
}

export interface IForm{
  value?:any
  vSchema?:any,
  customValidation?:(value:any, form?:any)=>boolean,
  help?:string,
  sameAs?:string,
  skipValidation?:boolean,
  errorMessage?:string,
  transformValue?:(value:any, form?:any)=>any,
}

export interface IFormDatas{
  [name:string]:IForm
}


export interface IFormOptions{ handlePersist?:(newData:any)=>any, useStorage:boolean, storageKey:string, storageObject?:Storage, useStringifyMethod?:boolean, strictCopy?:boolean}

//Send "_form" key vSchema to validate hole form
export const useFormValid=(formDatas:IFormDatas, validate=true,options?:IFormOptions):Array<any>=>{
    //console
    if(typeof window!=="undefined"  && typeof localStorage!=="undefined" && typeof sessionStorage!==undefined){
        let {handlePersist, useStorage, storageKey, storageObject, useStringifyMethod, strictCopy=true}:any=options ?? {}
        //Local Storage
        storageObject=storageObject??  sessionStorage
        const getStoreValue=(keys?:Array<string>)=>{
            if(useStorage && storageKey){
                let data:any=  storageObject.getItem(storageKey)
                let parsedData=useStringifyMethod ? JSON.parse(data):data
                if(strictCopy){
                    let d={}
                    for(let i in parsedData){
                        if(keys){
                            if(keys.includes(i)) d[i]=parsedData[i];
                        }else{
                            d[i]=parsedData[i]
                        }
                    }
                    return d;
                }
                return parsedData
            }
            return {}
        }
        //Local Storage
        const [form, setForm]:any=React.useState({...getStoreValue(Object.keys(formDatas)),...formDatas})
        const getHelperTextOn=(prop:string)=>form[prop].error && !form[prop].valid ? form[prop].errorMessage ?? form[prop].error.message : (form[prop].value.length && form[prop].valid ?"": form[prop].help ?? "" )
        const isErrorOn=(prop:any)=>!form[prop] || form[prop].valid ===undefined ? undefined : isNaN(form[prop].valid)? false : !form[prop].valid

        //Validate form witj joi
        const validateForm=(joiSchema:any, value:any, fieldData:IForm)=>{
            //handleCustom validation
            //if no custom validation defined set valid to true
            const customValidationResult=fieldData?.customValidation instanceof Function ? fieldData.customValidation(value, getValues()) : true;
            //if schema defined
            if(joiSchema){
                const result=joiSchema.validate(value);
                //if there is an error return valid:false
                if(result.error){
                    return {valid: false, error: result.error}

                }
            }
            if(fieldData && fieldData.sameAs){
                if(!(value===form[fieldData.sameAs].value)){
                    return {valid: false, error: {message:"Champs non conformes."}}; 
                }
            }
            return {valid:customValidationResult }
        }

        //Add field to form
        const addField=(name:string, config:IForm)=>{
            setForm((prev)=>({...prev, [name]:config}))
        }
        

        //Eval if form valid
        const isFormValid=()=>{
            return !Boolean(Object.keys(getErrors()).length)
        }
        

        //form smart handler 
        const handleForm=function (e:any){
            const target= e.target
            if(target){
                if(target.hasOwnProperty("checked"))
                    setForm((prev:any)=>{
                        const value=prev[target.name]?.transformValue instanceof Function ? prev[target.name]!.transformValue(target.checked, prev) :target.checked
                        //Copy store datas to the new form if existing
                        let d=getStoreValue(Object.keys(formDatas))
                        d=({
                            ...prev,
                            ...d,
                            [ target.name]: {...prev[ target.name], value , ...(validate && !prev.skipValidation ? validateForm(prev[( target.name)] && prev[( target.name)].vSchema ? prev[( target.name)].vSchema : undefined, target.checked, prev[( target.name)]) : {})}})
                        saveToStore(d)
                        if(prev._form?.vSchema){
                            d["_form"]={...prev._form, ...validateForm(form._form.vSchema, getValues(d), prev._form)}
                        }
                        if(handlePersist instanceof Function) return d;
                        return d
                    
                    })
                else
                    setForm((prev:any)=>{
                        
                        const value=prev[target.name]?.transformValue instanceof Function ? prev[target.name]!.transformValue(target.value, prev) :target.value
                        let d=getStoreValue(Object.keys(formDatas))
                        d=({...prev,...d, [ target.name]: {...prev[ target.name], value, ...(validate && !prev.skipValidation ? validateForm(prev[( target.name)] && prev[( target.name)].vSchema ?  prev[( target.name)].vSchema : undefined, target.value, prev[( target.name)]) :{})} })
                        saveToStore(d)
                        if(prev._form?.vSchema){
                            d["_form"]={...prev._form, ...validateForm(form._form.vSchema, getValues(d), form._form)}
                        }
                        ////console.log(k, d)
                        if(handlePersist instanceof Function) return handlePersist(d)
                        
                        return d
                    })
            } 
        }

        //Get form values as key value paires
        const getValues=(datas:any={...getStoreValue(Object.keys(formDatas)), ...form}):{[key:string]:string}=>{
            let d:any={}
            for(let i in datas){
                if(i==="_form") continue;
                d[i]=datas[i].value
            }
            return d;
        }


        //get all form errors
        const getErrors=(datas:any={...getStoreValue(Object.keys(formDatas)), ...form}):{[x:string]:string}=>{
            let d:any={}
            for(let i in datas){
                let error:any;
                if(datas[i].error) {
                    error=datas[i].error
                }else{
                    let v=validateForm(datas[i].vSchema, datas[i].value, datas[i])
                    //console.log(i, v)
                    error=v.error;
                    datas[i]['valid']=v.valid
                }
                if(!datas[i].valid){
                    d[i]=datas[i].errorMessage ?? error?.message ?? ""
                }
            }
            return d;
        }

        //Reset form to initial values
        const reset=(values?:any)=>{
            saveToStore({...getStoreValue(), formDatas, ...values})
            setForm({...getStoreValue(), formDatas, ...values})
            
        }

        //Save form data to a Storage object or interface
        const saveToStore=(d:any)=>{
            if(useStorage && storageKey){
                let data:any=  storageObject.getItem(storageKey)
                data=data ? useStringifyMethod ? JSON.parse(data) : data: {}
                data={...data, ...d}
                storageObject.setItem(storageKey,  useStringifyMethod ? JSON.stringify(data):data)
                return data
            }
            return d

        }

        //Form handler based on value or function
        const handleFormValue=function (name:any, value:any|((prevState:any)=>any)){
            setForm((prev:any)=>{
                value=value instanceof Function ? value(prev[name]) : value
                value=prev[name]?.transformValue instanceof Function ? prev[name]?.transformValue(value, prev) :value
                let d=getStoreValue(Object.keys(formDatas))
                d= {...prev,...d, [(name)]: {...prev[(name)], value, ...(validate && !prev.skipValidation ? validateForm((prev[(name)] ? prev[(name)].vSchema : undefined) , value, prev[(name)]) : {})}}
                if(handlePersist instanceof Function) return handlePersist(d)
                saveToStore(d)
                if(prev._form?.vSchema){
                    d["_form"]={...prev._form, ...validateForm(form._form.vSchema, getValues(d), form._form)}
                }
                return d
            })
        }


        //Form handler array
        const handleFormValues=function (values:{[x:string]:((prevState:any)=>any)|any}){
            setForm((prev:any)=>{
                let d={...prev,...getStoreValue(Object.keys(formDatas))};
                for(let i in values){
                    let value=values[i];
                    value=value instanceof Function ? value(prev[i]) : value
                    value=prev[i]?.transformValue instanceof Function ? prev[i]?.transformValue(value, d) :value
                    d= {...d, [i]: {...prev[i], value, ...(validate && !prev.skipValidation ? validateForm((prev[i] ? prev[i].vSchema : undefined) , value, prev[i]) : {})}}
                }
                if(handlePersist instanceof Function) return handlePersist(d)
                saveToStore(d)
                if(prev._form?.vSchema){
                    d["_form"]={...prev._form, ...validateForm(form._form.vSchema, getValues(d), form._form)}
                }
                return d
            })
        }


        //Clear Storage object
        const clearStore=()=>{
            
            if(useStorage && storageKey ){
                const localStorageData=storageObject.getItem(storageKey)
                const localStorageDatas=localStorageData ? useStringifyMethod ? JSON.parse(localStorageData) : localStorageData  : null
                const formDataKeys=Object.keys(formDatas)
                const newD:any={}
                for(let i in localStorageDatas){
                    if(!formDataKeys.includes(i)){
                        newD[i]=localStorageDatas[i];
                    }
                }
                if(Object.keys(newD).length){
                    storageObject.setItem(storageKey, newD)
                }else{
                    storageObject.removeItem(storageKey)
                }
            }
            
        }
        //Initialize form from storage object
        React.useEffect(()=>{
            if(useStorage && storageKey && storageObject){
                const localStorageData:any=storageObject.getItem(storageKey)
                const localStorageDataParsed:any=localStorageData? useStringifyMethod ? JSON.parse(localStorageData) : localStorageData :null
                const k={...localStorageDataParsed, ...form}
                //if not store   recopy means if form !== {}
                storageObject.setItem(storageKey, useStringifyMethod ? JSON.stringify(k) : k)
            }
        }, [])

        return [form, {handleForm, handleFormValue,addField, handleFormValues,getHelperTextOn, isErrorOn, getErrors, isFormValid, clearStore, getValues, reset}];
   }
   return [formDatas, {handleForm:()=>{}, addField:()=>{}, handleFormValue:()=>{},handleFormValues:()=>{}, getHelperTextOn:()=>{}, isErrorOn:()=>{},isFormValid:()=>{},clearStore:()=>{}, getValues:()=>{}, getErrors:()=>{}, reset:()=>{}}];
}