"use client";

import React, { useState, useRef } from "react";
import { ArrowRight, LogOut, BadgeCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/cart/store";
import Image from "next/image";
import { Separator } from "../ui/separator";
import "./navbar.css";
import { clearCart } from "@/lib/cart/cartSlice";
import { clearUser } from "@/lib/cart/userSlice";
import { CardDescription } from "../ui/card";

function Navbar() {
    const [isNavOpen, setNavOpen] = useState<boolean>(false);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const user = useSelector((state: RootState) => state.user.user);

    const toggleNav = () => setNavOpen((prev) => !prev);
    const closedNav = () => setNavOpen(false);

    const handleLogout = () => {
        localStorage.clear();
        dispatch(clearCart());
        dispatch(clearUser());
        setNavOpen(false);
        router.push("/login");
    };

    const links = [
        { name: "Home", href: "/home" },
        { name: "Discover", href: "/discovery" },
        {
            name: "Delivery Service",
            children: [
                { name: "Instant Deliveries", href: "/delivery-rates" },
                { name: "Cargo Booking", href: "/CargoBookingPage" },
                { name: "Track Booking", href: "/track" },
            ],
        },
        
    ];

    const UserGreeting = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative min-w-30 h-9 p-0 pr-4 border border-gray-400/50 rounded-full text-white/70 shadow-inner bg-[radial-gradient(ellipse_at_bottom,_rgba(71,81,92,1)_0%,_rgba(11,21,30,1)_45%)] hover:scale-105 hover:text-white flex items-center gap-1">
                    <Image
                        src={user?.profile_pic || "/user.png"}
                        alt="user"
                        width={100}
                        height={100}
                        className="w-9 h-9 rounded-full object-cover"
                    />
                    Hi, {user?.name?.split(" ")[0] || "User"}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="bg-[#1a1a1a] text-white border border-gray-500/30 shadow-lg rounded-lg p-2 min-w-[150px] z-[99999]"
            >
                <DropdownMenuItem
                    className="hover:text-white cursor-pointer px-3 py-2"
                    onClick={() => {
                        router.push("/profile");
                        closedNav();
                    }}
                >
                    <BadgeCheck /> Account Details
                </DropdownMenuItem>

                <Separator className="bg-gray-500/40" />

                <DropdownMenuItem
                    className="hover:text-white cursor-pointer px-3 py-2"
                    onClick={handleLogout}
                >
                    <LogOut /> Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const LoginDropdown = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="cartBtn rounded-full p-0.5">
                    <span className="rounded-full py-2 px-6 flex items-center">
                        Login
                        <ArrowRight size={18} className="text-white ml-1" />
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="bg-[#1a1a1a] text-white border border-gray-500/30 shadow-lg rounded-lg p-2 min-w-[180px] z-[99999]"
            >
                <DropdownMenuItem
                    className="hover:text-white cursor-pointer px-3 py-2"
                    onClick={() => {
                        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                        closedNav();
                    }}
                >
                    👤 User Login
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="hover:text-white cursor-pointer px-3 py-2"
                    onClick={() => {
                        window.open("https://www.matengmarket.com", "_blank");
                        closedNav();
                    }}
                >
                    🏢 Business Login
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="w-full fixed top-0 z-[10000] sm:px-4 bg-gradient-to-r from-[#131316d9] via-[#222226a6] to-[#131316d9] backdrop-blur-sm">

            {/* ------------------ DESKTOP NAV ------------------ */}
            <div className="navbar hidden lg:flex justify-between items-center h-16">

                <Link href={`/home`}>
                    <div className="h-16 flex items-center p-2 pl-0">
                        <img src="../logo.png" alt="logo" className="h-full object-contain" />
                    </div>
                </Link>

                <div className="menu-bar flex gap-4 items-center">
                    {links.map((link) =>
                        link.children ? (
                            <DropdownMenu key={link.name}>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className={`px-3 py-1.5 rounded-full hover:bg-[#09090b20] ${
                                            pathname.includes("delivery-rates") ||
                                            pathname.includes("CargoBookingPage")
                                                ? "bg-[#09090b20]"
                                                : ""
                                        }`}
                                    >
                                        {link.name}
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent className="bg-[#1a1a1a] text-white rounded-md shadow-md min-w-[160px] border border-gray-600/30 z-[99999]">
                                    {link.children.map((child) => (
                                        <DropdownMenuItem
                                            key={child.href}
                                            className="hover:bg-white/10 cursor-pointer"
                                            onClick={() => router.push(child.href)}
                                        >
                                            {child.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-1.5 rounded-full hover:bg-[#09090b20] ${
                                    pathname === link.href ? "bg-[#09090b20]" : ""
                                }`}
                            >
                                {link.name}
                            </Link>
                        )
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {user ? <UserGreeting /> : <LoginDropdown />}
                </div>
            </div>

            {/* ------------------ MOBILE NAV ------------------ */}
            <div className="small-navbar lg:hidden h-16 flex justify-between items-center px-3">
                <Link href="/home">
                    <img src="../logo.png" alt="logo" className="w-32" />
                </Link>

                <label className="hamburger pr-2">
                    <input
                        type="checkbox"
                        className="hamburger-checkbox"
                        checked={isNavOpen}
                        onChange={toggleNav}
                    />
                    <svg viewBox="0 0 32 32">
                        <path className="line line-top-bottom" d="M27 10 13 10..." />
                        <path className="line" d="M7 16 27 16" />
                    </svg>
                </label>
            </div>

            {/* MOBILE NAV MENU */}
            <nav className={`nav-menu ${isNavOpen ? "open" : "closed"}`}>
                <div className="flex flex-col items-center mt-6">

                    {links.map((link) =>
                        link.children ? (
                            <DropdownMenu key={link.name}>
                                <DropdownMenuTrigger asChild>
                                    <button className="navlink mt-2 text-lg font-medium">
                                        {link.name}
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    className="bg-[#1a1a1a] text-white rounded-md border border-white/10 min-w-[180px] z-[99999] fixed left-1/2 -translate-x-1/2"
                                >
                                    {link.children.map((child) => (
                                        <DropdownMenuItem
                                            key={child.href}
                                            className="hover:bg-white/10 cursor-pointer"
                                            onClick={() => {
                                                router.push(child.href);
                                                closedNav();
                                            }}
                                        >
                                            {child.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="navlink mt-3"
                                onClick={closedNav}
                            >
                                {link.name}
                            </Link>
                        )
                    )}

                    <div className="mt-6">{user ? <UserGreeting /> : <LoginDropdown />}</div>
                </div>

                {/* Mobile CTA */}
                <div className="mt-10 p-4 text-center">
                    <CardDescription className="text-sm mb-3">
                        Visit our cargo service page to get started.
                    </CardDescription>

                    <a href="tel:+919774795905">
                        <button className="flex px-6 py-3 mx-auto text-white bg-green-900/60 rounded-full shadow-md">
                            Cargo Service Inquiries
                        </button>
                    </a>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
