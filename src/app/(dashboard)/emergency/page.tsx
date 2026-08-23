import React from "react";
import Link from "next/link";

export const dynamic = "force-dynamic";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { ShieldAlert, Phone, AlertOctagon, QrCode, Heart, User, Hospital } from "lucide-react";
import { EmergencyLocationCard } from "@/components/emergency/EmergencyLocationCard";

export default async function EmergencyPage() {
  const user = await getCurrentUser();

  let emergencyData = {
    bloodGroup: "O+",
    emergencyNotes: "Severe peanut & milk protein anaphylaxis. Carries EpiPen Auto-Injector.",
    doctorName: "Dr. Elizabeth Vance",
    doctorPhone: "+1 (555) 019-2834",
    hospital: "St. Jude Medical Center",
    contacts: [
      { name: "John Connor", relationship: "Brother", phone: "+1 (555) 987-6543", isPrimary: true },
    ],
    allergies: ["Peanuts (Critical Anaphylaxis)", "Milk (Severe Protein Reaction)"],
  };

  if (user) {
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        emergencyProfile: true,
        emergencyContacts: true,
        allergies: true,
      },
    });

    if (fullUser) {
      if (fullUser.emergencyProfile) {
        emergencyData.bloodGroup = fullUser.emergencyProfile.bloodGroup || "O+";
        emergencyData.emergencyNotes = fullUser.emergencyProfile.emergencyNotes || "Carries EpiPen in bag.";
        emergencyData.doctorName = fullUser.emergencyProfile.doctorName || "Dr. Vance";
        emergencyData.doctorPhone = fullUser.emergencyProfile.doctorPhone || "+1 (555) 019-2834";
        emergencyData.hospital = fullUser.emergencyProfile.hospital || "City General Hospital";
      }
      if (fullUser.emergencyContacts.length > 0) {
        emergencyData.contacts = fullUser.emergencyContacts;
      }
      if (fullUser.allergies.length > 0) {
        emergencyData.allergies = fullUser.allergies.map((a) => `${a.allergenName} (${a.severity})`);
      }
    }
  }

  // Generate QR Code URL using QR Server API for digital ICE Medical Card
  const qrContent = encodeURIComponent(
    `ICE MEDICAL ID\nName: ${user?.fullName || "Sarah Connor"}\nBlood: ${emergencyData.bloodGroup}\nAllergies: ${emergencyData.allergies.join(", ")}\nDoctor: ${emergencyData.doctorName} (${emergencyData.doctorPhone})\nICE Contact: ${emergencyData.contacts[0]?.name || "ICE"} (${emergencyData.contacts[0]?.phone || "911"})`
  );
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrContent}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 pb-20 lg:pb-0">
      <Navbar user={user} />
      <OfflineIndicator />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-rose-500 flex items-center gap-2">
                <ShieldAlert className="h-7 w-7" />
                <span>ICE Medical Emergency & Hospital Finder</span>
              </h1>
              <p className="text-xs text-slate-400">
                Live GPS location tracking, nearby emergency hospitals, & digital Medical ID card with scannable QR.
              </p>
            </div>

            <a href="tel:911">
              <Button variant="danger" size="lg" className="gap-2 shadow-lg shadow-rose-600/30">
                <Phone className="h-5 w-5" />
                <span>Call Emergency (911)</span>
              </Button>
            </a>
          </div>

          {/* Anaphylaxis Protocol Card */}
          <Card className="border-rose-500/30 bg-rose-950/40 p-6 space-y-3">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertOctagon className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-extrabold uppercase">Anaphylaxis Protocol Notice</h3>
            </div>
            <p className="text-xs text-rose-200 leading-relaxed">
              If victim exhibits difficulty breathing, facial swelling, hives, or dizziness: <br />
              <strong>1. Administer EpiPen Auto-Injector immediately into outer mid-thigh.</strong> <br />
              2. Call Emergency Services (911 / 112) immediately. <br />
              3. Keep victim lying flat with feet elevated.
            </p>
          </Card>

          {/* Real Live GPS Location & Nearby Emergency Hospitals */}
          <EmergencyLocationCard />

          {/* Digital Medical ID Card with QR */}
          <Card className="border-slate-800 bg-slate-900/90 p-6 space-y-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 font-extrabold text-xl border border-rose-500/30">
                  {user?.fullName ? user.fullName[0] : "S"}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{user?.fullName || "Sarah Connor"}</h3>
                  <p className="text-xs text-slate-400">Blood Group: <strong className="text-rose-400">{emergencyData.bloodGroup}</strong></p>
                  <Badge variant="unsafe" className="mt-1">EpiPen Auto-Injector Carried</Badge>
                </div>
              </div>

              {/* Scannable QR Code */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-white text-slate-950 border border-slate-700 shadow-xl">
                <img src={qrImageUrl} alt="Digital ICE Medical QR Code" className="h-28 w-28 object-contain" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">Scan for Digital ICE Card</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 rounded-xl bg-slate-950 p-4 border border-slate-800">
                <p className="font-bold text-rose-400 uppercase tracking-wider">Critical Allergens:</p>
                <div className="space-y-1">
                  {emergencyData.allergies.map((alg, i) => (
                    <p key={i} className="font-semibold text-slate-200">⚠️ {alg}</p>
                  ))}
                </div>
              </div>

              <div className="space-y-2 rounded-xl bg-slate-950 p-4 border border-slate-800">
                <p className="font-bold text-emerald-400 uppercase tracking-wider">Primary Doctor & Hospital:</p>
                <p className="text-slate-200 font-semibold">{emergencyData.doctorName}</p>
                <p className="text-slate-400">{emergencyData.doctorPhone}</p>
                <p className="text-slate-400">{emergencyData.hospital}</p>
              </div>
            </div>

            {/* Emergency Contacts List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">In Case of Emergency (ICE) Contacts</h4>
              {emergencyData.contacts.map((contact, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <div>
                    <p className="text-xs font-bold text-white">{contact.name} ({contact.relationship})</p>
                    <p className="text-xs text-slate-400">{contact.phone}</p>
                  </div>
                  <a href={`tel:${contact.phone}`}>
                    <Button variant="secondary" size="sm" className="gap-1 text-xs">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Call Contact</span>
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
