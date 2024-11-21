'use client';

import React, { useState, useCallback, ChangeEvent } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalOverlay, ModalCloseButton, ModalBody, ModalFooter, FormControl, FormErrorMessage, FormLabel, Input, Textarea } from '@chakra-ui/react';
import { OrderDTO } from '@/types';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { libraries } from '@/constants';

const GOOGLE_PLACES_API_KEY: string | undefined =
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

export const BookRider: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    companyName: string
}> = ({ isOpen, onClose, companyName }) => {
    const initialRef = React.useRef(null)
    const finalRef = React.useRef(null)
    const [locationText, setLocationText] = useState("")

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

    const [formData, setFormData] = useState<Omit<OrderDTO, 'id' | 'createdAt'>>({
        status: 'pending',
        formattedAddress: '',
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
                                Booking From
                            </FormLabel>
                            <Input
                                value={companyName}
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
                        <Button colorScheme='blue' mr={3}>
                            Save
                        </Button>
                        <Button onClick={onClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        )
    )
}