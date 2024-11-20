'use client'

import React from "react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

export default function Providers({ children }: { children: React.ReactNode }) {
    const theme = extendTheme({
        config: {
            initialColorMode: 'light',
            useSystemColorMode: false,
        },
    });

    return (
        <ChakraProvider theme={theme}>
            {children}
        </ChakraProvider>
    )
}