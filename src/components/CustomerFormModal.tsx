import React, { useState, useEffect } from 'react';
import { Customer, CustomerStatus, PreferredContactMethod } from '../types';

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customerToEdit?: Customer | null;
  existingCount: number;
}

export const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  customerToEdit,
  existingCount
}) => {
  const [customerId, setCustomerId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dateRegistered, setDateRegistered] = useState('');
  const [status, setStatus] = useState<CustomerStatus>('Active');
  const [preferredContactMethod, setPreferredContactMethod] = useState<PreferredContactMethod>('WhatsApp');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (customerToEdit) {
      setCustomerId(customerToEdit.id);
      setFullName(customerToEdit.fullName);
      setPhoneNumber(customerToEdit.phoneNumber);
      setWhatsappNumber(customerToEdit.whatsappNumber);
      setSameAsPhone(customerToEdit.phoneNumber === customerToEdit.whatsappNumber);
      setEmail(customerToEdit.email || '');
      setAddress(customerToEdit.address || '');
      setDateRegistered(customerToEdit.dateRegistered);
      setStatus(customerToEdit.status);
      setPreferredContactMethod(customerToEdit.preferredContactMethod || 'WhatsApp');
      setNotes(customerToEdit.notes || '');
    } else {
      // Auto-generate Customer ID e.g. CUST-1001, CUST-1002
      const nextNum = 1001 + existingCount;
      setCustomerId(`CUST-${nextNum}`);
      setFullName('');
      setPhoneNumber('');
      setWhatsappNumber('');
      setSameAsPhone(true);
      setEmail('');
      setAddress('');
      
      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      setDateRegistered(formattedDate);
      setStatus('Active');
      setPreferredContactMethod('WhatsApp');
      setNotes('');
    }
    setErrors({});
  }, [customerToEdit, isOpen, existingCount]);

  if (!isOpen) return null;

  const handlePhoneChange = (val: string) => {
    setPhoneNumber(val);
    if (sameAsPhone) {
      setWhatsappNumber(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const finalWhatsapp = sameAsPhone ? phoneNumber : (whatsappNumber || phoneNumber);

    const customerData: Customer = {
      id: customerId.trim() || `CUST-${1001 + existingCount}`,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      whatsappNumber: finalWhatsapp.trim(),
      email: email.trim(),
      address: address.trim(),
      dateRegistered: dateRegistered.trim() || new Date().toLocaleDateString('en-GB'),
      status,
      notes: notes.trim(),
      preferredContactMethod
    };

    onSave(customerData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-xl border border-outline-variant/30 my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[1.25rem]">person_add</span>
            </div>
            <div>
              <h2 className="font-title-md font-semibold text-on-surface">
                {customerToEdit ? 'Edit Customer Profile' : 'Add New Customer'}
              </h2>
              <p className="text-xs text-on-surface-variant">Faith Fragrance Customer Directory</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[1.25rem]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer ID & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Customer ID
              </label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="e.g. CUST-1001"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface font-mono font-semibold text-xs border border-outline-variant/20 uppercase"
                required
              />
              <span className="text-[0.6875rem] text-on-surface-variant">Unique boutique identifier</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Customer Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('Active')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'Active'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                  <span>Active</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('Inactive')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    status === 'Inactive'
                      ? 'bg-slate-600 text-white shadow-xs'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span>Inactive</span>
                </button>
              </div>
              <span className="text-[0.6875rem] text-on-surface-variant">Active clients receive promotions</span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
              }}
              placeholder="e.g. Sarah K. Johnson"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border ${
                errors.fullName ? 'border-error focus:ring-error' : 'border-outline-variant/20 focus:ring-primary'
              } focus:outline-none focus:ring-2`}
              required
            />
            {errors.fullName && (
              <span className="text-xs text-error">{errors.fullName}</span>
            )}
          </div>

          {/* Phone & WhatsApp Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  handlePhoneChange(e.target.value);
                  if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
                }}
                placeholder="e.g. +237 690 123 456"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm font-mono border ${
                  errors.phoneNumber ? 'border-error focus:ring-error' : 'border-outline-variant/20 focus:ring-primary'
                } focus:outline-none focus:ring-2`}
                required
              />
              {errors.phoneNumber && (
                <span className="text-xs text-error">{errors.phoneNumber}</span>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-on-surface">
                  WhatsApp Number
                </label>
                <label className="flex items-center gap-1.5 text-[0.6875rem] text-primary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsPhone}
                    onChange={(e) => {
                      setSameAsPhone(e.target.checked);
                      if (e.target.checked) setWhatsappNumber(phoneNumber);
                    }}
                    className="rounded border-outline-variant text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  <span>Same as phone</span>
                </label>
              </div>
              <input
                type="tel"
                value={sameAsPhone ? phoneNumber : whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                disabled={sameAsPhone}
                placeholder="e.g. +237 670 987 654"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm font-mono border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              <span className="text-[0.6875rem] text-on-surface-variant">Used for direct WhatsApp chat &amp; order updates</span>
            </div>
          </div>

          {/* Email & Preferred Contact Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. sarah@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Preferred Contact Method
              </label>
              <select
                value={preferredContactMethod}
                onChange={(e) => setPreferredContactMethod(e.target.value as PreferredContactMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="WhatsApp">WhatsApp (Recommended)</option>
                <option value="Phone Call">Phone Call</option>
                <option value="SMS">SMS Text</option>
                <option value="Email">Email</option>
              </select>
              <span className="text-[0.6875rem] text-on-surface-variant">Client preferred communication channel</span>
            </div>
          </div>

          {/* Address / Location & Date Registered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Address / Location
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Bastos, Yaoundé or Bonapriso, Douala"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-[0.6875rem] text-on-surface-variant">Delivery location or residential quarter</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-on-surface">
                Date Registered
              </label>
              <input
                type="text"
                value={dateRegistered}
                onChange={(e) => setDateRegistered(e.target.value)}
                placeholder="e.g. 25 Sept 2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-sm border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-[0.6875rem] text-on-surface-variant">Membership anniversary</span>
            </div>
          </div>

          {/* Notes & Fragrance Preferences */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-on-surface">
              Notes &amp; Scent Preferences (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Loves warm oud & floral notes; sensitive to strong citrus; VIP collector; birthday in November."
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low text-on-surface text-xs border border-outline-variant/20 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
            <span className="text-[0.6875rem] text-on-surface-variant">
              Personalized notes to deliver world-class boutique service.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span className="material-symbols-outlined text-[1.125rem]">save</span>
              <span>{customerToEdit ? 'Update Customer' : 'Save to Database'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
