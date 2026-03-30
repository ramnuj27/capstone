import AuthCardLayout from '@/layouts/auth/auth-card-layout';
import AuthMinimalLayout from '@/layouts/auth/auth-minimal-layout';
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
    variant?: 'simple' | 'card' | 'minimal';
    children: React.ReactNode;
}) {
    const LayoutTemplate =
        variant === 'card'
            ? AuthCardLayout
            : variant === 'minimal'
              ? AuthMinimalLayout
              : AuthSimpleLayout;

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
