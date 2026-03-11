// app/tickets/page.tsx

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, ArrowRight, Ticket } from 'lucide-react';
import { useState } from 'react';

export default function TicketRegistrationPage() {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const prices = {
    earlyBird: 299,
    normal: 399,
  };

  // Early bird end date
  const EARLY_BIRD_END = new Date('2026-03-30T23:59:59');

  const getPassType = () => {
    const now = new Date();
    return now <= EARLY_BIRD_END ? 'early_bird' : 'normal';
  };

  const passType = getPassType();

  const subtotal =
    passType === 'early_bird'
      ? prices.earlyBird * quantity
      : prices.normal * quantity;

  const serviceFee = 7;
  const total = subtotal + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const payload = {
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      address: formData.get('address') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      qty: quantity,
      product_type: passType,
    };

    try {
      const res = await fetch(
        'http://127.0.0.1:8000/billing/initiate-payment',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const error = await res.json();
        alert(error.detail?.[0]?.msg || 'Something went wrong');
        return;
      }

      const data = await res.json();

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

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-b from-black via-zinc-950 to-black text-white flex items-center justify-center px-4 py-12 md:py-16">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 lg:gap-12">

        {/* Left Section */}
        <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              G15 Festival 2026
            </h1>
            <p className="mt-3 text-zinc-400 text-lg">
              Experience the ultimate vibe
            </p>
          </div>

          <div className="relative w-full max-w-md aspect-[4/5] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-purple-900/20">
            <Image
              src="/g15-festival.png"
              alt="G15 Festival Poster"
              fill
              className="object-cover transition-transform duration-700 hover:scale-105"
              priority
            />
          </div>

          <div className="mt-6 text-zinc-400 text-sm space-y-1">
            <p>
              Early Bird ends:{' '}
              <span className="text-purple-400">30 March 2026</span>
            </p>
            <p>Limited passes available — grab yours now!</p>
          </div>
        </div>

        {/* Right Section */}
        <Card className="bg-zinc-950/70 border-zinc-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Ticket className="h-6 w-6 text-purple-500" />
              Get Your Pass
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Secure your spot at G15 Festival
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">

              {/* Pass Type Display */}
              <div className="space-y-2">
                <Label className="text-base">Pass Type</Label>

                <div className="rounded-md border-2 border-purple-600 bg-purple-950/30 p-4 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {passType === 'early_bird'
                        ? 'Early Bird Pass'
                        : 'Normal Pass'}
                    </p>

                    {passType === 'early_bird' && (
                      <p className="text-xs text-purple-400">
                        Early bird discount valid until 30 March 2026
                      </p>
                    )}
                  </div>

                  <span className="text-xl font-bold">
                    ₹
                    {passType === 'early_bird'
                      ? prices.earlyBird
                      : prices.normal}
                  </span>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Number of Passes</Label>
                <Select
                  value={quantity.toString()}
                  onValueChange={(v) => setQuantity(Number(v))}
                >
                  <SelectTrigger id="quantity">
                    <SelectValue placeholder="Select quantity" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Pass' : 'Passes'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    required
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    required
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>

              {/* Price Summary */}
              <div className="bg-zinc-900/70 p-4 rounded-lg border border-zinc-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>
                    Subtotal ({quantity} × ₹
                    {passType === 'early_bird'
                      ? prices.earlyBird
                      : prices.normal}
                    )
                  </span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Service Fee</span>
                  <span>₹{serviceFee}</span>
                </div>

                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="text-purple-400">₹{total}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-12 text-lg gap-2"
                disabled={loading}
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
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}