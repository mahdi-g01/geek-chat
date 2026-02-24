'use client'

import { useEffect, useRef } from "react";
import { createDeviceKeys, hasStoredDeviceKeys } from "@/lib/device_handler";

export default function useDeviceInfoGenerator() {
    const done = useRef(false);

    useEffect(() => {
        if (done.current) return;
        done.current = true;

        hasStoredDeviceKeys().then((has) => {
            if (!has) return createDeviceKeys();
        });
    }, []);
}
