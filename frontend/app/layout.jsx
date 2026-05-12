import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata = {
    title: "CineClub — for film lovers",
    description: "A platform for movie enthusiasts",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
        <body>
        <Navbar />
        <main className="main-content">
            {children}
        </main>
        <footer className="footer">
            <p>© 2026 CineClub. Made for film lovers.</p>
        </footer>
        </body>
        </html>
    );
}