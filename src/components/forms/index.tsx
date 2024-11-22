'use client'

import { Box, Flex, Text, } from "@chakra-ui/react"
import React, { useState } from "react"
import RegisterDispatch from "./Dispatch"
import RegisterCompany from "./Company"

const RegistrationForm = () => {

    const [showDispatchForm, setShowDispatchForm] = useState(false);

    return (
        <Box
            border={"1px solid #bbb"}
            backgroundColor={'#fff'}
            p={10}
            minHeight={"100%"}
        >
            {(showDispatchForm) ? <RegisterDispatch /> : <RegisterCompany />}

            <Flex flexDir={"column"} mt={5}>
                <Text textAlign={"center"}>You&apos;re registering as a {(showDispatchForm) ? 'dispatch rider' : 'Logistics company'}. </Text>
                <Text textAlign={"center"} cursor={"pointer"} onClick={() => setShowDispatchForm(!showDispatchForm)} color={"blue"} textDecor={"underline"}>
                    Click here to register as a {(showDispatchForm) ? 'company' :  'dispatch rider' } instead
                </Text>
            </Flex>
        </Box>
    )
}

export default RegistrationForm;