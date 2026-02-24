'use client'

import {useRestApi} from "@/global/contexts/RestApiContext";
import {DependencyList, EffectCallback, useEffect} from "react";

export default function useEffectAfterApiReady(effect: EffectCallback, deps?: DependencyList) {

    const {apiTokenRetrieved} = useRestApi();

    useEffect(() => {
        if (apiTokenRetrieved)
            effect();
    }, [apiTokenRetrieved, ...(deps ?? [])]);

}