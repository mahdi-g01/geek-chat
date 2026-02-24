import {RefObject, useCallback} from "react";

export default function useScrollToEnd(elementRef: RefObject<HTMLElement|null>) {

    return useCallback((behavior: ScrollToOptions["behavior"] = "instant", additionalOffset: number = 0)=>{
        elementRef.current?.scrollTo({
            top: elementRef.current?.scrollHeight + additionalOffset,
            behavior: behavior
        })
    }, [elementRef])

}