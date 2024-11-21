import { DispatchRiderDTO } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";

export const useRiders = () => {
    const [loading, setLoading] = useState(true);

    const [riders, setRiders] = useState<DispatchRiderDTO[]>([]);

    useEffect(() => {
        const fetchRiders = async () => {
            try {
                setLoading(true);

                const response = await axios.get('api/dispatch-riders/get-all')

                if (response?.data && Object.keys(response.data?.data).length) {
                    const responseData = response.data.data as DispatchRiderDTO[]
                    setRiders(responseData)
                }
                setLoading(false)
            } catch (e) {
                console.error(e);
                setLoading(false)
            }
        }
        fetchRiders()
    }, [])


    return {riders, loading};
}