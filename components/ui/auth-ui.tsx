"use client"

import * as React from "react";
import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createBrowserClient } from '@supabase/ssr'
import { Alert, AlertDescription } from "@/components/ui/alert";

// UTILITY: cn function for merging Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- BUILT-IN UI COMPONENTS (No changes here) ---

// COMPONENT: Label
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

// COMPONENT: Button
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input dark:border-input/50 bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary-foreground/60 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

// COMPONENT: Input
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input dark:border-input/50 bg-background px-3 py-3 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:bg-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

// COMPONENT: PasswordInput
export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-muted-foreground/80 transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50" aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? (<EyeOff className="size-4" aria-hidden="true" />) : (<Eye className="size-4" aria-hidden="true" />)}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

// --- FORMS & AUTH LOGIC ---

// FORM: SignInForm
function SignInForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const rememberMe = formData.get("rememberMe") === "on";

    // Create a Supabase client with storage options based on "Remember Me"
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: rememberMe ? localStorage : undefined, // Use default (localStorage) or memory storage
          persistSession: rememberMe,
        },
      }
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Neteisingas el. paštas arba slaptažodis");
    } else {
      onAuthSuccess();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignIn} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Prisijungti</h1>
        <p className="text-balance text-sm text-muted-foreground">Įveskite savo duomenis</p>
      </div>
      {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">El. paštas</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" /></div>
        <PasswordInput name="password" label="Slaptažodis" required autoComplete="current-password" placeholder="••••••••" />
        <div className="flex items-center space-x-2">
          <input type="checkbox" name="rememberMe" id="rememberMe" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <Label htmlFor="rememberMe">Prisiminti mane</Label>
        </div>
        <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Jungiamasi...</> : 'Prisijungti'}
        </Button>
      </div>
    </form>
  );
}

// FORM: SignUpForm
function SignUpForm({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    const { error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      setError(error.message);
    } else {
      onAuthSuccess();
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} autoComplete="on" className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sukurti paskyrą</h1>
        <p className="text-balance text-sm text-muted-foreground">Įveskite savo duomenis registracijai</p>
      </div>
       {error && (
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
      )}
      <div className="grid gap-4">
        <div className="grid gap-2"><Label htmlFor="email">El. paštas</Label><Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" /></div>
        <PasswordInput name="password" label="Slaptažodis" required autoComplete="new-password" placeholder="••••••••"/>
        <Button type="submit" variant="outline" className="mt-2" disabled={isLoading}>
          {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Kuriama...</> : 'Registruotis'}
        </Button>
      </div>
    </form>
  );
}

// CONTAINER for the forms to handle state switching
function AuthFormContainer() {
    const [isSignIn, setIsSignIn] = useState(true);
    const router = useRouter();
    
    const handleAuthSuccess = () => {
        if (isSignIn) {
            router.refresh();
            router.replace("/dashboard/overview");
        } else {
            // On sign up, Supabase sends a confirmation email.
            // We can switch to the sign-in view with a success message.
            setIsSignIn(true);
            // You could also add a state here to show a "Check your email" message.
        }
    };

    return (
        <div className="mx-auto grid w-[350px] gap-6">
            {isSignIn ? <SignInForm onAuthSuccess={handleAuthSuccess} /> : <SignUpForm onAuthSuccess={handleAuthSuccess} />}
            <div className="text-center text-sm">
                {isSignIn ? "Neturite paskyros?" : "Jau turite paskyrą?"}{" "}
                <Button variant="link" className="pl-1 text-foreground" onClick={() => setIsSignIn(!isSignIn)}>
                    {isSignIn ? "Registruotis" : "Prisijungti"}
                </Button>
            </div>
        </div>
    )
}

// --- MAIN EXPORTED COMPONENT ---

interface AuthUIProps {
    image?: {
        src: string;
        alt: string;
    };
    quote?: {
        text: string;
        author: string;
    } | null;
}

const defaultImage = {
    src: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=2574&auto=format&fit=crop",
    alt: "A soccer player kicking a ball on a field."
};

export function AuthUI({ image = defaultImage, quote }: AuthUIProps) {
    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <AuthFormContainer />
            </div>
            <div className="hidden bg-muted lg:block relative">
                <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${image.src})` }} 
                    aria-label={image.alt}
                />
                <div className="absolute inset-0 bg-black/50" />
                {quote && (
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                        <blockquote className="space-y-2">
                            <p className="text-lg">&ldquo;{quote.text}&rdquo;</p>
                            <footer className="text-sm opacity-80">{quote.author}</footer>
                        </blockquote>
                    </div>
                )}
            </div>
        </div>
    );
} 