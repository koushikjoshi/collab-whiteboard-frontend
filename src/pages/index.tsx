import { useDispatch } from 'react-redux';
import { setName } from '../slices/userSlice';
import { useRouter } from 'next/router';

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const name = e.target.name.value;
    dispatch(setName(name));
    const room = Math.random().toString(36).substr(2, 9);
    router.push(`/whiteboard/${room}`);
  };

  return (
    <div className='bg-white text-black w-screen h-screen flex flex-col justify-center items-center'>
      <form onSubmit={handleSubmit} className='flex flex-col h-full w-full justify-center items-center'>
        <input type="text" name="name" placeholder="Enter your name" required className='border border-solid border-black px-2 py-2 rounded-lg'/>
        <button type="submit" className='mt-[30px] border border-solid border-blue-400 px-2 py-2 bg-blue-300 text-white hover:bg-blue-400 transition-all duration-200'>Create New Session</button>
      </form>
    </div>
  );
}
