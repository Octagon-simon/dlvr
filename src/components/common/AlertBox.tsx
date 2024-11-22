import { AlertTitle, Alert, AlertDescription, AlertIcon, useDisclosure, CloseButton, Box, } from "@chakra-ui/react"

const AlertBox: React.FC<{
    message: string;
    status: 'success' | 'error' | 'warning' | 'info';
    showCloseButton?: boolean
}> = ({ message, status, showCloseButton = true }) => {

    const {
        onClose,
        isOpen
    } = useDisclosure({ defaultIsOpen: true })

    return (
        isOpen ? (
            <Alert status={status}>
                <AlertIcon />
                <Box>
                    {/* <AlertTitle>Success!</AlertTitle> */}
                    <AlertDescription>
                        {message}
                    </AlertDescription>
                </Box>
                {(showCloseButton) ? <CloseButton
                    alignSelf='flex-start'
                    position='relative'
                    right={-1}
                    top={-1}
                    onClick={onClose}
                /> : null}
            </Alert>
        ) : null
    )
}

export default AlertBox