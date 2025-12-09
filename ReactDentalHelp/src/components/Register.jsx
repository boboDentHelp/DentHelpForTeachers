import { useNavigate } from 'react-router-dom';
import styles from'../assets/css/register.module.css';
import manImage from '../assets/register_photo/man.png';
import womenImage from '../assets/register_photo/women.png';
import {useState} from "react";
import axios from "axios";
import NavBar from "./NavBar.jsx";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { PersonIcon, EnvelopeClosedIcon, LockClosedIcon, IdCardIcon, CheckCircledIcon } from "@radix-ui/react-icons"
import confetti from 'canvas-confetti'
import errorLogger from '../utils/errorLogger.js'
import { useSpring, useTrail, animated } from '@react-spring/web';

function Register() {

    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setSecondName] = useState("");
    const [cnp, setCnp] = useState("");
    const [password, setPassword] = useState("");
    const [reTypePassword, setRePassword] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [code, setCode] = useState('');
    const navigator = useNavigate();
    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    // React Spring Animations
    const leftImageSpring = useSpring({
        from: { opacity: 0, transform: 'translateX(-100px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
        config: { tension: 300, friction: 50 }
    });

    const rightImageSpring = useSpring({
        from: { opacity: 0, transform: 'translateX(100px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
        config: { tension: 300, friction: 50 }
    });

    const cardSpring = useSpring({
        from: { opacity: 0, transform: 'scale(0.9)' },
        to: { opacity: 1, transform: 'scale(1)' },
        delay: 100,
        config: { tension: 280, friction: 60 }
    });

    const titleSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(-30px)' },
        to: { opacity: 1, transform: 'translateY(0px)' },
        delay: 200,
        config: { tension: 300, friction: 50 }
    });

    const formFields = [
        { id: 'firstName', label: 'First Name', type: 'text', icon: PersonIcon, value: firstName, setter: setFirstName, placeholder: 'First name' },
        { id: 'lastName', label: 'Last Name', type: 'text', icon: PersonIcon, value: lastName, setter: setSecondName, placeholder: 'Last name' },
        { id: 'cnp', label: 'CNP (Personal ID)', type: 'text', icon: IdCardIcon, value: cnp, setter: setCnp, placeholder: 'CNP' },
        { id: 'email', label: 'Email', type: 'email', icon: EnvelopeClosedIcon, value: email, setter: setEmail, placeholder: 'Email address' },
        { id: 'password', label: 'Password', type: 'password', icon: LockClosedIcon, value: password, setter: setPassword, placeholder: 'Password' },
        { id: 'rePassword', label: 'Confirm Password', type: 'password', icon: LockClosedIcon, value: reTypePassword, setter: setRePassword, placeholder: 'Confirm password' }
    ];

    const formTrail = useTrail(formFields.length + 1, { // +1 for submit button
        from: { opacity: 0, transform: 'translateX(-30px)' },
        to: { opacity: 1, transform: 'translateX(0px)' },
        delay: 300,
        config: { tension: 300, friction: 50 }
    });


    const handleRegisterSubmit = async (e) => {
        e.preventDefault();

        const patternForLetters = /.*[a-zA-Z].*/;
        const patternForDigit = /.*\d+.*/;
        const regexForEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Validate email address
        if (!regexForEmail.test(email)) {
            toast.error("Invalid email", {
                description: "The email address is invalid"
            });
            return;
        }

        // Validate password length
        if (password.length < 8) {
            toast.error("Invalid password", {
                description: "Password must be at least 8 characters long"
            });
            return;
        }

        // Validate password contains at least one digit
        if (!patternForDigit.test(password)) {
            toast.error("Invalid password", {
                description: "Password must contain at least one digit"
            });
            return;
        }

        // Validate password contains at least one letter
        if (!patternForLetters.test(password)) {
            toast.error("Invalid password", {
                description: "Password must contain at least one letter"
            });
            return;
        }

        // Validate passwords match
        if (password !== reTypePassword) {
            toast.error("Passwords don't match", {
                description: "The two passwords you entered are not identical"
            });
            return;
        }

        // Trimiterea cererii la server
        try {
            const response = await axios.post(baseUrl+'/api/auth/register', {
                email: email,
                firstName: firstName,
                lastName: lastName,
                cnp: cnp,
                password: password,
                reTypePassword: reTypePassword
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Registration response:', response);

            if (response.status === 200 || response.status === 201) {
                toast.success("Code sent", {
                    description: "Check your email for the verification code"
                });
                setIsDialogOpen(true);
            }
        } catch (error) {
            console.error('Full error object:', error);
            console.error('Error response:', error.response);
            console.error('Error status:', error.response?.status);
            console.error('Error data:', error.response?.data);

            // Log error for debugging
            errorLogger.logError('Register', 'handleRegisterSubmit', error, {
                email: email,
                endpoint: '/api/auth/register',
                status: error.response?.status,
                statusText: error.response?.statusText,
                errorData: error.response?.data
            });

            if(error.response) {
                const errorMessage = error.response.data?.message || error.response.data?.error;

                // Special handling for 503 Service Unavailable
                if (error.response.status === 503) {
                    toast.error("Service Unavailable", {
                        description: 'AUTH-SERVICE is currently unavailable. Please contact the administrator or try again later.',
                        duration: 6000
                    });
                    return;
                }

                // Special handling for 405 when email was actually sent
                if (error.response.status === 405 && error.message.includes('Method Not Allowed')) {
                    toast.warning("Request processed", {
                        description: 'If you received an email with a verification code, please enter it below.',
                        duration: 5000
                    });
                    // Open dialog anyway since email might have been sent
                    setIsDialogOpen(true);
                    return;
                }

                if(errorMessage === "Email already exists in db") {
                    toast.error("Error", {
                        description: 'An account with this email address already exists!'
                    });
                }
                else if(errorMessage === "CNP already exists in db") {
                    toast.error("Error", {
                        description: 'An account with this CNP already exists!'
                    });
                }
                else if(errorMessage === "The CNP is invalid") {
                    toast.error("Error", {
                        description: 'The CNP is invalid. Make sure you entered the data correctly'
                    });
                }
                else {
                    toast.error("Error", {
                        description: 'Registration error: ' + (errorMessage || 'Unknown error')
                    });
                }
            }
            else {
                toast.error("Error", {
                    description: 'Registration error: ' + error.message
                });
            }
        }
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
    };

    // Confetti animation function
    const celebrateSuccess = () => {
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Create confetti from two sides
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
    };

    const handleDialogSubmit = async () => {
        try {
            const response = await axios.post(baseUrl+'/api/auth/register/verification', {
                email: email,
                code: code
            });

            if (response.status === 200) {
                // Trigger confetti animation
                celebrateSuccess();

                toast.success("🎉 Account created successfully!", {
                    description: "Welcome! You can now sign in with your account",
                    duration: 4000,
                });
                setIsDialogOpen(false);
                setTimeout(() => navigator('/Login'), 2000);
            }
        } catch (error) {
            console.error('Server error:', error.response ? error.response.data : error.message);

            // Log error for debugging
            errorLogger.logError('Register', 'handleDialogSubmit', error, {
                endpoint: '/api/auth/register/verification',
                status: error.response?.status,
                errorData: error.response?.data
            });

            toast.error("Verification error", {
                description: error.response ? error.response.data.message : error.message
            });
        }
    };

    return (
        <div className={styles["page"]}>
            <NavBar></NavBar>
            <div className={styles["content"]}>
                <animated.img style={leftImageSpring} src={manImage} className={styles["left-image-reg"]} alt="Man" />
                <animated.div style={cardSpring} className={styles["card-content"]}>
                    <animated.h1 style={titleSpring} className={styles["helloMsg"]}>WELCOME</animated.h1>
                    <form onSubmit={handleRegisterSubmit}>
                        {formTrail.slice(0, formFields.length).map((style, index) => {
                            const field = formFields[index];
                            const IconComponent = field.icon;
                            return (
                                <animated.div key={field.id} style={style} className={`${styles["form-group"]} mb-3`}>
                                    <Label htmlFor={field.id} className="flex items-center gap-2 mb-2">
                                        <IconComponent className="h-4 w-4 text-cyan-600" />
                                        {field.label}
                                    </Label>
                                    <Input
                                        id={field.id}
                                        type={field.type}
                                        placeholder={field.placeholder}
                                        required
                                        value={field.value}
                                        onChange={(e) => field.setter(e.target.value)}
                                    />
                                </animated.div>
                            );
                        })}
                        <animated.div style={formTrail[formFields.length]}>
                            <Button type="submit" className="w-full mt-4">
                                Create Account
                            </Button>
                        </animated.div>
                    </form>
                </animated.div>
                <animated.img style={rightImageSpring} src={womenImage} className={styles["right-image-reg"]} alt="Woman" />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircledIcon className="h-5 w-5 text-cyan-600" />
                            Enter Verification Code
                        </DialogTitle>
                        <DialogDescription>
                            Check your email and enter the verification code you received
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification code</Label>
                            <Input
                                id="code"
                                type="text"
                                placeholder="Enter code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleDialogClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleDialogSubmit}>
                            Verify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Register;
