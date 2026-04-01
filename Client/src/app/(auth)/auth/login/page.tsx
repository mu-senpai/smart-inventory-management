import LoginForm from '@/components/pages/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login | Inventory Management',
    description: 'Sign in to your Inventory Management account',
};

export default function LoginPage() {
    return (
        <div className="w-full h-full max-w-7xl">
            {/* Right Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
