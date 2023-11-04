// pages/joinSession.js
import { useDispatch } from "react-redux";
import { setName } from "../slices/userSlice";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";

export default function JoinSession() {
  const dispatch = useDispatch();
  const router = useRouter();
  const room = router.query.session || "";

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const name = e.target.name.value;
    if (!room) {
      const roomInput = e.target.room.value;
      dispatch(setName(name));
      router.push(`/whiteboard/${roomInput}`);
    } else {
      dispatch(setName(name));
      router.push(`/whiteboard/${room}`);
    }
  };

  return (
    <Center h="100vh" bg="white" color="black">
      <Box
        as="form"
        w="300px"
        p="10"
        bg="white"
        boxShadow="md"
        onSubmit={handleSubmit}
      >
        <FormControl id="name" isRequired>
          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            required
            className="border border-solid border-black px-2 py-2 rounded-lg"
          />
        </FormControl>
        {!room && (
          <FormControl id="room" isRequired mt="4">
            <FormLabel>Session ID</FormLabel>
            <input
              type="text"
              name="name"
              placeholder="Enter session ID"
              required
              className="border border-solid border-black px-2 py-2 rounded-lg"
            />
          </FormControl>
        )}
        <button
          className="mt-[30px] border border-solid border-blue-400 px-2 py-2 bg-blue-300 text-white hover:bg-blue-400 transition-all duration-200"
          type="submit"
        >
          Join Session
        </button>
      </Box>
    </Center>
  );
}
