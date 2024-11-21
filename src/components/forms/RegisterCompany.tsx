'use client'

import { libraries } from "@/constants"
import { CompanyDTO } from "@/types"
import { Box, Button, Flex, FormControl, FormErrorMessage, FormLabel, Input, Link, Text, useToast, } from "@chakra-ui/react"
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import axios from "axios"
import React, { ChangeEvent, FormEvent, useCallback, useState } from "react"
import AlertBox from "../common/AlertBox"

const GOOGLE_PLACES_API_KEY: string | undefined =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

const RegisterCompany = () => {

    const toast = useToast()

    const [locationText, setLocationText] = useState("")
    const [loading, setLoading] = useState(false)
    const [hasRegistered, setHasRegistered] = useState(false)
    const [formData, setFormData] = useState<CompanyDTO>({
        companyName: '',
        whatsapp: '',
        email: '',
        location: {
            lat: 0,
            lng: 0,
        },
        formattedAddress: '',
    })

    const [formErrors, setFormErrors] = useState<{
        companyName?: string,
        whatsapp?: string,
        email?: string,
        address?: string
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        setFormData({ ...formData, [e.currentTarget.id]: e.currentTarget.value })
    }

    const handleContinue = async (e: FormEvent) => {
        try {
            e.preventDefault()

            setLoading(true)

            if (formData?.companyName?.trim() === '') {
                setFormErrors({ ...formErrors, companyName: 'Company Name is required' })
                setLoading(false)
                return
            }

            if (formData?.formattedAddress?.trim() === '') {
                setFormErrors({ ...formErrors, address: 'Location is required' })
                setLoading(false)
                return
            }

            if (formData?.whatsapp?.trim() === '') {
                setFormErrors({ ...formErrors, whatsapp: 'WhatsApp number is required' })
                setLoading(false)
                return
            }

            //email is optional
            if (formData?.email?.trim() !== '' && !formData?.email?.includes('@')) {
                setFormErrors({ ...formErrors, email: 'Email is required and should contain a valid domain' })
                setLoading(false)
                return
            }

            //reset form Errors
            setFormErrors({})

            await axios.post('api/companies/register', formData)

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
            border={"1px solid #bbb"}
            backgroundColor={'#fff'}
            p={10}
            minHeight={"100%"}
        >
            {(hasRegistered) ?
                <Box mb={5}>
                    <AlertBox message="Registration Successful! Please refresh this page to get an updated map" />
                </Box>
                : null}

            <Text fontWeight={"800"} fontSize={"2xl"} mb={8}>Register Company</Text>

            <FormControl
                mb={3}
                isRequired
                isInvalid={typeof formErrors?.companyName !== 'undefined'}

            >
                <FormLabel>
                    Company Name
                </FormLabel>
                <Input
                    id="companyName"
                    onChange={handleChange}
                    value={formData?.companyName}
                    placeholder="DLVR..."
                />
                <FormErrorMessage>
                    {formErrors?.companyName}
                </FormErrorMessage>
            </FormControl>

            <FormControl
                mb={3}
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
            <FormControl
                mb={3}
                isRequired
                isInvalid={typeof formErrors?.whatsapp !== 'undefined'}
            >
                <FormLabel>
                    Whatsapp Number
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

            <FormControl
                mb={8}
                isInvalid={typeof formErrors?.email !== 'undefined'}
            >
                <FormLabel>
                    Email Address
                </FormLabel>
                <Input
                    id="email"
                    onChange={handleChange}
                    value={formData?.email}
                    placeholder="me@dlvr.com"
                />
                <FormErrorMessage>
                    {formErrors?.email}
                </FormErrorMessage>
            </FormControl>

            <Button isLoading={loading} disabled={loading} onClick={handleContinue} colorScheme='blue' w="full"> Register </Button>
            <Flex flexDir={"column"} mt={5}>
                <Text>You&apos;re registering as a Logistics company. </Text>
                <Link color={"blue"} href="/dispatch-rider">
                    Click here to register as a dispatch rider instead
                </Link>
            </Flex>
        </Box>
    )
}

export default RegisterCompany;