"use client";

import { useState } from "react";
import StoreFrame from "@/components/StoreFrame";
import PageIntro from "@/components/PageIntro";

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setNotice("Live order lookup is not connected yet. No tracking search was performed. Your details have not been sent or saved.");
  }

  return (
    <StoreFrame>
      <main className="nw-page nw-track-page">
        <PageIntro eyebrow="A LITTLE UPDATE ON THE WAY" title={<>Where is it?<br />Let's find out.</>} description="When your order ships, this is where you will be able to check its progress." />
        <form className="nw-track-form" onSubmit={handleSubmit}>
          <div className="nw-notice"><strong>Tracking preview</strong><span>Order lookup is not connected yet. Do not enter personal order information here.</span></div>
          <label>Order number<input value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="e.g. NW-000123" required /></label>
          <label>Email used at checkout<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
          <button type="submit" className="nw-primary-link nw-primary-link--wide">Check order status <span>↗</span></button>
          {notice && <p className="nw-form-notice" role="status">{notice}</p>}
        </form>
      </main>
    </StoreFrame>
  );
}
