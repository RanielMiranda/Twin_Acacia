"use client";

import { useCallback } from "react";
import { toPng } from "html-to-image";

export function useTicketImageActions({ booking, toast }) {
  const getTicketImageDataUrl = useCallback(async () => {
    const el = document.getElementById("ticket-stay-card");
    if (!el) return null;
    return toPng(el, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#ffffff",
      style: { borderRadius: "1.5rem" },
    });
  }, []);

  const downloadTicket = useCallback(async () => {
    if (!booking) return;
    try {
      const dataUrl = await getTicketImageDataUrl();
      if (!dataUrl) return;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ticket-${booking.id}.png`;
      link.click();
    } catch (err) {
      toast({ message: `Download failed: ${err?.message || "Unknown error"}`, color: "red" });
    }
  }, [booking, getTicketImageDataUrl, toast]);

  return {
    downloadTicket,
  };
}
