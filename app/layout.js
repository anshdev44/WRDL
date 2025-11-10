import "./globals.css";
import SessionWrapper from "./sessionwrapper.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export const metadata = {
  title: "WRDL",
  description: "Game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
         <SessionWrapper>
        {children}
        </SessionWrapper>
        <ToastContainer/>
      </body>
    </html>
  );
}
