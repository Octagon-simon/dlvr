'use client';

import React, { useState, useCallback, ChangeEvent, FormEvent, useEffect } from 'react';
import {
    Button, Modal, ModalContent, ModalHeader, ModalOverlay,
    ModalCloseButton, ModalBody, ModalFooter, FormControl, FormErrorMessage,
    FormLabel, Input, Textarea, Spinner, useToast, Box
} from '@chakra-ui/react';
import { CompanyDTO, DispatchRiderDTO, OrderDTO } from '@/types';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { libraries } from '@/constants';
import axios, { AxiosError } from 'axios';
import AlertBox from '../common/AlertBox';

const GOOGLE_PLACES_API_KEY: string | undefined =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

//what to do to make it better? before booking is done, tell the user if there are no dispatch riders available at the moment using cloud function or cron
//also make it possible to book riders from other companies if the one you tried book is not available
//i would like to calculate how far the rider is from the order location
//a rider should be notified of the order and be able to accept or reject the order so the system can keep looking for new riders
//riders that has rejected up to 3 or 5 orders in a day should be placed on probation

//I would store order information and the paired dispatch rider on the db so that we can check whether the order has been accepted or rejected and update the dispatch rider accordingly... for example if the order was accepted already, the user should not be able to book a new rider unless he has a new order

export const BookRider: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    company?: CompanyDTO,
}> = ({ isOpen, onClose, company }) => {

    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    const [locationText, setLocationText] = useState("")
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const [response, setResponse] = useState<{
        status: 'info' | 'success' | 'error' | 'warning',
        message: string
    }>({
        status: 'info',
        message: ''
    })
    const [showResponse, setShowResponse] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState(false)

    const [formData, setFormData] = useState<Omit<OrderDTO, 'id' | 'createdAt'>>({
        status: 'pending',
        formattedAddress: '',
        companyId: company?.id || '',
        details: "",
        pickupAddress: {
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
                pickupAddress: {
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

    const ValidateForm = (): boolean => {
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

        return true
    }

    const handleContinue = async (e: FormEvent) => {
        try {
            e.preventDefault()

            setLoading(true)

            if (company?.id) {
                setFormData((prev) => ({
                    ...prev,
                    companyId: company?.id
                }))
            } else {
                toast({
                    title: "Error",
                    description: "Company ID is required",
                    status: "error",
                    duration: 3000,
                })
                setLoading(false)
                return
            }

            setLoading(true)

            if (ValidateForm() === false) return

            const response = await axios.post('api/dispatch-riders/order', formData)

            const { rider } = response.data as {
                rider: DispatchRiderDTO,
                message: string
            }
            setShowResponse(true)
            setOrderSuccess(true)
            setResponse({
                status: 'success',
                message: `You have been assigned a new rider named ${rider?.name}, who is located at ${rider.formattedAddress}.`,
            })

            setLoading(false)

            // const sampleResponse = {
            //     "message": "Rider assigned successfully",
            //     "rider": {
            //         "id": "N1BIgHL5kKRrIvXQm7g7", "formattedAddress": "Victoria Island, Lagos 106104, Lagos, Nigeria",
            //         "location": { "lng": 3.4238032, "lat": 6.429098199999999 },
            //         "name": "Tony Ugorji", "companyId": "YIRx5DwJXBjR7QnelcBU",
            //         "isAvailable": true
            //     }
            // }

            toast({
                title: "Success",
                description: "Order placed successfully",
                status: "success",
                duration: 3000,
            })
            setLoading(false)
        } catch (e) {
            // console.error("Error here", e)
            if (e instanceof AxiosError) {
                setShowResponse(true)
                setResponse({
                    status: 'error',
                    message: e.response?.data?.error,
                })
            } else {
                toast({
                    title: "Error",
                    description: "Order Failed",
                    status: "error",
                    duration: 3000,
                })
            }
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: '',
            whatsapp: '',
            details: '',
            formattedAddress: '',
            pickupAddress: {
                lat: 0,
                lng: 0,
            },
            companyId: '',
            status: 'pending',
        });

        setShowResponse(false);
        setOrderSuccess(false);
        setLocationText('');
        onClose();
    };

    return (
        (
            <Modal
                initialFocusRef={initialRef}
                finalFocusRef={finalRef}
                isOpen={isOpen}
                onClose={handleClose}
            >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Book a Dispatch Rider</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <Box>
                            <Box mb={5}>
                                {(showResponse) ?
                                    <AlertBox status={response?.status} message={response?.message} showCloseButton={false} />
                                    : null
                                }
                            </Box>
                            <FormControl
                                mb={3}
                            >
                                <FormLabel>
                                    Booking From
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
                                        Pickup Address
                                    </FormLabel>

                                    <Autocomplete
                                        onLoad={handleLoad}
                                        onPlaceChanged={handlePlaceChanged}
                                    >
                                        <Input
                                            id="address"
                                            type="text"
                                            placeholder="Enter Pickup Address"
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
                        </Box>
                    </ModalBody>

                    <ModalFooter>
                        {(!orderSuccess) ? <Button disabled={loading} isLoading={loading} colorScheme='green' mr={3} onClick={handleContinue}>
                            Continue
                        </Button> : null}

                        <Button onClick={handleClose}>{(orderSuccess) ? 'Okay' : 'Cancel'}</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    )
}