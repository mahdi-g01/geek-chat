import React, {Fragment} from "react";

export default function Repeater({children, count}: {children: React.ReactNode, count: number}){
    return <>
        { [...Array(count)].map((_, i) => (<Fragment key={i}>{children}</Fragment>) )}
    </>
}
