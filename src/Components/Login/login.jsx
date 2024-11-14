import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import './login.css';

function Login() {
    const [name, setName] = useState('');
    const [roomid, setRoomId] = useState('');

    const senddata = {
        name: name,
        roomId: roomid
    }
    const navigate = useNavigate();
    const isvalid = async (e) => {
        e.preventDefault();
        if (name == '' || roomid == '') {
            navigate('/');
        } else if (name.length < 2) {
            navigate('/');
        } else {
            localStorage.setItem('name', name);
            try {
                const response = await axios.post('http://localhost:3000/data', senddata);
                navigate(`room/${roomid}`);
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }
    return (
        <div className='h-screen w-screen bg-slate-900 flex justify-center'>
            <div className=" max-w-screen-md max-h-[500px]  sm:my-auto p-5 bg-slate-700 bg-opacity-10 rounded-[25px] backdrop-blur-2xl backdrop-saturate-100">
                <form className="w-full">
                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-400 text-xs font-bold mb-2"
                                htmlFor="grid-password"
                            >
                                Username
                            </label>
                            <input
                                id="name"
                                name="name"
                                onChange={(e) => setName(e.target.value)}
                                required
                                value={name}
                                placeholder="Enter Username"
                                className="appearance-none block w-full bg-transparent text-white border-b border-gray-500  py-3 px-4 mb-3 leading-tight focus:outline-none  focus:border-gray-100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap -mx-3 mb-6">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-400 text-xs font-bold mb-2"
                                htmlFor="grid-password"
                            >
                                Room ID
                            </label>
                            <input
                                name="roomid"
                                placeholder="Enter Room ID"
                                rows="3"
                                required
                                id="roomid"
                                value={roomid}
                                onChange={(e) => setRoomId(e.target.value)}
                                className="max-h-64 min-h-[50px] appearance-none block w-full bg-transparent text-white border-b border-gray-500  py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-gray-100"
                            ></input>
                        </div>
                        <div className="flex justify-center mt-5 w-full px-3">
                            <div className="md:flex md:items-center" />
                            <button
                                className="shadow bg-indigo-600 hover:bg-indigo-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-6 rounded-[15px]"
                                onClick={isvalid}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;


