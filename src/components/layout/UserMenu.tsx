import { useState } from "react";
import { User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export function UserMenu() {
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem("google_user");
    return saved ? JSON.parse(saved) : null;
  });

  // Google OAuth login
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Fetch user info from Google
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        if (!userInfoResponse.ok) {
          throw new Error("Failed to fetch user info");
        }

        const userInfo = await userInfoResponse.json();
        const userProfile: UserProfile = {
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        };

        setUser(userProfile);
        localStorage.setItem("google_user", JSON.stringify(userProfile));
        toast.success(`Welcome, ${userInfo.name}!`);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        toast.error("Failed to sign in. Please try again.");
      }
    },
    onError: () => {
      toast.error("Sign in failed. Please try again.");
    },
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("google_user");
    toast.success("Signed out successfully");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="border-2 border-border hover:shadow-xs"
        >
          {user ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.picture} alt={user.name} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => login()}>
              <User className="mr-2 h-4 w-4" />
              <span>Sign in with Google</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

