'use client'

import React, {FormEvent, useRef, useState} from "react";
import {useLocalization} from "@/global/contexts/LocalizationContext";
import {cn} from "@/lib/utils";
import PageResponsiveBoxContainer from "@/global/components/PageResponsiveBoxContainer";
import {useUser} from "@/global/contexts/UserContext";
import AvatarImage from "@/global/components/AvatarImage";
import {Input, LabeledInput} from "@/global/components/ui/input";
import PageHeader from "@/global/components/PageHeader";
import {Button} from "@/global/components/ui/button";
import {CheckIcon, LoaderIcon, UploadIcon} from "lucide-react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import UpdateAvatar from "@/rest/methods/app/UpdateAvatar";
import {ResponseError} from "@/rest/RestMethod";
import UpdateProfileInfo from "@/rest/methods/app/UpdateProfileInfo";

export default function Page() {

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [updatingInfo, setUpdatingInfo] = useState(false);

    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | undefined>();
    const avatarInputRef = useRef<HTMLInputElement | null>(null);

    const {_t} = useLocalization();
    const {user, reloadUserInfo} = useUser();
    const rest = useRestMethod();

    const handleAvatarUpload = () => {
        setUploadingAvatar(true);
        rest.execute(UpdateAvatar, {image: selectedAvatarFile!})
            .then(() => {
                setSelectedAvatarFile(undefined);
                reloadUserInfo();
            })
            .catch((err: ResponseError) => {

            })
            .finally(() => {
                setUploadingAvatar(false);
            })
    }

    const handleInfoSubmitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = (e.target as HTMLFormElement);
        const formData = new FormData(form);

        setUpdatingInfo(true);
        rest.execute(UpdateProfileInfo, {formdata: formData})
            .then(() => {
                reloadUserInfo();
            })
            .catch((err: ResponseError) => {

            })
            .finally(() => {
                setUpdatingInfo(false);
            })
    }

    return (
        <PageResponsiveBoxContainer maxWidth={500}>

            <div className={cn(
                "w-full h-full  relative flex flex-col",
            )}>

                <PageHeader title={_t("page_title_profile")}/>

                <div className={"flex-1 w-full flex flex-col items-center overflow-y-auto gap-10 p-10"}>

                    <div className={"w-[210px] h-[210px] min-h-[210px] relative flex items-center justify-center"}>

                        {/* Handling what to show to user */}
                        {selectedAvatarFile
                            ? <img src={URL.createObjectURL(selectedAvatarFile)} width={195} height={195}
                                   className={"w-[195px] h-[195px] object-cover rounded-full"}/>
                            : <div className={"group w-[195px] h-[195px]"} onClick={() => {
                                avatarInputRef.current?.click()
                            }}>
                                <div className={cn(
                                    "opacity-0 invisible",
                                    "group-hover:opacity-100 group-hover:visible cursor-pointer",
                                    "bg-card/60 absolute z-10 top-0 left-0 w-full h-full rounded-full",
                                    "flex items-center justify-center w-full h-full"
                                )}>
                                    <UploadIcon size={30}/>
                                </div>
                                <AvatarImage user={user} size={195}/>
                            </div>}

                        {(selectedAvatarFile && !uploadingAvatar) &&
                            <div className={cn(
                                "w-[40px] h-[40px] bg-success rounded-full absolute end-3 bottom-3",
                                "hover:brightness-75 cursor-pointer",
                                "flex items-center justify-center",
                            )} onClick={handleAvatarUpload}>
                                <CheckIcon size={24} color={"white"}/>
                            </div>}

                        <input
                            className={"absolute top-0 left-0 hidden w-full h-full"}
                            ref={avatarInputRef} type={"file"} accept={".jpg,.jpeg,.png"}
                            onChange={e => {
                                if (e.target.files && e.target.files[0])
                                    setSelectedAvatarFile(e.target.files[0]);
                            }}/>

                        {uploadingAvatar && <div className={cn(
                            "w-full h-full absolute top-0 left-0",
                            "rounded-full border-primary border-t-2",
                            "animate-spin bg-white/20"
                        )}/>}

                    </div>

                    <form className={"w-full flex flex-col gap-10"} onSubmit={handleInfoSubmitForm}>

                        <Input defaultValue={`${_t("user_name")}: ${user?.user_name}`}
                               className={"text-center line-clamp-1"} disabled readOnly/>

                        <LabeledInput
                            required
                            label={_t("public_name")}
                            containerClassName={"w-full"}
                            defaultValue={user?.public_name} id={"input-public-name"}
                            min={2} max={255} name={"public_name"}
                            className={"text-center line-clamp-1"}/>

                        <LabeledInput
                            label={_t("bio_text")}
                            containerClassName={"w-full"}
                            defaultValue={user?.bio_text} id={"input-bio-text"}
                            min={2} max={1000} name={"bio_text"}
                            className={"text-center line-clamp-1"}/>

                        <Button type={"submit"}>
                            {updatingInfo ? <LoaderIcon color={"white"} className={"animate-spin"}/> : _t("save")}
                        </Button>

                    </form>

                </div>

            </div>

        </PageResponsiveBoxContainer>
    );
}