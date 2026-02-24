import {useCallback, useEffect, useState} from "react";
import {useRestMethod} from "@/global/contexts/RestApiContext";
import {UserPublic} from "@/rest/types/User";
import SearchUsers from "@/rest/methods/app/SearchUsers";

export default function useSearchMode(
    {query}: { query: string }
) {

    const [searching, setSearching] = useState(false);
    const [resultUsers, setResultUsers] = useState<UserPublic[] | undefined>(undefined);

    const rest = useRestMethod();

    const performSearch = useCallback(()=>{
        return rest.execute(SearchUsers, {
            query
        });
    }, [query, rest]);

    useEffect(() => {
        if (query == undefined || query == "")
            return;
        const to = setTimeout(() => {
            setSearching(true);
            performSearch()
                .then(res => setResultUsers(res.users))
                .finally(()=>setSearching(false))
        }, 500);
        return () => {
            clearTimeout(to);
            setSearching(false);
        }
    }, [query]);

    return {
        resultUsers, searching, searchModeIsActive: query != undefined && query != ""
    }

}