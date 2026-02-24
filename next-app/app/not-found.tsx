'use client';

import Image from "next/image";
import Link from "next/link";
import Logo from "@/assets/GeekChat-Logo.svg";
import { useLocalization } from "@/global/contexts/LocalizationContext";
import {Button} from "@/global/components/ui/button";

export default function NotFound() {
    const { _t } = useLocalization();

    return (
        <div className="min-h-svh w-full flex flex-col items-center justify-center gap-6 p-6 bg-zinc-50 dark:bg-zinc-950">
            <Image
                width={80}
                height={80}
                src={Logo}
                alt="GeekChat"
                className="opacity-90"
            />
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
                {_t("page_not_found")}
            </p>
            <Link href="/">
                <Button>
                    {_t("home")}
                </Button>
            </Link>
        </div>
    );
}
