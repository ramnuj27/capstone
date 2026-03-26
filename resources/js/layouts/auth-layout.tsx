import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import AuthSimpleLayout from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    title = '',
    description = '',
    contentWidth = 'default',
    variant = 'simple',
    children,
}: {
    title?: string;
    description?: string;
    contentWidth?: 'default' | 'wide';
    variant?: 'simple' | 'card';
    children: React.ReactNode;
}) {
    const LayoutTemplate =
        variant === 'card' ? AuthCardLayout : AuthSimpleLayout;

    return (
        <LayoutTemplate
            title={title}
            description={description}
            contentWidth={contentWidth}
        >
            {children}
        </LayoutTemplate>
    );
}
