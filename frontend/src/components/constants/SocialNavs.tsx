import {
  FaLinkedin,
  FaPinterest,
  FaSquareInstagram,
  FaXTwitter,
  FaFacebook,
} from "react-icons/fa6";

export const socialNavs = [
  {
    icon: <FaXTwitter size={24} />,
    name: "Twitter",
    url: "https://www.x.com/goldengoshenedu",
  },
  {
    icon: <FaSquareInstagram size={24} />,
    name: "Instagram",
    url: "http://www.instagram.com/goldengosheneducation",
  },
  {
    icon: <FaPinterest size={24} />,
    name: "Pinterest",
    url: "https://www.linkedin.com/company/goldengosheneducationalconsultancy",
  },
  {
    icon: <FaLinkedin size={24} />,
    name: "LinkedIn",
    url: "https://www.linkedin.com/company/goldengosheneducationalconsultancy",
  },
  {
    icon: <FaFacebook size={24} />,
    name: "Facebook",
    url: "https://www.facebook.com/goldengosheneducationalconsultancy",
  },
] as const;
