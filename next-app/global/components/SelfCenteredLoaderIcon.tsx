import React from "react";
import {LoaderIcon} from "lucide-react";

export default function SelfCenteredLoaderIcon({loading}: { loading: boolean }) {
    return loading &&
        <LoaderIcon className={"animate-spin absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2"}/>
}
