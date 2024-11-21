'use client';

import React, { useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormErrorMessage, FormLabel, Input, Textarea, Spinner, useToast } from '@chakra-ui/react';
import { CompanyDTO, OrderDTO } from '@/types';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { libraries } from '@/constants';
import axios from 'axios';

const GOOGLE_PLACES_API_KEY: string | undefined =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

//what to do to make it better? before booking is done, tell the user if there are no dispatch riders available at the moment using cloud function or cron
//also make it possible to book riders from other companies if the one you tried book is not available
//i would like to calculate how far the rider is from the order location

export const BookRider: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    company?: CompanyDTO,
}> = ({ isOpen, onClose, company }) => {

    // if (!company) return null;

    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    const [locationText, setLocationText] = useState("")
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    const [formData, setFormData] = useState<Omit<OrderDTO, 'id' | 'createdAt'>>({
        status: 'pending',
        formattedAddress: '',
        companyId: company?.id || '',
        details: "",
        orderLocation: {
            lat: 0,
            lng: 0,
        },
        name: '',
        whatsapp: ''
    })

    const [formErrors, setFormErrors] = useState<{
        name?: string,
        whatsapp?: string,
        details?: string,
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
                orderLocation: {
                    lat: locationObject.geometry?.location?.lat ?? 0,
                    lng: locationObject.geometry?.location?.lng ?? 0,
                }
            })

            setLocationText(locationObject.formatted_address || '')
        }
    }, [autocomplete, formData])

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        e.preventDefault()

        setFormData({ ...formData, [e.currentTarget.id]: e.currentTarget.value })
    }

    const ValidateForm = (): Boolean => {
        if (formData?.name?.trim() === '') {
            setFormErrors({ ...formErrors, name: 'Your Name is required' })
            setLoading(false)
            return false
        }

        if (formData?.formattedAddress?.trim() === '') {
            setFormErrors({ ...formErrors, address: 'Location is required' })
            setLoading(false)
            return false
        }

        if (formData?.whatsapp?.trim() === '') {
            setFormErrors({ ...formErrors, whatsapp: 'WhatsApp number is required' })
            setLoading(false)
            return false
        }

        if (formData?.details?.trim() === '') {
            setFormErrors({ ...formErrors, details: 'Order details is required' })
            setLoading(false)
            return false
        }

        //reset form Errors
        setFormErrors({})

        return true
    }


    const handleContinue = async (e: FormEvent) => {
        try {
            e.preventDefault()

            setLoading(true)

            if (ValidateForm() === false) return

            const response = await axios.post('api/dispatch-riders/order', formData)

            console.log(response)

            // toast({
            //     title: "Success",
            //     description: "Registration Successful",
            //     status: "success",
            //     duration: 3000,
            // })
            // setLoading(false)
        } catch (e) {
            console.error("Error here", e)
            toast({
                title: "Error",
                description: "Order Failed",
                status: "error",
                duration: 3000,
            })
            setLoading(false)
        }
    }

    return (
        (
            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={isOpen}
                onClose={onClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Book a Dispatch Rider</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <FormControl
                            mb={3}
                        >
                            <FormLabel>
                                Company Name
                            </FormLabel>
                            <Input
                                value={company?.companyName}
                                placeholder="company name"
                                readOnly
                                disabled
                            />
                        </FormControl>

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
                                placeholder="Victor Ugorji"
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

                        {(!isLoaded) ? <Spinner /> :
                            <FormControl
                                mb={3}
                                isRequired
                                isInvalid={typeof formErrors?.address !== 'undefined'}
                            >
                                <FormLabel>
                                    Order Location
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
                        }
                        <FormControl
                            mb={3}
                            isRequired
                            isInvalid={typeof formErrors?.details !== 'undefined'}
                        >
                            <FormLabel>
                                Order Details
                            </FormLabel>
                            <Textarea
                                id="details"
                                onChange={handleChange}
                                value={formData?.details}
                                placeholder="I want...."
                            />
                            <FormErrorMessage>
                                {formErrors?.details}
                            </FormErrorMessage>
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleContinue}>
                            Continue
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    )
}