import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { api } from "~/utils/api";
import type { Post } from "../types";
import { useState } from "react";
import Image from "next/image";

type PostProps = {
  post: Post;
};

const Post = ({ post }: PostProps) => {
  const { id, content } = post;
  const { data: sessionData } = useSession();

  const ctx = api.useContext();

  const { mutate: deleteMutation } = api.post.delete.useMutation({
    onSettled: async () => {
      await ctx.post.getAll.invalidate();
    },
  });

  return (
    <div className="flex gap-3 p-4">
      <Image
        src={sessionData?.user.image}
        alt="profile image"
        width={56}
        height={56}
        className="rounded-xl"
      />
      <p className="flex flex-col justify-center text-white">{content}</p>
      <button
        className="rounded-xl bg-red-500 p-2 text-white"
        onClick={() => deleteMutation(id)}
      >
        del
      </button>
    </div>
  );
};

const Posts = () => {
  const { data: posts, isLoading } = api.post.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  return (
    <div>
      {posts?.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

const CreatePost = () => {
  const { data: sessionData } = useSession();
  const [input, setInput] = useState("");

  const ctx = api.useContext();

  const { mutate } = api.post.create.useMutation({
    onSettled: async () => {
      setInput("");
      await ctx.post.getAll.invalidate();
    },
  });

  return (
    <form
      className="flex flex-row gap-3 border-b border-white p-4 text-white"
      onSubmit={(e) => {
        e.preventDefault();
        mutate(input);
      }}
    >
      <Image
        src={sessionData?.user.image}
        alt="profile image"
        width={56}
        height={56}
        className="rounded-xl"
      />
      <input
        className="rounded-xl p-3 text-black"
        type="text"
        name="new-post"
        id="new-post"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
        }}
      />
      <button>Post</button>
    </form>
  );
};

const Home: NextPage = () => {
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <h1 className="text-3xl text-white">t3 crud practice</h1>
        <AuthShowcase />
        <br></br>

        <CreatePost />
        <br></br>

        <Posts />
      </main>
    </>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-white">
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};
