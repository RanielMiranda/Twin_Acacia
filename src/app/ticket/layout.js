import TopBar from "../(main)/layout/TopBar";
import { Analytics } from "@vercel/analytics/react";

export default function TicketLayout({ children }) {

  return (
    <>
      <TopBar />
      <main className="mt-10 bg-slate-100">{children}</main>
      <Analytics />
    </>
  );
}
