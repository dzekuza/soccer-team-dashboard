import { supabaseService } from "@/lib/supabase-service";
import PostsClient from "./posts-client";
import { connection } from 'next/server';

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  await connection();
  try {
    const postsData = await supabaseService.getPosts();

    return <PostsClient initialPosts={postsData} />;
  } catch (error) {
    console.error(error);
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h1 className="text-title font-bold">Error</h1>
                <p className="text-red-500">Failed to load posts data. Please try again later.</p>
            </div>
        </div>
    );
  }
}
