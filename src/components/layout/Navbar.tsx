import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "./ThemeToggle";
import { useIsMobile } from "@/hooks/use-mobile";
import SubscriptionInfo from "./SubscriptionInfo";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar = ({ toggleSidebar }: NavbarProps) => {
  const isMobile = useIsMobile();
  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className=" mx-auto px-8 flex h-14 items-center">
        <div className="mr-4 flex">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2"
              aria-label="Toggle menu"
            >
              <Menu className="size-4" />
            </Button>
          )}
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center justify-center gap-2">
          <SubscriptionInfo />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
