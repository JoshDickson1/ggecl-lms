import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

function GoogleSigninBtn({ children }: { children: React.ReactNode }) {
  return (
    <Button
      type="button"
      className="flex items-center gap-2 text-md border border-gray-400/30 justify-center py-3 rounded-sm bg-white text-black font-medium text-sm hover:bg-white/80 w-full"
    >
      <FcGoogle />
      <span>{children}</span>
    </Button>
  );
}

export default GoogleSigninBtn;
