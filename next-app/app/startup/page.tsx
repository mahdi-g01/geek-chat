'use client'

import React, {FormEvent, useEffect, useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import {Button} from "@/global/components/ui/button";
import {useRouter} from "next/navigation";
import PageResponsiveBoxContainer from "@/global/components/PageResponsiveBoxContainer";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/global/components/ui/select";
import availableLanguages from "@/resources/availableLanguages";
import {Languages, useLocalization} from "@/global/contexts/LocalizationContext";
import availableDatabases from "@/resources/availableDatabases";
import {LabeledInput} from "@/global/components/ui/input";
import {ResponseError} from "@/rest/RestMethod";
import SetupAdmin from "@/rest/methods/startup/SetupAdmin";
import {LoaderIcon} from "lucide-react";
import Logo from "@/assets/GeekChat-Logo.svg";
import Image from "next/image";
import SelfCenteredLoaderIcon from "@/global/components/SelfCenteredLoaderIcon";
import SelfCenteredErrorIcon from "@/global/components/SelfCenteredErrorIcon";
import useStageCheckHandler from "@/app/startup/hooks/useStageCheckHandler";
import useConfigurationChain from "@/app/startup/hooks/useConfigurationChain";

type Steps = "1" | "2" | "3" | "4"

export default function Page() {

    const [setupStep, setSetupStep] = useState<Steps>("1");

    // Error texts
    const [dbInitiationError, setDbInitiationError] = useState<string | null>();
    const [adminConfigError, setAdminConfigError] = useState<string | null>();

    // Loading states
    const [initiatingDB, setInitiatingDB] = useState(false);
    const [configuringAdmin, setConfiguringAdmin] = useState(false);

    const rest = useRestMethod();
    const router = useRouter();
    const {_t, setLanguage} = useLocalization();

    // Configurations states
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const [dbConfigs, setDbConfigs] = useState({
        engine: "mysql",
        host: "localhost",
        port: "3306",
        database: "",
        username: "root",
        password: "",
    });
    const [adminConfigs, setAdminConfigs] = useState({
        user_name: "",
        password: ""
    });

    const {handleStageCheck, stageIsOkForStartupProcedure, loadingStage, stageLoadError} = useStageCheckHandler();

    const {
        handleConfigurationChain,
        loading: configuring,
        step: configStep,
        hasError: hasConfigError,
        errorText: configErrorText
    } = useConfigurationChain({
        selectedLanguage, dbConfigs
    })

    useEffect(() => {
        handleStageCheck().then(done => {

        })
    }, []);

    useEffect(() => {
        setLanguage(selectedLanguage as Languages)
    }, [selectedLanguage, setLanguage]);


    const changeDbConfigs = (key: keyof typeof dbConfigs, val: string) => {
        setDbConfigs(prev => ({
            ...prev,
            [key]: val
        }))
    }

    const changeAdminConfigs = (key: keyof typeof adminConfigs, val: string) => {
        setAdminConfigs(prev => ({
            ...prev,
            [key]: val
        }))
    }

    const changeStep = (step: Steps) => {
        setSetupStep(step);
    }

    const handlePostStartupAction = () => {
        router.replace("/");
    }

    const handleDBFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        handleConfigurationChain().then(successful => {
            if (successful) {
                changeStep("3");
            }
        })

    }

    const handleAdminConfigFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setConfiguringAdmin(true);
        setAdminConfigError(undefined);
        rest.execute(SetupAdmin, adminConfigs)
            .then(() => {
                changeStep("4");
            })
            .catch((err: ResponseError) => {
                setAdminConfigError(err.message)
            })
            .finally(() => {
                setConfiguringAdmin(false);
            })
    }

    if (loadingStage)
        return <SelfCenteredLoaderIcon loading={loadingStage}/>

    if (stageLoadError)
        return <SelfCenteredErrorIcon show={true} text={stageLoadError}/>

    if (!stageIsOkForStartupProcedure) {
        return <></>
    }

    return <>
        <PageResponsiveBoxContainer maxWidth={400} className={"flex flex-col items-center gap-5"}>

            <div className={"w-full flex-1 overflow-y-auto flex flex-col gap-5 p-5 justify-center items-center"}>

                {setupStep == "1" && <>
                    {/* This step is introduction and language selection */}

                    <div className={"grow flex flex-col items-center justify-center gap-2 "}>
                        <Image
                            width={80}
                            height={80}
                            src={Logo}
                            alt="GeekChat"
                            className="opacity-90"
                        />

                        <h1 className={"font-medium text-muted-foreground text-xl"}><strong>Geek</strong>Chat</h1>

                    </div>

                    <div className={"flex flex-col gap-2 items-center py-10"}>

                        <h2 className={"font-medium"}>{_t("startup_welcome")}</h2>

                        <Select value={selectedLanguage} onValueChange={(e) => setSelectedLanguage(e)}>
                            <SelectTrigger className="w-full max-w-48">
                                <SelectValue placeholder="Language | زبان"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Language | زبان</SelectLabel>
                                    {Object.keys(availableLanguages).map(lang =>
                                        <SelectItem value={lang} key={lang}>{availableLanguages[lang]}</SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                        <p className={"text-sm font-extrabold text-muted-foreground text-center"}>
                            {_t("startup_intro_1")}
                            <br/>
                            {_t("startup_intro_2")}
                            <br/>
                            {_t("startup_intro_3")}
                        </p>

                        <Button onClick={() => changeStep("2")}>
                            {_t("lets_go")}
                        </Button>

                    </div>

                </>}

                {setupStep == "2" && <>
                    {/* This step is for database configuration */}

                    <h2 className={"font-medium"}>
                        {_t("startup_db_config_title")}
                    </h2>

                    <form className={"w-full flex flex-col gap-4"} onSubmit={handleDBFormSubmit}>

                        <Select value={dbConfigs.engine} disabled={configuring}
                                onValueChange={(e) => changeDbConfigs("engine", e)}>

                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={_t("db_engine")}/>
                            </SelectTrigger>

                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>{_t("select")}</SelectLabel>
                                    {Object.keys(availableDatabases).map(db =>
                                        <SelectItem value={db} key={db}>{availableDatabases[db]}</SelectItem>
                                    )}
                                </SelectGroup>
                            </SelectContent>

                        </Select>

                        {dbConfigs.engine != "sqlite" ? <>

                            <LabeledInput label={"Database host"} disabled={configuring}
                                          value={dbConfigs.host}
                                          onChange={e => changeDbConfigs("host", e.target.value)}
                                          required={dbConfigs.database != "sqlite"}/>

                            <LabeledInput label={"Database port"} disabled={configuring}
                                          value={dbConfigs.port}
                                          onChange={e => changeDbConfigs("port", e.target.value)}
                                          required={dbConfigs.database != "sqlite"}/>

                            <LabeledInput label={"Database name"} disabled={configuring}
                                          value={dbConfigs.database}
                                          onChange={e => changeDbConfigs("database", e.target.value)}
                                          required={dbConfigs.database != "sqlite"}/>

                            <LabeledInput label={"Database username"} disabled={configuring}
                                          value={dbConfigs.username}
                                          onChange={e => changeDbConfigs("username", e.target.value)}
                                          required={dbConfigs.database != "sqlite"}/>

                            <LabeledInput label={"Database password"} disabled={configuring}
                                          value={dbConfigs.password}
                                          onChange={e => changeDbConfigs("password", e.target.value)}/>

                        </> : <p className={"text-sm text-destructive text-center"}>
                            {_t("sqlite_warning")}
                        </p>}

                        <Button type={"submit"} disabled={configuring}>
                            {(configuring) ?
                                <LoaderIcon className={"animate-spin"}/>
                                : _t("next_step")}
                        </Button>

                        {hasConfigError &&
                            <p className={"text-xs line-clamp-5 text-destructive bg-destructive/5 rounded-md p-1 text-center"}>
                                {configErrorText}
                            </p>}

                    </form>

                </>}

                {setupStep == "3" && <>
                    {/* This step is for setting admin config and login info */}

                    <h2 className={"font-medium"}>
                        {_t("startup_admin_config_title")}
                    </h2>

                    <form className={"w-full flex flex-col gap-4"} onSubmit={handleAdminConfigFormSubmit}>

                        <LabeledInput label={_t("user_name")} name={"user-name"}
                                      value={adminConfigs.user_name} type={"text"}
                                      onChange={e => changeAdminConfigs("user_name", e.target.value)}
                                      required/>

                        <LabeledInput label={_t("password")} name={"password"}
                                      value={adminConfigs.password} type={"password"}
                                      onChange={e => changeAdminConfigs("password", e.target.value)}
                                      required/>

                        <Button type={"submit"}>
                            {configuringAdmin ? <LoaderIcon className={"animate-spin"}/> : _t("next_step")}
                        </Button>

                        {adminConfigError &&
                            <p className={"text-xs line-clamp-5 text-destructive bg-destructive/5 rounded-md p-1 text-center"}>
                                {adminConfigError}
                            </p>}

                    </form>
                </>}

                {setupStep == "4" && <>
                    {/* This step is for showing final results and a click to login */}

                    <h2 className={"font-medium"}>
                        {_t("final_step_title")}
                    </h2>

                    <p>
                        {_t("final_step_description")}
                    </p>

                    <Button onClick={handlePostStartupAction}>
                        {_t("final_step_button")}
                    </Button>

                </>}

            </div>

        </PageResponsiveBoxContainer>
    </>
}

function ConfigurationSteps() {
    return <div>

    </div>
}