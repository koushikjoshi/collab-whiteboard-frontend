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
    <div className='bg-white text-black'>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Enter your name" required />
        <button type="submit">Create Whiteboard Session</button>
      </form>
    </div>
  );
}
