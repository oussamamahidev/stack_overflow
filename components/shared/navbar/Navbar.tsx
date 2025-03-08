import Link from 'next/link'
import React, { Suspense } from 'react'
import Image from 'next/image'
import { SignedIn } from '@clerk/nextjs'
import { UserButton } from "@clerk/nextjs";
import Theme from './Theme';
import MobileNav from './MobileNav';
import GlobalSearch from '../search/GlobalSearch';

const Navbar = () => {
  return (
    <nav className=" flex-between background-light900_dark200 fixed z-50 w-full gap-5 p-5 shadow-light-300 sm:px-12 dark:shadownone ">

<Link href="/" className="flex items-center gap-1">
        <Image
          src="/assets/images/site-logo.svg"
          width={23}
          height={23}
          alt="DevFlow"
        /> 
        <p className="h2-bold font-spaceGrotesk text-dark-100 max-sm:hidden dark:text-light-900">
          D2s<span className="text-primary-500">Overflow</span>
        </p>
      </Link>
      <Suspense>   <GlobalSearch /></Suspense>
   
      <div className="flex-between gap-5">
        <Theme />
        <SignedIn>
            <UserButton afterSignOutUrl="/" 
            appearance={{
                elements:{
                    avatarBox: 'h-9 w-9'
                },
                variables: {
                    colorPrimary: '#ff7000'
                }
            }}
            />
        </SignedIn>
        <MobileNav />
      </div>
    </nav>
  )
}

export default Navbar