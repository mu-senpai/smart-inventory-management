'use client';

import Logo from '@/components/shared/Logo';
import { useLazyGetMeQuery, useLoginMutation, useDemoLoginMutation } from '@/redux/api/authApi';
import { setUser } from '@/redux/features/authSlice';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';

interface LoginFormData {
    email: string;
    password: string;
    remember: boolean;
}

export default function LoginForm() {
    const [form] = Form.useForm();
    const router = useRouter();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();
    const [demoLogin, { isLoading: isDemoLoading }] = useDemoLoginMutation();
    const [getMe] = useLazyGetMeQuery();

    const handleSuccess = async () => {
        // Token is now handled as HttpOnly cookie by the proxy layer.
        // We just need to fetch user profile.
        try {
            const meResult = await getMe().unwrap();
            if (meResult.success) {
                dispatch(setUser(meResult.data));
            }
        } catch {
            // getMe might fail if proxy didn't set cookie properly - still navigate
        }
        toast.success('Login successful!');
        router.push('/dashboard');
    };

    const onFinish = async (values: LoginFormData) => {
        try {
            const result = await login({
                email: values.email,
                password: values.password,
            }).unwrap();

            if (result.success) {
                await handleSuccess();
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Login failed. Please try again.');
        }
    };

    const handleDemoLogin = async () => {
        try {
            const result = await demoLogin().unwrap();
            if (result.success) {
                await handleSuccess();
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Demo login failed. Please try again.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header Outside of Card */}
            <div className="text-center mb-8 flex flex-col items-center">
                <Logo className="mb-10 scale-120" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2 transition-colors">Welcome Back</h2>
                <p className="text-gray-500 dark:text-gray-400 text-base transition-colors">Sign in to your account</p>
            </div>

            {/* Card Container */}
            <div className="bg-white/95 dark:bg-[#141414]/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-white/10 p-8 sm:p-10 mb-8 mt-2 transition-colors">

                {/* Form */}
                <Form
                    form={form}
                    name="loginForm"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                    initialValues={{
                        email: '',
                        password: '',
                        remember: false,
                    }}
                >
                    {/* Email Field */}
                    <Form.Item
                        label={<span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Email</span>}
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                            { type: 'email', message: 'Please enter a valid email!' }
                        ]}
                    >
                        <Input
                            placeholder="admin@gmail.com"
                            className="h-12 rounded-xl border-gray-200 dark:border-[#303030] dark:bg-[#1f1f1f] dark:text-white hover:border-[#272877] dark:hover:border-[#6e6fe4] focus:border-[#272877] transition-colors"
                            prefix={<UserOutlined className="text-gray-400 dark:text-gray-500 mr-2" />}
                        />
                    </Form.Item>

                    {/* Password Field */}
                    <Form.Item
                        label={<span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Password</span>}
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                        className="!mb-2"
                    >
                        <Input.Password
                            placeholder="••••••••••••"
                            className="h-12 rounded-xl border-gray-200 dark:border-[#303030] dark:bg-[#1f1f1f] dark:text-white hover:border-[#272877] dark:hover:border-[#6e6fe4] focus:border-[#272877] transition-colors"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined className="dark:text-gray-500" />)}
                            prefix={<LockOutlined className="text-gray-400 dark:text-gray-500 mr-2" />}
                        />
                    </Form.Item>

                    {/* Remember Me */}
                    <div className="flex items-center mb-8">
                        <Form.Item name="remember" valuePropName="checked" className="!mb-0">
                            <Checkbox className="text-gray-600 dark:text-gray-400 transition-colors">
                                Remember me
                            </Checkbox>
                        </Form.Item>
                    </div>

                    {/* Login Button */}
                    <Form.Item className="!mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            disabled={isDemoLoading}
                            block
                            className="h-12 flex-1 rounded-xl !bg-[#272877] !border-none font-semibold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Sign In
                        </Button>
                    </Form.Item>

                    {/* Additional Options */}
                    <div className="mt-6 flex flex-col gap-4">
                        <Button
                            type="dashed"
                            onClick={handleDemoLogin}
                            loading={isDemoLoading}
                            disabled={isLoading}
                            block
                            className="h-12 flex-1 rounded-xl font-semibold text-base shadow-sm transition-all duration-200"
                        >
                            Or Use Demo Account
                        </Button>
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Don&apos;t have an account?{' '}
                            <Link href="/auth/signup" className="font-semibold text-[#272877] dark:text-[#6e6fe4] hover:underline transition-colors">
                                Sign up here
                            </Link>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
