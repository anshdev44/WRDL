import "./globals.css";
import SessionWrapper from "./sessionwrapper.js";

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
      </body>
    </html>
  );
}
