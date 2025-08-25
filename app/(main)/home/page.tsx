'use client'

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import Footer from "@/components/footer/Footer";
import { CardDescription } from "@/components/ui/card";

export default function page() {
  const [parcels, setParcels] = useState(0);
  const [merchants, setMerchants] = useState(0);
  const [businesses, setBusinesses] = useState(0);

  useEffect(() => {
    const targetParcels = 30000;
    const targetMerchants = 150;
    const targetBusinesses = 70;

    const startParcels = 10000;
    const startMerchants = 50;
    const startBusinesses = 10;

    const stepsParcels = targetParcels - startParcels;
    const stepsMerchants = targetMerchants - startMerchants;
    const stepsBusinesses = targetBusinesses - startBusinesses;

    const maxSteps = Math.max(stepsParcels / 750, stepsMerchants / 5, stepsBusinesses / 2);

    const parcelIncrement = Math.ceil(stepsParcels / maxSteps);
    const merchantIncrement = Math.ceil(stepsMerchants / maxSteps);
    const businessIncrement = Math.ceil(stepsBusinesses / maxSteps);

    const interval = setInterval(() => {
      setParcels((prev) => (prev < targetParcels ? prev + parcelIncrement : targetParcels));
      setMerchants((prev) => (prev < targetMerchants ? prev + merchantIncrement : targetMerchants));
      setBusinesses((prev) => (prev < targetBusinesses ? prev + businessIncrement : targetBusinesses));
    }, 50);

    return () => clearInterval(interval);
  }, []);



  return (
    <div className="w-[100vw] h-[100svh]">

      <div className="h-full text-center text-5xl font-bold text-white pb-10 sm:pb-20 flex flex-col justify-center items-center gap-10">
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-0 text-5xl sm:text-[2.5rem] md:text-[3rem] lg:text-[4rem] text-transparent bg-gradient-to-b from-white to-gray-400 bg-clip-text z-20 animate-fade-in">
          <span>We Drive,</span>
          <span> We Discover</span>
        </div>

        <div className="w-full z-20">
          <div className="flex flex-row justify-center gap-2 sm:gap-0 md:gap-10 text-[#b5b6be] text-base md:text-lg lg:text-[1.3rem] w-[95vw] sm:w-[80vw] md:w-fit mx-auto ">
            <div>
              Delivered <span className="text-green-600">{parcels}+</span>{" "}
              parcels
            </div>
            <div className="w-[2px] h-11 sm:h-7 mx-auto rounded bg-gray-200/40" />
            <div>
              Merchants <span className="text-green-600">{merchants}+</span>
            </div>
            <div className="w-[2px] h-11 sm:h-7 mx-auto rounded bg-gray-200/40" />
            <div >
              Discovered <span className="text-green-600">{businesses}+</span>{" "}
              businesses
            </div>

          </div>
        </div>

        <div className="z-20 flex flex-col sm:flex-row gap-6 sm:gap-10">
          <Link href={`/products`}>
            <button
              className="relative inline-flex items-center gap-2 px-8 py-3 font-semibold text-teal-50 bg-gradient-to-tr from-amber-200/60 via-amber-300/70 to-amber-300/80 ring-4 ring-amber-200/25 rounded-full overflow-hidden hover:opacity-95 transition-opacity before:absolute before:top-4 before:left-1/2 before:-translate-x-1/2 before:w-[100px] before:h-[100px] before:rounded-full before:bg-gradient-to-b before:from-teal-50/10 before:blur-xl text-base animate-arrow"
            >
              Explore Marketplace
              <span className="svg pt-[1px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="13"
                  viewBox="0 0 38 15"
                  fill="none"
                >
                  <path
                    fill="#f0fdfa"
                    d="M10 7.519l-.939-.344h0l.939.344zm14.386-1.205l-.981-.192.981.192zm1.276 5.509l.537.843.148-.094.107-.139-.792-.611zm4.819-4.304l-.385-.923h0l.385.923zm7.227.707a1 1 0 0 0 0-1.414L31.343.448a1 1 0 0 0-1.414 0 1 1 0 0 0 0 1.414l5.657 5.657-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364zM1 7.519l.554.833.029-.019.094-.061.361-.23 1.277-.77c1.054-.609 2.397-1.32 3.629-1.787.617-.234 1.17-.392 1.623-.455.477-.066.707-.008.788.034.025.013.031.021.039.034a.56.56 0 0 1 .058.235c.029.327-.047.906-.39 1.842l1.878.689c.383-1.044.571-1.949.505-2.705-.072-.815-.45-1.493-1.16-1.865-.627-.329-1.358-.332-1.993-.244-.659.092-1.367.305-2.056.566-1.381.523-2.833 1.297-3.921 1.925l-1.341.808-.385.245-.104.068-.028.018c-.011.007-.011.007.543.84zm8.061-.344c-.198.54-.328 1.038-.36 1.484-.032.441.024.94.325 1.364.319.45.786.64 1.21.697.403.054.824-.001 1.21-.09.775-.179 1.694-.566 2.633-1.014l3.023-1.554c2.115-1.122 4.107-2.168 5.476-2.524.329-.086.573-.117.742-.115s.195.038.161.014c-.15-.105.085-.139-.076.685l1.963.384c.192-.98.152-2.083-.74-2.707-.405-.283-.868-.37-1.28-.376s-.849.069-1.274.179c-1.65.43-3.888 1.621-5.909 2.693l-2.948 1.517c-.92.439-1.673.743-2.221.87-.276.064-.429.065-.492.057-.043-.006.066.003.155.127.07.099.024.131.038-.063.014-.187.078-.49.243-.94l-1.878-.689zm14.343-1.053c-.361 1.844-.474 3.185-.413 4.161.059.95.294 1.72.811 2.215.567.544 1.242.546 1.664.459a2.34 2.34 0 0 0 .502-.167l.15-.076.049-.028.018-.011c.013-.008.013-.008-.524-.852l-.536-.844.019-.012c-.038.018-.064.027-.084.032-.037.008.053-.013.125.056.021.02-.151-.135-.198-.895-.046-.734.034-1.887.38-3.652l-1.963-.384zm2.257 5.701l.791.611.024-.031.08-.101.311-.377 1.093-1.213c.922-.954 2.005-1.894 2.904-2.27l-.771-1.846c-1.31.547-2.637 1.758-3.572 2.725l-1.184 1.314-.341.414-.093.117-.025.032c-.01.013-.01.013.781.624zm5.204-3.381c.989-.413 1.791-.42 2.697-.307.871.108 2.083.385 3.437.385v-2c-1.197 0-2.041-.226-3.19-.369-1.114-.139-2.297-.146-3.715.447l.771 1.846z"
                  ></path>
                </svg>
              </span>
            </button>
          </Link>
          <Link href={`/delivery-rates`}>
            <button
              className="relative inline-flex items-center gap-2 px-8 py-3 font-semibold text-teal-50 bg-gradient-to-tr from-teal-900/30 via-teal-900/70 to-teal-900/30 ring-4 ring-teal-900/20 rounded-full overflow-hidden hover:opacity-90 transition-opacity before:absolute before:top-4 before:left-1/2 before:-translate-x-1/2 before:w-[100px] before:h-[100px] before:rounded-full before:bg-gradient-to-b before:from-teal-50/10 before:blur-xl text-base animate-arrow"
            >
              Book Delivery Service
              <span className="svg pt-[1px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="13"
                  viewBox="0 0 38 15"
                  fill="none"
                >
                  <path
                    fill="#f0fdfa"
                    d="M10 7.519l-.939-.344h0l.939.344zm14.386-1.205l-.981-.192.981.192zm1.276 5.509l.537.843.148-.094.107-.139-.792-.611zm4.819-4.304l-.385-.923h0l.385.923zm7.227.707a1 1 0 0 0 0-1.414L31.343.448a1 1 0 0 0-1.414 0 1 1 0 0 0 0 1.414l5.657 5.657-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364zM1 7.519l.554.833.029-.019.094-.061.361-.23 1.277-.77c1.054-.609 2.397-1.32 3.629-1.787.617-.234 1.17-.392 1.623-.455.477-.066.707-.008.788.034.025.013.031.021.039.034a.56.56 0 0 1 .058.235c.029.327-.047.906-.39 1.842l1.878.689c.383-1.044.571-1.949.505-2.705-.072-.815-.45-1.493-1.16-1.865-.627-.329-1.358-.332-1.993-.244-.659.092-1.367.305-2.056.566-1.381.523-2.833 1.297-3.921 1.925l-1.341.808-.385.245-.104.068-.028.018c-.011.007-.011.007.543.84zm8.061-.344c-.198.54-.328 1.038-.36 1.484-.032.441.024.94.325 1.364.319.45.786.64 1.21.697.403.054.824-.001 1.21-.09.775-.179 1.694-.566 2.633-1.014l3.023-1.554c2.115-1.122 4.107-2.168 5.476-2.524.329-.086.573-.117.742-.115s.195.038.161.014c-.15-.105.085-.139-.076.685l1.963.384c.192-.98.152-2.083-.74-2.707-.405-.283-.868-.37-1.28-.376s-.849.069-1.274.179c-1.65.43-3.888 1.621-5.909 2.693l-2.948 1.517c-.92.439-1.673.743-2.221.87-.276.064-.429.065-.492.057-.043-.006.066.003.155.127.07.099.024.131.038-.063.014-.187.078-.49.243-.94l-1.878-.689zm14.343-1.053c-.361 1.844-.474 3.185-.413 4.161.059.95.294 1.72.811 2.215.567.544 1.242.546 1.664.459a2.34 2.34 0 0 0 .502-.167l.15-.076.049-.028.018-.011c.013-.008.013-.008-.524-.852l-.536-.844.019-.012c-.038.018-.064.027-.084.032-.037.008.053-.013.125.056.021.02-.151-.135-.198-.895-.046-.734.034-1.887.38-3.652l-1.963-.384zm2.257 5.701l.791.611.024-.031.08-.101.311-.377 1.093-1.213c.922-.954 2.005-1.894 2.904-2.27l-.771-1.846c-1.31.547-2.637 1.758-3.572 2.725l-1.184 1.314-.341.414-.093.117-.025.032c-.01.013-.01.013.781.624zm5.204-3.381c.989-.413 1.791-.42 2.697-.307.871.108 2.083.385 3.437.385v-2c-1.197 0-2.041-.226-3.19-.369-1.114-.139-2.297-.146-3.715.447l.771 1.846z"
                  ></path>
                </svg>
              </span>
            </button>
          </Link>
          {/* <Link href={`https://matengbusiness.vercel.app/delivery_orders`}>
            <button
              className="relative inline-flex items-center gap-2 px-8 py-3 font-semibold text-teal-50 bg-gradient-to-tr from-teal-900/30 via-teal-900/70 to-teal-900/30 ring-4 ring-teal-900/20 rounded-full overflow-hidden hover:opacity-90 transition-opacity before:absolute before:top-4 before:left-1/2 before:-translate-x-1/2 before:w-[100px] before:h-[100px] before:rounded-full before:bg-gradient-to-b before:from-teal-50/10 before:blur-xl text-base animate-arrow"
            >
              Business Login
              <span className="svg pt-[1px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="13"
                  viewBox="0 0 38 15"
                  fill="none"
                >
                  <path
                    fill="#f0fdfa"
                    d="M10 7.519l-.939-.344h0l.939.344zm14.386-1.205l-.981-.192.981.192zm1.276 5.509l.537.843.148-.094.107-.139-.792-.611zm4.819-4.304l-.385-.923h0l.385.923zm7.227.707a1 1 0 0 0 0-1.414L31.343.448a1 1 0 0 0-1.414 0 1 1 0 0 0 0 1.414l5.657 5.657-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364zM1 7.519l.554.833.029-.019.094-.061.361-.23 1.277-.77c1.054-.609 2.397-1.32 3.629-1.787.617-.234 1.17-.392 1.623-.455.477-.066.707-.008.788.034.025.013.031.021.039.034a.56.56 0 0 1 .058.235c.029.327-.047.906-.39 1.842l1.878.689c.383-1.044.571-1.949.505-2.705-.072-.815-.45-1.493-1.16-1.865-.627-.329-1.358-.332-1.993-.244-.659.092-1.367.305-2.056.566-1.381.523-2.833 1.297-3.921 1.925l-1.341.808-.385.245-.104.068-.028.018c-.011.007-.011.007.543.84zm8.061-.344c-.198.54-.328 1.038-.36 1.484-.032.441.024.94.325 1.364.319.45.786.64 1.21.697.403.054.824-.001 1.21-.09.775-.179 1.694-.566 2.633-1.014l3.023-1.554c2.115-1.122 4.107-2.168 5.476-2.524.329-.086.573-.117.742-.115s.195.038.161.014c-.15-.105.085-.139-.076.685l1.963.384c.192-.98.152-2.083-.74-2.707-.405-.283-.868-.37-1.28-.376s-.849.069-1.274.179c-1.65.43-3.888 1.621-5.909 2.693l-2.948 1.517c-.92.439-1.673.743-2.221.87-.276.064-.429.065-.492.057-.043-.006.066.003.155.127.07.099.024.131.038-.063.014-.187.078-.49.243-.94l-1.878-.689zm14.343-1.053c-.361 1.844-.474 3.185-.413 4.161.059.95.294 1.72.811 2.215.567.544 1.242.546 1.664.459a2.34 2.34 0 0 0 .502-.167l.15-.076.049-.028.018-.011c.013-.008.013-.008-.524-.852l-.536-.844.019-.012c-.038.018-.064.027-.084.032-.037.008.053-.013.125.056.021.02-.151-.135-.198-.895-.046-.734.034-1.887.38-3.652l-1.963-.384zm2.257 5.701l.791.611.024-.031.08-.101.311-.377 1.093-1.213c.922-.954 2.005-1.894 2.904-2.27l-.771-1.846c-1.31.547-2.637 1.758-3.572 2.725l-1.184 1.314-.341.414-.093.117-.025.032c-.01.013-.01.013.781.624zm5.204-3.381c.989-.413 1.791-.42 2.697-.307.871.108 2.083.385 3.437.385v-2c-1.197 0-2.041-.226-3.19-.369-1.114-.139-2.297-.146-3.715.447l.771 1.846z"
                  ></path>
                </svg>
              </span>
            </button>
          </Link> */}
        </div>

        <div>
          {/* <div className='relative'>
            <CardDescription className="text-sm mb-2 sm:mb-5 text-gray-300">Visit our cargo service page to get started.</CardDescription>
            <a href="https://cargo4.vercel.app/">
              <button
                type="submit"
                className="flex px-6 py-3 justify-center gap-10 items-center mx-auto shadow-md text-base text-white bg-gradient-to-tr from-green-900/30 via-green-900/70 to-green-900/30 ring-4 ring-green-900/20 backdrop-blur-md lg:font-medium isolation-auto before:absolute before:w-full before:transition-all before:duration-500 hover:before:w-full before:right-full hover:before:right-0 before:rounded-full before:bg-green-700 hover:text-gray-50 before:-z-10 before:aspect-square hover:before:scale-150 hover:before:duration-500 relative z-10 px-3.5 py-1.5 overflow-hidden border-2 rounded-full group"
              >
                Cargo Serice
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
          </div> */}
        </div>

      </div>

      <div className="w-full absolute bottom-0">
        <Footer />
      </div>
    </div>
  );
}
