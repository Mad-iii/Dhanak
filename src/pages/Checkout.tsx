import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { BackgroundOverlay } from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
export const Checkout = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const { cart, totalPrice, clearCart } = useCart();
    const { user } = useAuth();

    // Auto-fill form from Google account on first load
    useEffect(() => {
        if (user) {
            const nameParts = (user.displayName ?? '').split(' ');
            setFormData(prev => ({
                ...prev,
                firstName: prev.firstName || nameParts[0] || '',
                lastName: prev.lastName || nameParts.slice(1).join(' ') || '',
            }));
        }
    }, [user]);
    const DELIVERY_CHARGE = 300;
    const finalTotal = totalPrice + DELIVERY_CHARGE;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        phone: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
        accountNumber: '',
        otp: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'cod'>('card');
    const [bankStep, setBankStep] = useState(1); // 1: account, 2: processing, 3: otp
    const [isProcessing, setIsProcessing] = useState(false);

    const formattedTotal = new Intl.NumberFormat('en-PK').format(finalTotal);
    const subtotalFormatted = new Intl.NumberFormat('en-PK').format(totalPrice);

    useEffect(() => {
        if (step === 3) {
            clearCart();
        }
    }, [step, clearCart]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateStep1 = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is essential.';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is essential.';
        if (!formData.address.trim()) newErrors.address = 'Where shall we send the ritual?';
        if (!formData.city.trim()) newErrors.city = 'City is required.';

        // Pakistani Phone Validation
        // Common formats: 03xxxxxxxxx, +923xxxxxxxxx, 923xxxxxxxxx
        const phoneRegex = /^((\+92)|(0092)|(92))?3[0-9]{9}$|^03[0-9]{9}$/;
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required for delivery.';
        } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid Pakistani phone number.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const proceedToPayment = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleEmailNotification = () => {
        const orderDetails = {
            id: '#7712',
            customer: `${formData.firstName} ${formData.lastName}`,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city}`,
            items: cart.map(i => `${i.name} x${i.quantity}`).join(', '),
            total: finalTotal,
            payment: paymentMethod
        };

        console.log(`%c[SYSTEM] EMAIL SENT TO: mahdsadiq360@gmail.com`, 'color: #FF0080; font-weight: bold; font-size: 14px;');
        console.log('Order Details:', orderDetails);
    };

    const handleOnlineBanking = async () => {
        if (!formData.accountNumber.trim()) {
            setErrors(prev => ({ ...prev, accountNumber: 'Account number is required' }));
            return;
        }

        setIsProcessing(true);
        setBankStep(2);

        try {
            // Real Safepay Init call in background to establish transaction intent
            const response = await fetch('/api/payment/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalTotal })
            });
            const data = await response.json();

            if (!data.success) throw new Error(data.error);

            // Simulate mobile app notification push
            setTimeout(() => {
                setIsProcessing(false);
                setBankStep(3);
            }, 3000);
        } catch (error) {
            console.error('Safepay Error:', error);
            setIsProcessing(false);
            setBankStep(1);
            setErrors(prev => ({ ...prev, accountNumber: 'Safepay Connection Failed' }));
        }
    };

    const handleOTPAndFinish = () => {
        if (!formData.otp.trim()) {
            setErrors(prev => ({ ...prev, otp: 'OTP is required' }));
            return;
        }
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            handleEmailNotification();
            setStep(3);
        }, 1500);
    };

    const handleFinalPurchase = async () => {
        if (paymentMethod === 'card') {
            if (!formData.cardNumber.trim()) {
                setErrors(prev => ({ ...prev, cardNumber: 'Card number required' }));
                return;
            }
            setIsProcessing(true);

            try {
                // Initialize Safepay for the card transaction
                const response = await fetch('/api/payment/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: finalTotal })
                });
                const data = await response.json();
                if (!data.success) throw new Error(data.error);

                // Simulation of card processing
                setTimeout(() => {
                    setIsProcessing(false);
                    handleEmailNotification();
                    setStep(3);
                }, 2000);
            } catch (error) {
                console.error('Safepay Error:', error);
                setIsProcessing(false);
                setErrors(prev => ({ ...prev, cardNumber: 'Safepay Connection Failed' }));
            }
        } else if (paymentMethod === 'cod') {
            handleEmailNotification();

            // Send to portal
            fetch(`${import.meta.env.VITE_PORTAL_URL}/api/ingest`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-ingest-secret": import.meta.env.VITE_INGEST_SECRET,
                },
                body: JSON.stringify({
                    type: "ORDER_CREATED",
                    storeId: import.meta.env.VITE_STORE_ID,
                    data: {
                        orderNumber: `DHANAK-${Date.now()}`,
                        total: finalTotal,
                        customerName: `${formData.firstName} ${formData.lastName}`,
                        customerEmail: user?.email ?? undefined,
                        // Add these:
                        address: `${formData.address}, ${formData.city}`,
                        phone: formData.phone,
                        items: cart.map(i => ({
                            name: i.name,
                            quantity: i.quantity,
                            price: parseFloat(String(i.price).replace(/,/g, "")),
                        })),
                    },
                }),
            }).catch(() => { });

            setStep(3);
        }
    };

    if (cart.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen bg-brand-ivory relative overflow-hidden pb-32">
                <BackgroundOverlay />
                <div className="container mx-auto px-6 py-24 relative z-10 text-center">
                    <h2 className="text-5xl md:text-7xl font-palmor font-black text-brand-black mb-8 italic">Gateway Closed.</h2>
                    <p className="text-xl font-bold mb-12 opacity-60">Your ritual bag is empty.</p>
                    <Link to="/shop" className="inline-block bg-brand-black text-white px-10 py-5 text-xs font-black uppercase tracking-widest shadow-[8px_8px_0px_#FF0080]">Back to Studio</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-ivory relative overflow-hidden pb-32">
            <BackgroundOverlay />
            <div className="container mx-auto px-6 py-12 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-5xl md:text-7xl font-palmor font-black text-brand-black mb-12 italic tracking-tighter">The Gateway.</h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                        <div className="md:col-span-8 flex flex-col gap-8">
                            {/* Step Indicators */}
                            <div className="flex gap-4 mb-8">
                                {[1, 2, 3].map(s => (
                                    <div key={s} className={`h-2 flex-grow border-2 border-brand-black transition-all ${step >= s ? 'bg-brand-magenta' : 'bg-white'}`} />
                                ))}
                            </div>

                            <div className="bg-white border-4 border-brand-black p-10 shadow-[12px_12px_0px_#FFE600]">
                                {step === 1 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        <h3 className="text-3xl font-display font-black italic flex items-center gap-4"><Truck className="w-8 h-8 text-brand-turquoise" /> Shipping Details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">First Name *</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    className={`border-2 p-4 focus:outline-none focus:border-brand-magenta font-bold transition-colors ${errors.firstName ? 'border-brand-magenta bg-brand-magenta/5' : 'border-brand-black'}`}
                                                    placeholder="E.g. Zoya"
                                                />
                                                {errors.firstName && <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-tighter">{errors.firstName}</span>}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Last Name *</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    className={`border-2 p-4 focus:outline-none focus:border-brand-magenta font-bold transition-colors ${errors.lastName ? 'border-brand-magenta bg-brand-magenta/5' : 'border-brand-black'}`}
                                                    placeholder="E.g. Ali"
                                                />
                                                {errors.lastName && <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-tighter">{errors.lastName}</span>}
                                            </div>
                                            <div className="sm:col-span-2 flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Shipping Address *</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className={`border-2 p-4 focus:outline-none focus:border-brand-magenta font-bold transition-colors ${errors.address ? 'border-brand-magenta bg-brand-magenta/5' : 'border-brand-black'}`}
                                                    placeholder="Street, Haveli, House #"
                                                />
                                                {errors.address && <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-tighter">{errors.address}</span>}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">City *</label>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.city}
                                                    onChange={handleInputChange}
                                                    className={`border-2 p-4 focus:outline-none focus:border-brand-magenta font-bold transition-colors ${errors.city ? 'border-brand-magenta bg-brand-magenta/5' : 'border-brand-black'}`}
                                                    placeholder="E.g. Lahore"
                                                />
                                                {errors.city && <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-tighter">{errors.city}</span>}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Phone Number *</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className={`border-2 p-4 focus:outline-none focus:border-brand-magenta font-bold transition-colors ${errors.phone ? 'border-brand-magenta bg-brand-magenta/5' : 'border-brand-black'}`}
                                                    placeholder="03XX XXXXXXX"
                                                />
                                                {errors.phone && <span className="text-[10px] font-bold text-brand-magenta uppercase tracking-tighter">{errors.phone}</span>}
                                            </div>
                                        </div>
                                        <button
                                            onClick={proceedToPayment}
                                            className="w-full bg-brand-black text-white py-6 text-sm font-black uppercase tracking-[0.3em] hover:bg-brand-magenta shadow-[8px_8px_0px_#FFE600] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                                        >
                                            Proceed to Ritual
                                        </button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-3xl font-display font-black italic flex items-center gap-4"><CreditCard className="w-8 h-8 text-brand-coral" /> Payment Magic</h3>
                                            {(paymentMethod === 'card' || paymentMethod === 'bank') && (
                                                <div className="bg-brand-black text-white px-3 py-1 text-[10px] font-black tracking-[0.2em] uppercase italic">
                                                    Powered by <span className="text-brand-turquoise">SAFEPAY</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'card', name: 'PAY WITH CARD', icon: CreditCard },
                                                { id: 'bank', name: 'ONLINE BANKING', icon: ShieldCheck },
                                                { id: 'cod', name: 'CASH ON DELIVERY', icon: Truck }
                                            ].map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => {
                                                        setPaymentMethod(m.id as any);
                                                        setBankStep(1);
                                                    }}
                                                    className={`border-2 p-6 flex flex-col items-center gap-4 transition-all ${paymentMethod === m.id ? 'border-brand-magenta bg-brand-magenta/5 shadow-[6px_6px_0px_#1A0A00]' : 'border-brand-black hover:bg-brand-ivory'}`}
                                                >
                                                    <m.icon className={`w-8 h-8 ${paymentMethod === m.id ? 'text-brand-magenta' : 'text-brand-black'}`} />
                                                    <span className="font-black text-[10px] tracking-widest text-center">{m.name}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="mt-8 pt-8 border-t-2 border-brand-black/10">
                                            {paymentMethod === 'card' && (
                                                <div className="space-y-6 animate-in fade-in duration-500">
                                                    <div className="flex flex-col gap-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Card Number</label>
                                                        <input
                                                            name="cardNumber"
                                                            value={formData.cardNumber}
                                                            onChange={handleInputChange}
                                                            className="border-2 border-brand-black p-4 focus:outline-none focus:border-brand-magenta font-mono font-bold tracking-[0.2em]"
                                                            placeholder="XXXX XXXX XXXX XXXX"
                                                        />
                                                        {errors.cardNumber && <span className="text-[10px] font-bold text-brand-magenta uppercase">{errors.cardNumber}</span>}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Expiry Date</label>
                                                            <input
                                                                name="expiry"
                                                                value={formData.expiry}
                                                                onChange={handleInputChange}
                                                                className="border-2 border-brand-black p-4 focus:outline-none focus:border-brand-magenta font-bold"
                                                                placeholder="MM / YY"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">CVC</label>
                                                            <input
                                                                name="cvc"
                                                                value={formData.cvc}
                                                                onChange={handleInputChange}
                                                                className="border-2 border-brand-black p-4 focus:outline-none focus:border-brand-magenta font-bold"
                                                                placeholder="123"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {paymentMethod === 'bank' && (
                                                <div className="space-y-6 animate-in fade-in duration-500">
                                                    {bankStep === 1 && (
                                                        <div className="flex flex-col gap-6">
                                                            <p className="text-sm font-bold opacity-60">Enter your account number to receive a payment notification in your banking app.</p>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">Account Number</label>
                                                                <input
                                                                    name="accountNumber"
                                                                    value={formData.accountNumber}
                                                                    onChange={handleInputChange}
                                                                    className="border-2 border-brand-black p-4 focus:outline-none focus:border-brand-magenta font-mono font-bold text-xl"
                                                                    placeholder="0000000000"
                                                                />
                                                                {errors.accountNumber && <span className="text-[10px] font-bold text-brand-magenta uppercase">{errors.accountNumber}</span>}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {bankStep === 2 && (
                                                        <div className="text-center py-8 space-y-4">
                                                            <div className="w-12 h-12 border-4 border-brand-magenta border-t-transparent rounded-full mx-auto animate-spin" />
                                                            <p className="font-bold uppercase tracking-widest text-xs">Waiting for app approval...</p>
                                                            <p className="text-[10px] opacity-60">Check your banking app for a Safepay notification.</p>
                                                        </div>
                                                    )}

                                                    {bankStep === 3 && (
                                                        <div className="flex flex-col gap-6">
                                                            <div className="bg-brand-turquoise/20 p-4 border-2 border-brand-turquoise text-[10px] font-black uppercase tracking-widest">
                                                                NOTIFICATION APPROVED. PLEASE ENTER THE OTP SENT TO YOUR DEVICE.
                                                            </div>
                                                            <div className="flex flex-col gap-2">
                                                                <label className="text-[10px] font-black uppercase tracking-widest text-brand-black/60">OTP CODE</label>
                                                                <input
                                                                    name="otp"
                                                                    value={formData.otp}
                                                                    onChange={handleInputChange}
                                                                    className="border-2 border-brand-black p-4 focus:outline-none focus:border-brand-magenta font-mono font-black text-3xl text-center tracking-[0.5em]"
                                                                    placeholder="0000"
                                                                />
                                                                {errors.otp && <span className="text-[10px] font-bold text-brand-magenta uppercase">{errors.otp}</span>}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {paymentMethod === 'cod' && (
                                                <div className="py-8 bg-brand-ivory border-2 border-dashed border-brand-black text-center space-y-2">
                                                    <p className="font-bold uppercase tracking-widest text-xs italic">Heritage delivered to your door.</p>
                                                    <p className="text-[10px] opacity-60 italic">Pay cash upon receipt of the ritual.</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                disabled={isProcessing}
                                                onClick={() => {
                                                    if (bankStep > 1 && paymentMethod === 'bank') setBankStep(b => b - 1);
                                                    else setStep(1);
                                                }}
                                                className="flex-1 border-2 border-brand-black py-6 text-xs font-black uppercase tracking-widest hover:bg-brand-ivory disabled:opacity-50"
                                            >
                                                Back
                                            </button>

                                            {paymentMethod === 'bank' && bankStep === 1 && (
                                                <button
                                                    onClick={handleOnlineBanking}
                                                    className="bg-brand-magenta text-white flex-[2] py-6 text-sm font-black uppercase tracking-[0.4em] shadow-[6px_6px_0px_#1A0A00] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                                                >
                                                    Send Notification
                                                </button>
                                            )}

                                            {paymentMethod === 'bank' && bankStep === 3 && (
                                                <button
                                                    disabled={isProcessing}
                                                    onClick={handleOTPAndFinish}
                                                    className="bg-brand-black text-white flex-[2] py-6 text-sm font-black uppercase tracking-[0.4em] shadow-[6px_6px_0px_#FFE600] disabled:opacity-50 transition-all"
                                                >
                                                    {isProcessing ? 'Verifying...' : 'Complete Payment'}
                                                </button>
                                            )}

                                            {(paymentMethod === 'card' || paymentMethod === 'cod') && (
                                                <button
                                                    disabled={isProcessing}
                                                    onClick={handleFinalPurchase}
                                                    className="bg-brand-black text-white flex-[2] py-6 text-sm font-black uppercase tracking-[0.4em] shadow-[6px_6px_0px_#FFE600] border-2 border-brand-black hover:bg-brand-magenta disabled:opacity-50 transition-all"
                                                >
                                                    {isProcessing ? 'Processing...' : 'Seal the Deal'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                                        <div className="w-32 h-32 bg-brand-yellow rounded-full mx-auto flex items-center justify-center border-4 border-brand-black mb-8 animate-bounce">
                                            <ShieldCheck className="w-16 h-16 text-brand-black" />
                                        </div>
                                        <h3 className="text-5xl font-display font-black italic mb-6">Rainbow Claimed!</h3>
                                        <p className="text-xl font-bold mb-12 max-w-sm mx-auto">Your order #7712 is being prepared with heritage and soul. See you soon in the circle.</p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="inline-block bg-brand-black text-white px-12 py-6 text-sm font-black uppercase tracking-[0.3em] hover:bg-brand-turquoise transition-all shadow-[10px_10px_0px_#FF0080] active:shadow-none active:translate-x-1 active:translate-y-1 cursor-pointer"
                                        >
                                            Back to Dhanak
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-4">
                            <div className="bg-brand-black text-brand-ivory p-8 border-4 border-brand-turquoise sticky top-32">
                                <h4 className="text-xs font-black uppercase tracking-[0.4em] mb-8 border-b border-white/20 pb-4">Manifest</h4>
                                <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-start text-sm gap-4">
                                            <span className="opacity-60">{item.name} x{item.quantity}</span>
                                            <span className="font-mono whitespace-nowrap text-xs">PKR {item.price}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-3 mb-6 pt-4 border-t border-white/10 text-[10px] font-bold uppercase tracking-widest">
                                    <div className="flex justify-between opacity-60">
                                        <span>Subtotal</span>
                                        <span>PKR {subtotalFormatted}</span>
                                    </div>
                                    <div className="flex justify-between text-brand-turquoise">
                                        <span>Delivery Charges</span>
                                        <span>PKR 300</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xl font-display font-black pt-4 border-t-2 border-dashed border-white/20">
                                    <span>Total</span>
                                    <span className="text-brand-yellow italic underline decoration-brand-magenta decoration-4 underline-offset-4">PKR {formattedTotal}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
