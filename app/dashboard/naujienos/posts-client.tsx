"use client"

import { useState, useMemo } from "react"
import { Plus, Search, Edit, Trash2, Eye, Calendar, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { format } from 'date-fns'
import Image from "next/image"

interface Post {
  id: string
  title: string
  content: string
  excerpt?: string
  author?: string
  published_date?: string
  url: string
  image_url?: string
  category?: string
  tags?: string[]
  source: string
  fingerprint: string
  created_at: string
}

interface PostsClientProps {
  initialPosts: Post[]
}

export default function PostsClient({ initialPosts }: PostsClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  const filteredPosts = useMemo(() => {
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [posts, searchTerm])

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      }).then(res => res.json())

      if (error) {
        throw new Error(error)
      }

      setPosts(posts.filter(post => post.id !== postId))
      toast({
        title: "Success",
        description: "Post deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      })
    }
  }

  const handleViewPost = (post: Post) => {
    setSelectedPost(post)
    setIsViewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Posts Management</h1>
          <p className="text-muted-foreground">
            Manage news posts and articles
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Post
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, source, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="relative w-16 h-9 rounded overflow-hidden">
                      <Image
                        src={post.image_url || '/placeholder-logo.png'}
                        alt={post.title}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-logo.png'
                        }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium truncate">{post.title}</p>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground truncate">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{post.author || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{post.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.category || 'General'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {post.published_date 
                          ? format(new Date(post.published_date), 'MMM dd, yyyy')
                          : 'Not published'
                        }
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewPost(post)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{post.title}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {post.image_url && (
                              <div className="relative aspect-video rounded-lg overflow-hidden">
                                <Image
                                  src={post.image_url}
                                  alt={post.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>By {post.author || 'Unknown'}</span>
                              <span>•</span>
                              <span>{post.source}</span>
                              <span>•</span>
                              <span>{post.category || 'General'}</span>
                              {post.published_date && (
                                <>
                                  <span>•</span>
                                  <span>{format(new Date(post.published_date), 'PPP')}</span>
                                </>
                              )}
                            </div>
                            {post.excerpt && (
                              <p className="text-lg font-medium">{post.excerpt}</p>
                            )}
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center space-x-2">
                                {post.tags?.map((tag) => (
                                  <Badge key={tag} variant="secondary">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              <Button asChild>
                                <a href={post.url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  View Original
                                </a>
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the post
                              "{post.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePost(post.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredPosts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No posts found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
