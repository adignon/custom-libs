import React from "react"

export class Store implements Storage{
     #store:any={}
     #listeners:Array<{on:string, fun:Function, key?:string}>=[]
    length:number=(()=>Object.keys(this.#store).length)()
    
    setItem=(key:string, value:any)=>{
        this.#store[key]=value
        this.#callListenersOn("set", key, this.#store[key])

    }
    getItem=(key:string)=>{
        this.#callListenersOn("get",  key, this.#store[key])
        return this.#store[key];
    }
    clear(){
        this.#store={};
    }
    getStore=()=>{
        return this.#store
    }
    removeItem=(key:string)=>{
        let newStore:any={}
        for(let i in this.#store){
            if(i!==key){
                newStore[key]=this.#store[key]
            }
        }
        this.#store=newStore
    }
    addListenerOn=(on:"set"|"get", fun:(data:any)=>void, key:string):void=>{
        this.#listeners.push({on,fun, key});
    }
    clearListener=(fun:Function)=>{
        this.#listeners=this.#listeners.filter((func:any)=>func.toString()!=fun.toString() || func!==fun)
    }
    key=(index:number):any=>{
        return (index+1) >= Object.keys(this.#store).length ? Object.keys(this.#store)[index] :null
    }
    #callListenersOn=(on:"set"|"get",key:string,  contextData?:any ):void=>{
        const listeners=this.#listeners.filter((l)=>{
            return l.on===on && key===l.key
        })
        for(let i=0; i<listeners.length; i++){
            listeners[i]?.fun(contextData)
        }
       
    }
}

export const useStore=(key:string, store:Store, selector:(currentStore:any, prevStore?:any)=>any)=>{
    if(store){

        const [storeData, setStoreData]=React.useState(selector(store.getItem(key) ?? {}, {}))
        React.useEffect(()=>{
            const handler=(storeD:any)=>{
                setStoreData((prev:any)=>{
                    const d=selector(storeD, prev)
                    return JSON.stringify(prev)!==JSON.stringify(d) ? d : prev
                })
                
            }
            store.addListenerOn("set", handler, key)
            return ()=>store.clearListener(handler)
        }, [])
        return storeData;
    }
    return undefined
}