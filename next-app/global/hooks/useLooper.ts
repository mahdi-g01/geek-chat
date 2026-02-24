import {useEffect} from "react";

export default function useLooper(
    {callback, interval}: { callback: () => void, interval: number }
) {

    // This is the loop to load new messages
    useEffect(() => {
        const intervalTo = setInterval(() => {
            callback();
        }, interval);

        return () => {
            clearInterval(intervalTo);
        }
    }, [interval, callback]);

}