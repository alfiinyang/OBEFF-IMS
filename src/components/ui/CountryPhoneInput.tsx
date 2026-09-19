'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Phone } from 'lucide-react';

export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
}

export const COUNTRIES: CountryInfo[] = [
  { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Ghana', code: '+233', flag: '🇬🇭' },
  { name: 'South Africa', code: '+27', flag: '🇿🇦' },
  { name: 'Kenya', code: '+254', flag: '🇰🇪' },
  { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
  { name: 'Cote d\'Ivoire', code: '+225', flag: '🇨🇮' },
  { name: 'Sierra Leone', code: '+232', flag: '🇸🇱' },
  { name: 'Liberia', code: '+231', flag: '🇱🇷' },
  { name: 'Rwanda', code: '+250', flag: '🇷🇼' },
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Ireland', code: '+353', flag: '🇮🇪' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Italy', code: '+39', flag: '🇮🇹' },
  { name: 'Spain', code: '+34', flag: '🇪🇸' },
  { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
  { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
  { name: 'India', code: '+91', flag: '🇮🇳' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'China', code: '+86', flag: '🇨🇳' },
];

interface CountryPhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  required?: boolean;
}

export default function CountryPhoneInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  required = false,
}: CountryPhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.includes(searchTerm)
  );

  return (
    <div className="grid grid-cols-12 gap-2" ref={dropdownRef}>
      {/* 1. Country Code Dropdown / Type Selector (4 cols on mobile, 4-5 cols on desktop) */}
      <div className="col-span-5 sm:col-span-4 relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-xs font-semibold text-slate-800"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center gap-1.5 truncate">
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span>{selectedCountry.code}</span>
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        </button>

        {/* Dropdown Menu with Search Input */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in duration-150">
            {/* Search Box */}
            <div className="p-2 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search country or code (e.g. Nigeria or +234)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            {/* List */}
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-50 p-1">
              {filteredCountries.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No matching countries found.
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={`${country.name}-${country.code}`}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange(country.code);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl transition text-left ${
                      country.code === countryCode
                        ? 'bg-emerald-50 text-emerald-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <span className="text-base">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-semibold ml-2">
                      {country.code}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Separate Local Phone Number Input (7-8 cols) */}
      <div className="col-span-7 sm:col-span-8 relative">
        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="tel"
          required={required}
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder="803 123 4567"
          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
        />
      </div>
    </div>
  );
}
