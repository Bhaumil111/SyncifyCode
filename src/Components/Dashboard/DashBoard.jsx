import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Splitter, SplitterPanel } from 'primereact/splitter';
import io from 'socket.io-client';
import Selectlang from './LanguageSelection.jsx';
import Code from './Editor.jsx';
import Users from './Users.jsx';
import LogoutIcon from '@mui/icons-material/Logout';
import "./DashBoard.css";

const Dash = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [code, setCode] = useState('');
    const [socket, setSocket] = useState(null);
    const [usernames, setUsernames] = useState([]);
    const [isSocketInitialized, setIsSocketInitialized] = useState(false);

    const username = localStorage.getItem('name');
    const roomId = location.pathname.split('/')[2];

    const initializeSocket = useCallback(() => {
        if (roomId && username && !isSocketInitialized) {
            const socketInstance = io('http://localhost:3000/');
            socketInstance.emit('Update_users', { id: roomId, username });
            setSocket(socketInstance);
            setIsSocketInitialized(true);
        }
    }, [roomId, username, isSocketInitialized]);

    useEffect(() => {
        initializeSocket();
    }, [initializeSocket]);

    useEffect(() => {
        if (socket) {
            socket.on('User list for frontend', setUsernames);

            socket.on('New user joined', (username) => {
                toast(`${username} joined the room`);
            });

            socket.on('User left the room', (username) => {
                toast(`${username} left the room`);
            });
        }

        // Cleanup on component unmount or socket change
        return () => {
            if (socket) {
                socket.off('User list for frontend');
                socket.off('New user joined');
                socket.off('User left the room');
            }
        };
    }, [socket]);

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
    };

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const logout = () => {
        navigate('/');
        window.location.reload();
    };

    return (
        <div className='flex'>
            <section className='w-3/4'>
                <Code language={selectedLanguage} socket={socket} onCodeChange={handleCodeChange} />
            </section>

            <RightSidePanel 
                socket={socket}
                handleLanguageChange={handleLanguageChange}
                usernames={usernames}
                logout={logout}
            />
        </div>
    );
};

const RightSidePanel = ({ socket, handleLanguageChange, usernames, logout }) => {
    return (
        <section className='w-1/4 h-screen'>
            <main className='h-screen bg-gray-600'>
                <div className="flex h-[12%] align-items-center justify-content-center">
                    <Selectlang socket={socket} onChange={handleLanguageChange} />
                </div>
                <div className="flex align-items-center justify-content-center bg-gray-700 h-[78%]">
                    <div className='flex flex-col items-start gap-3 w-full px-3 md:px-8 py-4 h-full overflow-y-auto'>
                        {usernames?.map((name, index) => (
                            <Users key={index} name={name} />
                        ))}
                    </div>
                </div>
                <div className="flex align-items-center justify-content-center bg-gray-600 h-[10%]">
                    <button onClick={logout} className='bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded'>
                        Leave
                    </button>
                </div>
            </main>
        </section>
    );
};

export default Dash;
