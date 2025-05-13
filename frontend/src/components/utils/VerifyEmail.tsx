import axiosInstance from "@/api/client";
import { parseJwt } from "@/lib/jwt";
import { useLocation, useNavigate } from "react-router";
import { use, useMemo, useEffect } from "react";

function VerifyEmail() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(search);
  const token = query.get("token");

  useEffect(() => {
    if (!token) navigate(-1);
  }, [token, navigate]);

  const verificationPromise = useMemo(() => {
    if (!token) return Promise.resolve({ success: false });
    return verifyEmail(token);
  }, [token]);

  const result = use(verificationPromise);

  if (!token) return null; 

  return (
    <section className="min-h-screen">
      {result.success ? "Email verified successfully! 🎉" : "Verification failed."}
    </section>
  );
}

async function verifyEmail(token: string) {
  const { role } = parseJwt(token);
  const response = await axiosInstance.post("/auth/verify-email", { token, role });
  return response.data;
}

export default VerifyEmail;