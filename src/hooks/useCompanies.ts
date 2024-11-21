import { CompanyDTO } from "@/types";
import axios from "axios";
import { useEffect, useState } from "react";

export const useCompanies = () => {
    const [loading, setIsLoading] = useState(true);

    const [companies, setCompanies] = useState<CompanyDTO[]>([]);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const response = await axios.get('api/companies/get-all')

                if (response?.data && Object.keys(response.data?.data).length) {
                    const responseData = response.data.data as CompanyDTO[]
                    setCompanies(responseData)
                }
                setIsLoading(false)
            } catch (e) {
                console.error(e);
                setIsLoading(false)
            }
        }

        fetchCompanies()
    }, [])


    return {companies, loading};
}