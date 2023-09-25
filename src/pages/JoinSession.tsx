// pages/joinSession.js
import { useDispatch } from 'react-redux';
import { setName } from '../slices/userSlice';
import { useRouter } from 'next/router';

export default function JoinSession() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleSubmit = (e:any) => {
    e.preventDefault();
    const name = e.target.name.value;
    const room = e.target.room.value;
    dispatch(setName(name));
    router.push(`/whiteboard/${room}`);
  };

  return (
    <div className='bg-white text-black'>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Enter your name" required />
        <input type="text" name="room" placeholder="Enter session ID" required />
        <button type="submit">Join Session</button>
      </form>
    </div>
  );
}
