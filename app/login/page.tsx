import { AuthUI } from "@/components/ui/auth-ui";

export default function LoginPage() {
  const image = {
    src: "https://phvjdfqxzitzohiskwwo.supabase.co/storage/v1/object/public/ticket-pdfs//Group%201.jpg",
    alt: "Soccer team celebration"
  }

  // You can customize the image and quote here if you want
  return <AuthUI image={image} />;
}
