import {useEffect, useState} from "react";
import {getPreference, setPreference} from "@/global/functions/capacitor_preferences";

export default function useUiSavedState<ST extends object|string|number|boolean|undefined>
(key: string, getter: ST , setter: (s:any)=>any) {

    useEffect(() => {
        getPreference(key).then(pref=>{
            if (pref) {
                if (typeof getter == "object"){
                    setter(JSON.parse(pref));
                } else if (typeof getter == "number") {
                    setter(Number(pref));
                } else if (typeof getter == "boolean") {
                    setter(pref == "true" || pref == `1`);
                } else {
                    setter(`${pref}`);
                }
                // console.info(`UI state initiated with key: ${key} and value: ${pref}`)
            }
        })
    }, []);

    useEffect(() => {
        if (getter == undefined)
            return;

        let toSave;

        if (typeof getter == "object"){
            toSave = (JSON.stringify(getter));
        } else {
            toSave = `${getter}`;
        }

        setPreference(key, toSave).then(()=>{
            // console.info(`UI state updated with key: ${key} and value: ${getter}`)
        });
    }, [getter, key]);

    return {};
}
