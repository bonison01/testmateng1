"use client";

import React, { useState, useRef } from "react";
import { ArrowRight, LogOut, BadgeCheck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
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
    const navMenuRef = useRef<HTMLDivElement | null>(null);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useDispatch();
    const cartItems = useSelector((state: RootState) => state.cart.items);
    const user = useSelector((state: RootState) => state.user.user);

    const toggleNav = () => {
        setNavOpen((prev) => !prev);
    };

    const closedNav = () => {
        setNavOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("customer_id");
        localStorage.removeItem("token");
        localStorage.removeItem("order_id");
        localStorage.removeItem("cart");

        dispatch(clearCart());
        dispatch(clearUser());

        setNavOpen(false);
        router.push("/login");
    };

    const links = [
        { name: "Home", href: "/home" },
        { name: "Discover", href: "/discovery" },
        { name: "Delivery Rates", href: "/delivery-rates" },
        { name: "Cargo Booking", href: "/CargoBookingPage" },
        { name: "Track Booking", href: "/track" },
    ];

    const UserGreeting = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative min-w-30 h-9 p-0 pr-4 border border-gray-400/50 rounded-full cursor-pointer text-white/70 shadow-inner bg-[radial-gradient(ellipse_at_bottom,_rgba(71,81,92,1)_0%,_rgba(11,21,30,1)_45%)] transition-all duration-1000 ease-[cubic-bezier(0.15,0.83,0.66,1)] hover:scale-105 hover:text-white group flex flex-row items-center gap-1">
                    <Image
                        src={user?.profile_pic || "/user.png"}
                        alt="user"
                        width={100}
                        height={100}
                        className="w-9 h-9 rounded-full object-cover object-center"
                    />
                    Hi, {user?.name?.split(" ")[0] || "User"}
                    <span className="pointer-events-none absolute bottom-0 left-[15%] w-[70%] h-px opacity-20 bg-gradient-to-r from-transparent via-white to-transparent transition-all duration-1000 ease-[cubic-bezier(0.15,0.83,0.66,1)] group-hover:opacity-100"></span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="bg-[radial-gradient(ellipse_at_bottom,_rgba(71,81,92,1)_0%,_rgba(11,21,30,1)_45%)] text-white/70 border border-gray-400/50 shadow-lg rounded-lg p-2 min-w-[150px] z-1000"
            >
                <DropdownMenuItem
                    className="hover:text-white cursor-pointer rounded px-3 py-2 mb-2"
                    onClick={() => {
                        router.push("/profile");
                        setNavOpen(false);
                    }}
                >
                    <BadgeCheck /> Account Details
                </DropdownMenuItem>
                <Separator className="bg-gray-500/40" />
                <DropdownMenuItem
                    className="hover:text-white cursor-pointer rounded px-3 py-2 mt-2"
                    onClick={() => {
                        handleLogout();
                        setNavOpen(false);
                    }}
                >
                    <LogOut /> Log Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    const LoginDropdown = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="cartBtn rounded-full p-0.5 text-[0.95rem] leading-none">
                    <div className="button-overlay"></div>
                    <span className="rounded-full py-2 px-6 gap-1 flex items-center">
                        Login
                        <ArrowRight size={18} className="text-white" />
                    </span>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="bg-[radial-gradient(ellipse_at_bottom,_rgba(71,81,92,1)_0%,_rgba(11,21,30,1)_45%)] text-white/70 border border-gray-400/50 shadow-lg rounded-lg p-2 min-w-[180px] z-1000"
            >
                <DropdownMenuItem
                    className="hover:text-white cursor-pointer rounded px-3 py-2"
                    onClick={() => {
                        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                        setNavOpen(false);
                    }}
                >
                    👤 User Login
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="hover:text-white cursor-pointer rounded px-3 py-2"
                    onClick={() => {
                        window.open("https://www.matengmarket.com", "_blank");
                        setNavOpen(false);
                    }}
                >
                    🏢 Business Login
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    return (
        <div className="w-full fixed top-0 z-[1000] sm:px-4 bg-gradient-to-r from-[#131316d9] via-[#222226a6] to-[#131316d9] backdrop-blur-sm">
            <div className="navbar flex justify-between items-center h-16">
                <Link href={`/home`}>
                    <div className="h-16 flex items-center justify-center p-2 pl-0">
                        <img src="../logo.png" alt="logo" className="h-full object-contain" />
                    </div>
                </Link>

                <div className="menu-bar inline-flex gap-1 lg:gap-3 items-center">
                    {links.map((link) => (
                        <span
                            key={link.href}
                            className={`${pathname === link.href ? "bg-[#09090b20] rounded-full backdrop-blur-[10px]" : ""}`}
                        >
                            <Link href={link.href}>{link.name}</Link>
                        </span>
                    ))}
                </div>


                <div className="flex flex-row items-center gap-4">
                    {user ? <UserGreeting /> : <LoginDropdown />}
                    <Link href="/cart" onClick={() => setNavOpen(false)}>
                        <TooltipProvider>
                            <Tooltip>
                                {/* <TooltipTrigger>
                                    <div className="cartBtn relative rounded-full p-0.5 text-[0.95rem] leading-none hover:bg-[#222226a6]">
                                        {cartItems.length > 0 && (
                                            <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-semibold w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
                                                {cartItems.length}
                                            </div>
                                        )}
                                        <div className="button-overlay"></div>
                                        <span className="rounded-full p-2.5 gap-3">
                                            🛒
                                        </span>
                                    </div>
                                </TooltipTrigger> */}
                                <TooltipContent className="z-1000">
                                    <p className="text-white">Go to Cart</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </Link>

                    <label className="hamburger pr-3">
                        <input
                            type="checkbox"
                            className="hamburger-checkbox"
                            checked={isNavOpen}
                            onChange={toggleNav}
                        />
                        <svg viewBox="0 0 32 32">
                            <path className="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
                            <path className="line" d="M7 16 27 16"></path>
                        </svg>
                    </label>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="small-navbar h-16">
                <div className="w-full flex justify-between items-center">
                    <div className="z-1000">
                        <Link href={`/home`}>
                            <img
                                src="../logo.png"
                                alt="logo"
                                className="ml-2"
                                style={{ width: "9rem" }}
                            />
                        </Link>
                    </div>

                    <label className="hamburger pr-3">
                        <input
                            type="checkbox"
                            className="hamburger-checkbox"
                            checked={isNavOpen}
                            onChange={toggleNav}
                        />
                        <svg viewBox="0 0 32 32">
                            <path className="line line-top-bottom" d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"></path>
                            <path className="line" d="M7 16 27 16"></path>
                        </svg>
                    </label>
                </div>

                <nav ref={navMenuRef} className={`nav-menu ${isNavOpen ? "open" : "closed"}`}>
                    <div className="flex flex-col items-center">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`navlink ${pathname === link.href ? "active" : ""} ${isNavOpen ? "animate" : ""}`}
                                onClick={closedNav}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <div className="mt-[4rem] flex flex-col gap-3 items-center">
                            {user ? <UserGreeting /> : <LoginDropdown />}
                        </div>

                        <div className="relative mt-[7rem]">
                            <CardDescription className="text-sm mb-3">Visit our cargo service page to get started.</CardDescription>
                            <a href="tel:+919774795905">
                                <button
                                    type="button"
                                    className="flex px-6 py-3 justify-center font-semibold gap-10 items-center mx-auto shadow-md text-sm text-white bg-gradient-to-tr from-green-900/30 via-green-900/70 to-green-900/30 ring-4 ring-green-900/20 backdrop-blur-md lg:font-medium isolation-auto before:absolute before:w-full before:transition-all before:duration-500 hover:before:w-full before:right-full hover:before:right-0 before:rounded-full before:bg-green-700 hover:text-gray-50 before:-z-10 before:aspect-square hover:before:scale-150 hover:before:duration-500 relative z-10 px-3.5 py-1.5 overflow-hidden border-2 rounded-full group"
                                >
                                    Cargo Service Inquiries
                                    <svg
                                        className="w-5 h-5 justify-end group-hover:rotate-90 group-hover:bg-gray-50 text-white ease-linear duration-300 rounded-full border border-white group-hover:border-none p-1 rotate-45"
                                        viewBox="0 0 16 19"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
                                            className="fill-white group-hover:fill-gray-800"
                                        ></path>
                                    </svg>
                                </button>
                            </a>

                        </div>
                    </div>
                </nav>
            </div>
        </div>
    );
}

export default Navbar;
