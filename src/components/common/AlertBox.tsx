import { AlertTitle, Alert, AlertDescription, AlertIcon, useDisclosure, CloseButton, Box, } from "@chakra-ui/react"

const AlertBox: React.FC<{
    message: string
}> = ({ message }) => {

    const {
        onClose,
        isOpen
    } = useDisclosure({ defaultIsOpen: true })

    return (
        isOpen ? (
            <Alert status='info'>
                <AlertIcon />
                <Box>
                    <AlertTitle>Success!</AlertTitle>
                    <AlertDescription>
                        {message}
                    </AlertDescription>
                </Box>
                <CloseButton
                    alignSelf='flex-start'
                    position='relative'
                    right={-1}
                    top={-1}
                    onClick={onClose}
                />
            </Alert>
        ) : null
    )
}

export default AlertBox