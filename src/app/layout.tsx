import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { DataProvider } from '@/context/DataContext'
import { AuthProvider } from '@/context/AuthContext'
import { AppLayout } from '@/components/AppLayout'

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
    title: 'Digital India Platform',
    description: 'Connecting rural India to the future economy. Zero investment. Maximum growth.',
    keywords: ['Digital India', 'FinTech', 'E-Commerce', 'Financial Inclusion'],
    authors: [{ name: 'Devaramane Events and Industries' }],
    openGraph: {
        title: 'Digital India Platform',
        description: 'Connecting rural India to the future economy',
        type: 'website',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
            </head>
            <body className={plusJakartaSans.className}>
                <AuthProvider>
                    <DataProvider>
                        <AppLayout>
                            {children}
                        </AppLayout>
                    </DataProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
