'use client';

import Logo from '@/components/shared/Logo';
import { useSignupMutation } from '@/redux/api/authApi';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SignupFormData {
    email: string;
    password: string;
    confirmPassword: string;
}

export default function SignupForm() {
    const [form] = Form.useForm();
    const router = useRouter();
    const [signup, { isLoading }] = useSignupMutation();

    const onFinish = async (values: SignupFormData) => {
        try {
            const result = await signup({
                email: values.email,
                password: values.password,
                role: 'Manager', // Optional default per backend docs
            }).unwrap();

            if (result.success) {
                toast.success('Registration successful! Please log in.');
                router.push('/auth/login');
            }
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            toast.error(err?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Header Outside of Card */}
            <div className="text-center mb-8 flex flex-col items-center">
                <Logo className="mb-10 scale-120" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2 transition-colors">Create an Account</h2>
                <p className="text-gray-500 dark:text-gray-400 text-base transition-colors">Join Smart Inventory today</p>
            </div>

            {/* Card Container */}
            <div className="bg-white/95 dark:bg-[#141414]/95 backdrop-blur-sm rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-gray-100 dark:border-white/10 p-8 sm:p-10 mb-8 mt-2 transition-colors">
                {/* Form */}
                <Form
                    form={form}
                    name="signupForm"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
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
                            placeholder="admin@company.com"
                            className="h-12 rounded-xl border-gray-200 dark:border-[#303030] dark:bg-[#1f1f1f] dark:text-white hover:border-[#272877] dark:hover:border-[#6e6fe4] focus:border-[#272877] transition-colors"
                            prefix={<UserOutlined className="text-gray-400 dark:text-gray-500 mr-2" />}
                        />
                    </Form.Item>

                    {/* Password Field */}
                    <Form.Item
                        label={<span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Password</span>}
                        name="password"
                        rules={[
                            { required: true, message: 'Please input a password!' },
                            { min: 6, message: 'Password must be at least 6 characters!' }
                        ]}
                        className="!mb-6"
                    >
                        <Input.Password
                            placeholder="••••••••••••"
                            className="h-12 rounded-xl border-gray-200 dark:border-[#303030] dark:bg-[#1f1f1f] dark:text-white hover:border-[#272877] dark:hover:border-[#6e6fe4] focus:border-[#272877] transition-colors"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined className="dark:text-gray-500" />)}
                            prefix={<LockOutlined className="text-gray-400 dark:text-gray-500 mr-2" />}
                        />
                    </Form.Item>
                    
                    {/* Confirm Password Field */}
                    <Form.Item
                        label={<span className="text-gray-700 dark:text-gray-300 font-medium transition-colors">Confirm Password</span>}
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                        className="!mb-6"
                    >
                        <Input.Password
                            placeholder="••••••••••••"
                            className="h-12 rounded-xl border-gray-200 dark:border-[#303030] dark:bg-[#1f1f1f] dark:text-white hover:border-[#272877] dark:hover:border-[#6e6fe4] focus:border-[#272877] transition-colors"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined className="dark:text-gray-500" />)}
                            prefix={<LockOutlined className="text-gray-400 dark:text-gray-500 mr-2" />}
                        />
                    </Form.Item>

                    {/* Signup Button */}
                    <Form.Item className="!mb-0">
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isLoading}
                            block
                            className="h-12 flex-1 rounded-xl !bg-[#272877] !border-none font-semibold text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                        >
                            Sign Up
                        </Button>
                    </Form.Item>

                    {/* Additional Options */}
                    <div className="mt-6 flex flex-col gap-4">
                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="font-semibold text-[#272877] dark:text-[#6e6fe4] hover:underline transition-colors">
                                Sign in here
                            </Link>
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    );
}
