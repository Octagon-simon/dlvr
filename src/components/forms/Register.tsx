'use client'

import { Box, Button, FormControl, FormErrorMessage, FormLabel, Input, Text, Toast } from "@chakra-ui/react"
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api"
import { ChangeEvent, useCallback, useState } from "react"

const GOOGLE_PLACES_API_KEY: string | undefined =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

const libraries: 'places'[] = ['places']

export interface LocationObject {
    formatted_address?: string
    geometry?: {
        location?: {
            lat: number
            lng: number
        }
    }
    [key: string]: unknown
}

const Registration = () => {

    const [locationText, setLocationText] = useState("")
    const [locationObject, setLocationObject] = useState<LocationObject>()

    console.log(locationObject)

    const [formData, setFormData] = useState({
        companyName: '',
        whatsapp: '',
        email: ''
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
            const locationObject: LocationObject = {
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
            const locationText = locationObject.formatted_address || ''
            setLocationText(locationText)
            setLocationObject(locationObject)
        }
    }, [autocomplete])


    if (!isLoaded) {
        return <div>Loading...</div>
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()

        setFormData({ ...formData, [e.currentTarget.id]: e.currentTarget.value })
    }

    const handleContinue = () => {
        try {
            if (formData?.companyName?.trim() === '') {
                setFormErrors({ ...formErrors, companyName: 'Company Name is required' })
                return
            }
            if (formData?.whatsapp?.trim() === '') {
                setFormErrors({ ...formErrors, whatsapp: 'WhatsApp number is required' })
                return
            }
            if (formData?.email?.trim() === '' || !formData?.email?.includes('@')) {
                setFormErrors({ ...formErrors, email: 'Email is required and should contain a valid domain' })
                return
            }


        } catch (e) {
            console.error(e)
            Toast({
                title: "Error",
                description: "Failed to continue with registration",
                status: "error",
                duration: 3000,
            })
        }
    }

    return (
        <Box
            border={"1px solid #bbb"}
            backgroundColor={'#fff'}
            p={10}
            minHeight={"100%"}
        >

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
                isRequired
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

            <Button onClick={handleContinue} colorScheme='blue' w="full"> Register </Button>
        </Box>
    )
}

export default Registration