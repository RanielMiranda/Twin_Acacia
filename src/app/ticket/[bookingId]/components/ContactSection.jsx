"use client";

import React, { useState } from "react";
import { Phone, Mail, FileText, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AccordionCard } from "@/components/ui/AccordionCard";

const ContactSection = React.memo(function ContactSection({ resort }) {
  const [openRules, setOpenRules] = useState(false);
  const [openTerms, setOpenTerms] = useState(false);

  if (!resort) return null;

  const phone = resort.contactPhone || resort.contact_phone;
  const email = resort.contactEmail || resort.contact_email;
  const rules = resort.rulesAndRegulations || resort.rules_and_regulations;
  const terms = resort.termsAndConditions || resort.terms_and_conditions;

  return (
    <Card className="p-6 md:p-8 border border-slate-100 bg-white shadow-sm rounded-2xl">
      {/* Contact Info Header */}
      <div className="mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
          <Phone size={18} className="text-blue-600" /> Contact Information
        </h3>
        <div className="mt-3 flex flex-col sm:flex-row gap-4 text-sm">
          {phone ? (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors font-medium">
              <Phone size={16} className="text-slate-400" />
              {phone}
            </a>
          ) : (
            <span className="flex items-center gap-2 text-slate-400">No phone number</span>
          )}
          {email ? (
            <a href={`mailto:${email}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors font-medium">
              <Mail size={16} className="text-slate-400" />
              {email}
            </a>
          ) : (
            <span className="flex items-center gap-2 text-slate-400">No email address</span>
          )}
        </div>
      </div>

      {/* Policies Accordions */}
      <div className="space-y-4">
        {rules ? (
          <AccordionCard
            title="Rules and Regulations"
            open={openRules}
            onToggle={() => setOpenRules((prev) => !prev)}
          >
            <div className="text-sm text-slate-600 whitespace-pre-line">{rules}</div>
          </AccordionCard>
        ) : (
          <div className="text-sm text-slate-400 italic">No rules and regulations added yet.</div>
        )}
        {terms ? (
          <AccordionCard
            title="Terms and Conditions"
            open={openTerms}
            onToggle={() => setOpenTerms((prev) => !prev)}
          >
            <div className="text-sm text-slate-600 whitespace-pre-line">{terms}</div>
          </AccordionCard>
        ) : (
          <div className="text-sm text-slate-400 italic">No terms and conditions added yet.</div>
        )}
      </div>
    </Card>
  );
});

export { ContactSection };
