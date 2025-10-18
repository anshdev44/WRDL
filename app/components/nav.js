import React from 'react'
import Logo from '../../public/lg.png'

const Nav = () => {
    return (
        <div className='flex mt-10  justify-center'>
            <div className='rounded-full border w-[80%] h-25 flex justify-between items-center p-5'>
                <div>
                    <div><img src='/logo.png' alt='logo image' className='w-[200px]'/></div>
                </div>
                <div>
                    <div>
                        <ul className='flex gap-10 text-white  text-lg'>
                            <li className='cursor-pointer hover:bg-gray-500 rounded-full p-2.5'>Home</li>
                            <li className='cursor-pointer hover:bg-gray-500 rounded-full p-2.5'>Rules</li>
                            <li className='cursor-pointer hover:bg-gray-500 rounded-full p-2.5'>Login/Signup</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Nav
