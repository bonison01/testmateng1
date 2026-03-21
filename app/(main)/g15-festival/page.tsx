'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowRight, Tickets, Plus, Minus, CheckCircle2, XCircle } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = "https://api.justmateng.info";
// const API_BASE_URL = "http://127.0.0.1:8000";

// --------------- Validation helpers ---------------
const isValidPhone = (val: string) => /^\d{10}$/.test(val);
const isValidEmail = (val: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

// --------------- Animated field wrapper ---------------
const FieldWrapper = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

// --------------- Validation icon ---------------
const ValidationIcon = ({ valid, show }: { valid: boolean; show: boolean }) => (
  <AnimatePresence>
    {show && (
      <motion.span
        key={valid ? 'ok' : 'err'}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.2 }}
        className="absolute right-3 top-1/2 -translate-y-1/2"
      >
        {valid ? (
          <CheckCircle2 className="h-4 w-4 text-green-400" />
        ) : (
          <XCircle className="h-4 w-4 text-red-400" />
        )}
      </motion.span>
    )}
  </AnimatePresence>
);

export default function TicketRegistrationPage() {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);
  const phoneValid = isValidPhone(phone);

  const [email, setEmail] = useState('');
  const [emailValidated, setEmailValidated] = useState<boolean | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmailChange = useCallback((val: string) => {
    setEmail(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setEmailValidated(val.length > 0 ? isValidEmail(val) : null);
    }, 500);
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const prices = { earlyBird: 299, normal: 399 };
  const SERVICE_FEE_PER_TICKET = 7;

  const EARLY_BIRD_END = new Date('2026-03-30T23:59:59');
  const passType = new Date() <= EARLY_BIRD_END ? 'early_bird' : 'normal';
  const unitPrice = passType === 'normal' ? prices.normal : prices.normal;

  const subtotal = unitPrice * quantity;
  const serviceFee = SERVICE_FEE_PER_TICKET * quantity;
  const total = subtotal + serviceFee;

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, Math.min(10, prev + delta)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || emailValidated !== true) return;
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const payload = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      address: formData.get('address') as string,
      email,
      phone,
      qty: quantity,
      product_type: passType,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/billing/initiate-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail?.[0]?.msg || 'Something went wrong');
        return;
      }

      const data = await res.json();

      // -------- SAVE merchant_order_id COOKIE --------
      if (data.merchant_order_id) {
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 180);

        document.cookie = `merchant_order_id=${data.merchant_order_id}; path=/; expires=${expiry.toUTCString()}; SameSite=Lax`;
      }

      // Redirect to PhonePe
      if (data.payment_url) {
        window.location.href = data.payment_url;
      }

    } catch (err) {
      console.error(err);
      alert('Payment initiation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const d = (n: number) => n * 0.07;

  return (
    <div className="min-h-[calc(100vh-5rem)] text-white flex items-center justify-center px-4 py-6 md:py-10">
      <div className="w-full max-w-7xl grid md:grid-cols-2 gap-8 items-start lg:gap-16">

        {/* LEFT SECTION */}
        <motion.div
          className="flex flex-col justify-center items-center md:items-start text-center md:text-left"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold tracking-tight bg-gradient-to-r from-[#50C273] to-[#E2DE59] bg-clip-text text-transparent">
              G15 Festival 2026
            </h1>
            <p className="mt-2 text-zinc-300 text-sm md:text-base xl:text-lg">Experience the ultimate vibe</p>
          </div>

          <div className="relative w-full max-w-lg aspect-5/7 rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-stone-900/20">
            <Image
              src="/g15-festival.png"
              alt="G15 Festival Poster"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
          </div>
{/* 
          <div className="mt-6 text-zinc-200 text-sm space-y-1">
            <p>
              Early Bird ends: <span className="text-green-300">20 March 2026</span>
            </p>
            <p>Limited passes available — grab yours now!</p>
          </div> */}
        </motion.div>

        {/* RIGHT SECTION */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-[#4D3799]/70 border-zinc-800 backdrop-blur-sm bg-gradient-to-br from-primary/15 to-secondary/15">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Tickets className="h-6 w-6" />
                Get Your Pass
              </CardTitle>
              <CardDescription className="text-zinc-400">
                Secure your spot at G15 Festival
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">

                {/* PASS TYPE */}
                <FieldWrapper delay={d(0)}>
                  <div className="space-y-2">
                    <Label className="text-base">Pass Type</Label>
                    <div className="rounded-xl border-2 border-stone-600 bg-stone-600/30 p-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">
                          {passType === 'early_bird'
                            ? 'Normal Pass'
                            : 'Normal Pass'}
                        </p>
                        {/* {passType === 'early_bird' && (
                          <p className="text-xs text-stone-400">
                            Early bird discount valid until 20 March 2026
                          </p>
                        )} */}
                      </div>
                      <span className="text-xl font-bold">₹{unitPrice}</span>
                    </div>
                  </div>
                </FieldWrapper>

               {/* Name */}
                <FieldWrapper delay={d(1)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input id="first_name" name="first_name" required className="bg-zinc-900 border-zinc-700" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input id="last_name" name="last_name" required className="bg-zinc-900 border-zinc-700" />
                    </div>
                  </div>
                </FieldWrapper>

                {/* Email */}
                <FieldWrapper delay={d(2)}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`bg-zinc-900 border-zinc-700 pr-10 transition-colors duration-300 ${
                          emailValidated === false
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : emailValidated === true
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : ''
                        }`}
                      />
                      <ValidationIcon valid={emailValidated === true} show={emailValidated !== null} />
                    </div>
                    <AnimatePresence>
                      {emailValidated === false && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-400 overflow-hidden"
                        >
                          Please enter a valid email address.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </FieldWrapper>

                {/* Phone */}
                <FieldWrapper delay={d(3)}>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        inputMode="numeric"
                        value={phone}
                        maxLength={10}
                        onChange={(e) => {
                          // Only allow digits, max 10
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(digits);
                          setPhoneTouched(true);
                        }}
                        className={`bg-zinc-900 border-zinc-700 pr-10 transition-colors duration-300 ${
                          phoneTouched && !phoneValid
                            ? 'border-red-500 focus-visible:ring-red-500'
                            : phoneTouched && phoneValid
                            ? 'border-green-500 focus-visible:ring-green-500'
                            : ''
                        }`}
                      />
                      <ValidationIcon valid={phoneValid} show={phoneTouched} />
                    </div>
                    <AnimatePresence>
                      {phoneTouched && !phoneValid && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-red-400 overflow-hidden"
                        >
                          Phone must be exactly 10 digits.
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </FieldWrapper>

                {/* Address — Textarea */}
                <FieldWrapper delay={d(4)}>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      required
                      rows={3}
                      className="bg-zinc-900 border-zinc-700 resize-none"
                      placeholder="Enter your full address"
                    />
                  </div>
                </FieldWrapper>

                {/* Quantity — +/- input */}
                <FieldWrapper delay={d(5)}>
                  <div className="space-y-2">
                    <Label>Number of Passes</Label>
                    <div className="flex items-center gap-3">
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="h-10 w-10 rounded-lg border border-zinc-600 bg-zinc-800 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </motion.button>

                      <motion.div
                        key={quantity}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2, ease: 'backOut' }}
                        className="w-14 text-center text-xl font-bold tabular-nums"
                      >
                        {quantity}
                      </motion.div>

                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.88 }}
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= 10}
                        className="h-10 w-10 rounded-lg border border-zinc-600 bg-zinc-800 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.button>

                      <span className="text-zinc-400 text-sm ml-1">
                        {quantity === 1 ? 'Pass' : 'Passes'} (max 10)
                      </span>
                    </div>
                  </div>
                </FieldWrapper>

                {/* Price Summary */}
                <FieldWrapper delay={d(6)}>
                  <motion.div
                    layout
                    className="bg-zinc-900/70 p-4 rounded-lg border border-zinc-800 space-y-2 text-sm"
                  >
                    <div className="flex justify-between">
                      <span>
                        Subtotal ({quantity} × ₹{unitPrice})
                      </span>
                      <motion.span
                        key={subtotal}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        ₹{subtotal}
                      </motion.span>
                    </div>

                    <div className="flex justify-between text-zinc-400">
                      <span>Service Fee ({quantity} × ₹{SERVICE_FEE_PER_TICKET})</span>
                      <motion.span
                        key={serviceFee}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, delay: 0.05 }}
                      >
                        ₹{serviceFee}
                      </motion.span>
                    </div>

                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-zinc-800">
                      <span>Total</span>
                      <motion.span
                        key={total}
                        initial={{ scale: 1.15, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, ease: 'backOut' }}
                        className="text-stone-400"
                      >
                        ₹{total}
                      </motion.span>
                    </div>
                  </motion.div>
                </FieldWrapper>

              </CardContent>

              <CardFooter>
                <motion.div className="w-full mt-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-tr from-green-600 to-green-800 hover:from-green-800 hover:to-green-600 text-white h-12 text-lg gap-2"
                    disabled={loading || !phoneValid || emailValidated !== true}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}