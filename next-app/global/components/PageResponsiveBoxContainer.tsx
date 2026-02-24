import {ComponentProps} from "react";

export default function PageResponsiveBoxContainer(
    {children, className, containerClassName, maxWidth = 1280}:
        ComponentProps<"div"> & { containerClassName?: string, maxWidth?: number }) {

    return <div className={`flex-1 w-svw h-svh overflow-hidden flex items-center justify-center ${containerClassName}`}>

        <div
            style={{
                maxWidth
            }}
            className={`w-full h-full flex-1 max-h-full lg:max-h-[720px] overflow-hidden bg-card shadow-lg lg:rounded-lg flex relative ${className}`}>
            {children}
        </div>

    </div>
}