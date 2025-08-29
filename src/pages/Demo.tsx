// src/pages/Demo.tsx
import { useEffect, useState } from "react";
import { requestOtp, submitOtp, getBalance, getProfile, tokenStore } from "../lib/api";

export default function Demo() {
  const [phone, setPhone] = useState("6287xxxxxxxx");
  const [code, setCode] = useState("");
  const [out, setOut] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    tokenStore.get(); // load dari localStorage jika ada
  }, []);

  async function run<T>(fn: () => Promise<T>) {
    setStatus("Loading...");
    try {
      const r = await fn();
      setOut(r);
      setStatus("OK");
    } catch (e: any) {
      setOut({ error: e?.message || String(e) });
      setStatus("Error");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "24px auto", fontFamily: "Inter, system-ui, sans-serif", padding: 16 }}>
      <h2 style={{ marginBottom: 8 }}>myXL Bridge Demo</h2>
      <p style={{ color: "#666", marginTop: 0 }}>
        Backend: <code>{import.meta.env.VITE_API_BASE}</code>
      </p>

      <div style={{ display: "grid", gap: 8 }}>
        <label>
          Nomor (628…)
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="6287xxxxxxxx"
            style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => run(() => requestOtp(phone))}>Request OTP</button>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="OTP 6 digit"
            style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #ddd" }}
          />
          <button onClick={() => run(() => submitOtp(phone, code))}>Submit OTP</button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => run(() => getBalance())}>Get Balance</button>
          <button onClick={() => run(() => getProfile())}>Get Profile</button>
          <button onClick={() => { tokenStore.clear(); setOut(null); setStatus("Logged out"); }}>Logout</button>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <b>Status:</b> {status || "-"}
      </div>

      <pre style={{
        background: "#0b0b0f", color: "#bbe67e", padding: 12, marginTop: 12,
        minHeight: 160, overflow: "auto", borderRadius: 8, border: "1px solid #222"
      }}>
        {out ? JSON.stringify(out, null, 2) : "No output"}
      </pre>

      <p style={{ color: "#888", fontSize: 12 }}>
        Tips: token otomatis di-refresh saat 401. Jika tetap gagal, minta OTP ulang.
      </p>
    </div>
  );
}
