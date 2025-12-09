import { useState } from 'react';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { parseJwt } from "../service/authService.jsx";
import NavBar from "./NavBar.jsx";
import styles from "../assets/css/login.module.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { EnvelopeClosedIcon, LockClosedIcon, FaceIcon } from "@radix-ui/react-icons"
import { useSpring, useTrail, animated } from '@react-spring/web';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showResetDialog, setShowResetDialog] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [resetCode, setResetCode] = useState('');
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigator = useNavigate();

    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    // React Spring animations
    const cardSpring = useSpring({
        from: { opacity: 0, transform: 'scale(0.8)' },
        to: { opacity: 1, transform: 'scale(1)' },
        config: { tension: 170, friction: 26 }
    });

    const logoSpring = useSpring({
        from: { opacity: 0, transform: 'rotate(360deg) scale(0)' },
        to: { opacity: 1, transform: 'rotate(0deg) scale(1)' },
        delay: 100,
        config: { tension: 170, friction: 26 }
    });

    const titleSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(-30px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        delay: 200,
        config: { tension: 300, friction: 50 }
    });

    const formTrail = useTrail(3, { // 2 form fields + 1 button
        from: { opacity: 0, transform: 'translateX(-50px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
        delay: 300,
        config: { tension: 300, friction: 50 }
    });



    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(baseUrl+'/api/auth/login', {
                email: email,
                password: password
            });

            if (response.status === 200) {
                const token = response.data.token;
                localStorage.setItem('token', token);
                const decodedToken = parseJwt(token);
                const role = decodedToken.role;

                toast.success("Login successful!", {
                    description: `Welcome back!`
                });

                if (role === "ADMIN" || role === "PATIENT" || role === "RADIOLOGIST") {
                    navigator('/Home');
                } else {
                    toast.error("Unknown role");
                }
            }
        } catch (error) {
            if (error.response) {
                if(error.response.data.message=="Wrong password"){
                    toast.error("Wrong password", {
                        description: "The password you entered is incorrect. Please try again."
                    });
                }
                else if(error.response.data.message=="The email is not registered"){
                    toast.error("Email not registered", {
                        description: "The email address you entered is not associated with an account."
                    });
                }
            } else if (error.request) {
                toast.error("Error", {
                    description: "No response received from server."
                });
            } else {
                toast.error("Authentication error", {
                    description: error.message
                });
            }
        }
    };

    const handlePasswordReset = async () => {
        try {
            const response = await axios.post(baseUrl+'/api/auth/forgot-password/send-verification-code', {
                email: resetEmail,
            });
            if (response.status === 200) {
                toast.success("Code sent", {
                    description: "The password reset code has been sent to your email."
                });
                setResetStep(2);
            }
        } catch (error) {
            toast.error("Error", {
                description: "Error sending password reset code."
            });
        }
    };

    const handleResetSubmit = async () => {
        try {
            const response = await axios.post(baseUrl+'/api/auth/forgot-password/ver-code', {
                email: resetEmail,
                code: resetCode,
                newPassword: newPassword,
            });
            if (response.status === 200) {
                toast.success("Success", {
                    description: "Password changed successfully"
                });
                setShowResetDialog(false);
                setResetStep(1);
                setResetEmail('');
                setResetCode('');
                setNewPassword('');
            }
        } catch (error) {
            toast.error("Error", {
                description: "Error resetting password"
            });
        }
    };

    const closeResetDialog = () => {
        setShowResetDialog(false);
        setResetStep(1);
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
    };

    return (
        <div className={styles["page"]}>
            <NavBar></NavBar>
            <div className={styles.card}>
                <animated.div style={cardSpring} className={styles["card-container"]}>
                    <animated.div style={logoSpring} className={styles["tooth-img"]}>
                        <FaceIcon className="h-20 w-20 text-cyan-600" />
                    </animated.div>
                    <animated.h1 style={titleSpring} className={styles.helloMsg}>WELCOME BACK</animated.h1>
                    <form className={styles.loginForm} onSubmit={handleSubmit}>
                        <animated.div style={formTrail[0]} className="form-group space-y-2">
                            <Label htmlFor="email" className="flex items-center gap-2">
                                <EnvelopeClosedIcon className="h-4 w-4 text-cyan-600" />
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </animated.div>
                        <animated.div style={formTrail[1]} className="form-group space-y-2">
                            <Label htmlFor="password" className="flex items-center gap-2">
                                <LockClosedIcon className="h-4 w-4 text-cyan-600" />
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </animated.div>
                        <animated.div style={formTrail[2]}>
                            <Button type="submit" className="w-full mt-4">
                                Sign In
                            </Button>
                        </animated.div>
                    </form>

                    <p className={styles["forgot-password-link"]} onClick={() => setShowResetDialog(true)}>
                        Forgot your password?
                    </p>

                    <h2 onClick={() => navigator("/Register")} className={styles["register-link"]}>
                        Don't have an account? <br />Create one
                    </h2>
                </animated.div>
            </div>

            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LockClosedIcon className="h-5 w-5 text-cyan-600" />
                            Reset Password
                        </DialogTitle>
                        <DialogDescription>
                            {resetStep === 1 ?
                                "Enter your email address to receive a reset code" :
                                "Enter the code you received and your new password"
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {resetStep === 1 && (
                            <div className="space-y-2">
                                <Label htmlFor="reset-email">Email Address</Label>
                                <Input
                                    id="reset-email"
                                    type="email"
                                    placeholder="email@example.com"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                />
                            </div>
                        )}
                        {resetStep === 2 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="reset-email-confirm">Email Address</Label>
                                    <Input
                                        id="reset-email-confirm"
                                        type="email"
                                        placeholder="email@example.com"
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="reset-code">Reset Code</Label>
                                    <Input
                                        id="reset-code"
                                        type="text"
                                        placeholder="Enter code"
                                        value={resetCode}
                                        onChange={(e) => setResetCode(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeResetDialog}>
                            Close
                        </Button>
                        {resetStep === 1 && (
                            <Button onClick={handlePasswordReset}>
                                Send Code
                            </Button>
                        )}
                        {resetStep === 2 && (
                            <Button onClick={handleResetSubmit}>
                                Reset Password
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Login;
