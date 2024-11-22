'use client'

import { libraries } from "@/constants"
import { DispatchRiderDTO } from "@/types"
import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, Select, Spinner, Text, useToast, } from "@chakra-ui/react"
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import axios from "axios"
import React, { ChangeEvent, FormEvent, useCallback, useState } from "react"
import AlertBox from "../common/AlertBox"
import { useCompanies } from "@/hooks/useCompanies"

const GOOGLE_PLACES_API_KEY: string | undefined =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

const RegisterDispatch = () => {

    const toast = useToast()
    const { loading: loadingCompanies, companies } = useCompanies()

    const [locationText, setLocationText] = useState("")
    const [loading, setLoading] = useState(false)
    const [hasRegistered, setHasRegistered] = useState(false)
    const [formData, setFormData] = useState<Omit<DispatchRiderDTO, 'id' | 'createdAt'>>({
        companyId: "",
        name: "",
        formattedAddress: "",
        location: {
            lat: 0,
            lng: 0,
        },
        isAvailable: false,
        whatsapp: ''
    })

    const [formErrors, setFormErrors] = useState<{
        id?: string,
        companyId?: string,
        name?: string,
        address?: string,
        whatsapp?: string
    }>({})

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_PLACES_API_KEY as string,
        libraries,
    })

    const [autocomplete, setAutocomplete] =
        useState<google.maps.places.Autocomplete | null>(null)

    const handleLoad = useCallback(
        (autocompleteInstance: google.maps.places.Autocomplete) =>
            setAutocomplete(autocompleteInstance),
        [],
    )

    const handlePlaceChanged = useCallback(() => {
        if (autocomplete) {
            const place = autocomplete.getPlace()
            const locationObject = {
                formatted_address: place.formatted_address,
                geometry: place.geometry
                    ? {
                        location: {
                            lat: place.geometry.location?.lat() ?? 0,
                            lng: place.geometry.location?.lng() ?? 0,
                        },
                    }
                    : undefined,
            }

            setFormData({
                ...formData,
                formattedAddress: locationObject.formatted_address || '',
                location: {
                    lat: locationObject.geometry?.location?.lat ?? 0,
                    lng: locationObject.geometry?.location?.lng ?? 0,
                }
            })

            setLocationText(locationObject.formatted_address || '')
        }
    }, [autocomplete, formData])


    if (!isLoaded) {
        return <div>Loading...</div>
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        e.preventDefault()

        setFormData({ ...formData, [e.currentTarget.id]: e.currentTarget.value })
    }

    const validateForm = (): Boolean => {

        if (formData?.name?.trim() === '') {
            setFormErrors({ ...formErrors, name: 'Your Name is required' })
            setLoading(false)
            return false
        }

        if (formData?.companyId?.trim() === '') {
            setFormErrors({ ...formErrors, companyId: 'Company Name is required' })
            setLoading(false)
            return false
        }

        if (formData?.formattedAddress?.trim() === '') {
            setFormErrors({ ...formErrors, address: 'Location is required' })
            setLoading(false)
            return false
        }

        if (formData?.whatsapp?.trim() === '') {
            setFormErrors({ ...formErrors, whatsapp: 'Your whatsapp number is required' })
            setLoading(false)
            return false
        }

        //reset form Errors
        setFormErrors({})

        const trimmedFormData = Object.fromEntries(
            Object.entries(formData).map(([key, value]) => {
                if (typeof value === 'string') {
                    return [key, value.trim()]; 
                }
                return [key, value]; 
            })
        );

        setFormData((prev) => ({
            ...prev,
            ...trimmedFormData
        }))

        return true;
    }

    const handleContinue = async (e: FormEvent): Promise<void> => {
        try {
            e.preventDefault()

            if (validateForm() === false) return

            setLoading(true)

            await axios.post('api/dispatch-riders/register', formData)

            toast({
                title: "Success",
                description: "Registration Successful",
                status: "success",
                duration: 3000,
            })

            setHasRegistered(true)
            setLoading(false)
        } catch (e) {
            console.error("Error here", e)
            toast({
                title: "Error",
                description: "Registration Failed",
                status: "error",
                duration: 3000,
            })
            setLoading(false)
        }
    }

    return (
        <Box
        >
            {(hasRegistered) ?
                <Box mb={5}>
                    <AlertBox status={"success"} message="Registration Successful! Please refresh this page to get an updated map" />
                </Box>
                : null}

            <Text fontWeight={"800"} fontSize={"2xl"} mb={8}>Register As a Disptach Rider</Text>

            <FormControl
                mb={3}
                isRequired
                isInvalid={typeof formErrors?.name !== 'undefined'}

            >
                <FormLabel>
                    Your Name
                </FormLabel>
                <Input
                    id="name"
                    onChange={handleChange}
                    value={formData?.name}
                    placeholder="Simon Ugorji"
                />
                <FormErrorMessage>
                    {formErrors?.name}
                </FormErrorMessage>
            </FormControl>

            <FormControl
                mb={3}
                isRequired
                isInvalid={typeof formErrors?.whatsapp !== 'undefined'}

            >
                <FormLabel>
                    Your Whatsapp Number
                </FormLabel>
                <Input
                    id="whatsapp"
                    onChange={handleChange}
                    value={formData?.whatsapp}
                    placeholder="081xxxxxxxx"
                />
                <FormErrorMessage>
                    {formErrors?.whatsapp}
                </FormErrorMessage>
            </FormControl>

            {(loadingCompanies) ? <Spinner /> :
                <FormControl
                    mb={3}
                    isRequired
                    isInvalid={typeof formErrors?.companyId !== 'undefined'}
                >
                    <FormLabel requiredIndicator={null} htmlFor="payment_type">
                        Select company
                    </FormLabel>
                    <Select
                        id="companyId"
                        onChange={handleChange}
                        placeholder="Select company"
                        defaultValue={formData?.companyId}
                    >
                        {(companies).map((data, ind) => {
                            return (
                                <option key={ind} value={data.id}>
                                    {data.companyName}
                                </option>
                            )
                        })}
                    </Select>
                </FormControl>
            }

            <FormControl
                mb={8}
                isRequired
                isInvalid={typeof formErrors?.address !== 'undefined'}
            >
                <FormLabel>
                    Address
                </FormLabel>

                <Autocomplete
                    onLoad={handleLoad}
                    onPlaceChanged={handlePlaceChanged}
                >
                    <Input
                        id="address"
                        type="text"
                        placeholder="Oshodi ....."
                        value={locationText}
                        onChange={(e) => setLocationText(e.target.value)}
                        autoComplete="off"
                    />
                </Autocomplete>
                <FormErrorMessage>
                    {formErrors?.address}
                </FormErrorMessage>

            </FormControl>

            <Button isLoading={loading} disabled={loading} onClick={handleContinue} colorScheme='blue' w="full"> Register </Button>
        </Box>
    )
}

export default RegisterDispatch