import { supabaseService } from "@/lib/supabase-service";
import PostsClient from "./posts-client";
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic'

export default async function PostsPage() {
  noStore();
  try {
    const postsData = await supabaseService.getPosts();

    return <PostsClient initialPosts={postsData} />;
  } catch (error) {
    console.error(error);
    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h1 className="text-2xl font-bold">Error</h1>
                <p className="text-red-500">Failed to load posts data. Please try again later.</p>
            </div>
        </div>
    );
  }
}
