import {useState} from "react";

export default function useStateHelper<S>(initialState: S | (() => S)) {
    const [state, setState] = useState(initialState);
    return {
        set: setState,
        get: state
    };
}