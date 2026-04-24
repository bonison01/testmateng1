/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { type FormData, type TeamMember, type CompetitionKey, COMPETITION_LABELS, COMPETITION_FEES, COMPETITION_DATES, COMPETITION_ELIGIBILITY, calculateTotalFee, API_BASE } from './type';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    formData: FormData;
    setFormData: React.Dispatch<React.SetStateAction<FormData>>;
    onNext: (registrationId: number) => void;
}

const COMPETITIONS: CompetitionKey[] = ['painting', 'quiz', 'mathematics', 'young_innovator'];

const COMPETITION_ICONS: Record<CompetitionKey, string> = {
    painting: '🎨',
    quiz: '🧠',
    mathematics: '🧮',
    young_innovator: '🚀',
};

const CLASS_OPTIONS = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11', 'Class 12',
];

const INPUT_CLASS = "w-full !bg-white/5 border !border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400/80 focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all text-sm";
const LABEL_CLASS = "block text-sm font-mono text-gray-200 uppercase tracking-widest mb-2";
const DISABLED_INPUT_CLASS = "w-full !bg-white/5 border !border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed";

export default function Step1Details({ formData, setFormData, onNext }: Props) {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [lookingUp, setLookingUp] = useState(false);
    const [existingReg, setExistingReg] = useState<any>(null);
    const [isExistingMode, setIsExistingMode] = useState(false);

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [sigPreview, setSigPreview] = useState<string | null>(null);

    const [hasPassportPhoto, setHasPassportPhoto] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);

    const [phoneTouched, setPhoneTouched] = useState(false);
    const [phoneValid, setPhoneValid] = useState(false);
    const [emailValid, setEmailValid] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);

    const photoRef = useRef<HTMLInputElement>(null);
    const sigRef = useRef<HTMLInputElement>(null);
    const phoneDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const emailDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // const isFormDisabled = !!existingReg; // Disable all fields when existing registration is found
    const isFormDisabled = false; // Allow editing all fields, but only show warning when existing registration is detected

    const update = (field: keyof FormData, value: any) => {
        if (isFormDisabled) return; // Prevent updates if form is disabled
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
        }
    };

    const prefillFormFromExisting = (reg: any) => {
        setIsExistingMode(true);
        setExistingReg(reg);

        const normalizedCategories: CompetitionKey[] = Array.isArray(reg.competition_category)
            ? reg.competition_category
            : reg.competition_category ? [reg.competition_category as CompetitionKey] : [];

        const passportDoc = reg.documents?.find((d: any) => d.document_type === 'passport_photo');
        const sigDoc = reg.documents?.find((d: any) => d.document_type === 'candidate_signature');

        setHasPassportPhoto(!!passportDoc);
        setHasSignature(!!sigDoc);

        setPhotoPreview(passportDoc?.s3_url || null);
        setSigPreview(sigDoc?.s3_url || null);

        setFormData(prev => ({
            ...prev,
            full_name: reg.full_name || prev.full_name,
            dob: reg.dob || prev.dob,
            student_class: reg.student_class || prev.student_class,
            institution_name: reg.institution_name || prev.institution_name,
            contact_number: reg.contact_number || prev.contact_number,
            gender: reg.gender || prev.gender,
            email: reg.email || prev.email,
            alternate_contact_number: reg.alternate_contact_number || prev.alternate_contact_number,
            address: reg.address || prev.address,
            father_name: reg.father_name || prev.father_name,
            father_occupation: reg.father_occupation || prev.father_occupation,
            competition_category: normalizedCategories.length > 0 ? normalizedCategories : prev.competition_category,
            participation_type: reg.participation_type || prev.participation_type,
            team_members: reg.team_members
                ? reg.team_members.map((m: any) => ({
                    name: m.name || '',
                    student_class: m.student_class || '',
                    dob: m.dob || '',
                    institution_name: m.institute || m.institution_name || '',
                }))
                : prev.team_members,
            passport_photo: null,
            candidate_signature: null,
        }));
    };

    const resetExistingState = () => {
        setExistingReg(null);
        setIsExistingMode(false);
        setHasPassportPhoto(false);
        setHasSignature(false);
        setPhotoPreview(null);
        setSigPreview(null);
    };

    const handleLookup = async (overrides: { contact_number?: string; email?: string }) => {
        const contact_number = overrides.contact_number ?? formData.contact_number;
        const email = overrides.email ?? formData.email;

        const phoneOk = /^[6-9]\d{9}$/.test(contact_number);
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (!phoneOk && !emailOk) return;

        setLookingUp(true);

        try {
            const body = {
                contact_number: phoneOk ? contact_number : null,
                email: emailOk ? email : null,
            };

            const res = await fetch(`${API_BASE}/edu-fest/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.exists && data.registration) {
                prefillFormFromExisting(data.registration);
            } else {
                resetExistingState();
            }
        } catch {
            resetExistingState();
        } finally {
            setLookingUp(false);
        }
    };

    const handlePhoneChange = (value: string) => {
        if (isFormDisabled) return;
        const digits = value.replace(/\D/g, '').slice(0, 10);
        setPhoneTouched(true);
        update('contact_number', digits);

        if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);

        if (digits.length === 10 && /^[6-9]\d{9}$/.test(digits)) {
            setPhoneValid(true);
            phoneDebounceRef.current = setTimeout(() => handleLookup({ contact_number: digits }), 500);
        } else {
            setPhoneValid(false);
            resetExistingState();
        }
    };

    const handleEmailChange = (value: string) => {
        if (isFormDisabled) return;
        setEmailTouched(true);
        update('email', value);

        if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);

        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setEmailValid(true);
            emailDebounceRef.current = setTimeout(() => handleLookup({ email: value }), 600);
        } else {
            setEmailValid(false);
        }
    };

    const toggleCompetition = (key: CompetitionKey) => {
        if (isFormDisabled) return;
        setFormData(prev => {
            const next = prev.competition_category.includes(key)
                ? prev.competition_category.filter(c => c !== key)
                : [...prev.competition_category, key];

            const hasTeam = next.includes('quiz') || next.includes('young_innovator');

            return {
                ...prev,
                competition_category: next,
                participation_type: hasTeam ? prev.participation_type : 'individual',
                team_members: hasTeam ? prev.team_members : [],
                team_size: hasTeam ? prev.team_size : null,
            };
        });
    };

    const hasTeamEvent = formData.competition_category.includes('quiz') || formData.competition_category.includes('young_innovator');

    const MAX_ADDITIONAL_MEMBERS = 2;

    const addTeamMember = () => {
        if (isFormDisabled || formData.team_members.length >= MAX_ADDITIONAL_MEMBERS) return;
        setFormData(prev => ({
            ...prev,
            team_members: [...prev.team_members, { name: '', student_class: '', dob: '', institution_name: '' }],
            team_size: prev.team_members.length + 2,
        }));
    };

    const updateTeamMember = (i: number, field: keyof TeamMember, val: string) => {
        if (isFormDisabled) return;
        setFormData(prev => {
            const members = [...prev.team_members];
            members[i] = { ...members[i], [field]: val };
            return { ...prev, team_members: members };
        });
    };

    const removeTeamMember = (i: number) => {
        if (isFormDisabled) return;
        setFormData(prev => ({
            ...prev,
            team_members: prev.team_members.filter((_, idx) => idx !== i),
            team_size: prev.team_members.length,
        }));
    };

    const handleFileChange = (type: 'photo' | 'sig', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            if (type === 'photo') setPhotoPreview(ev.target?.result as string);
            else setSigPreview(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        update(type === 'photo' ? 'passport_photo' : 'candidate_signature', file);
    };

    const validate = () => {
        const e: Record<string, string> = {};

        if (!formData.full_name?.trim()) e.full_name = 'Required';
        if (!formData.dob) e.dob = 'Required';
        if (!formData.student_class) e.student_class = 'Required';
        if (!formData.institution_name?.trim()) e.institution_name = 'Required';
        if (!formData.contact_number || formData.contact_number.length !== 10) e.contact_number = 'Enter valid 10-digit number';
        if (!formData.gender) e.gender = 'Required';
        if (!formData.address?.trim()) e.address = 'Required';
        if (!formData.father_name?.trim()) e.father_name = 'Required';
        if (!formData.father_occupation?.trim()) e.father_occupation = 'Required';
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter valid email';

        if (formData.competition_category.length === 0) e.competition_category = 'Select at least one competition';

        // Only require documents that are NOT already uploaded
        if (!hasPassportPhoto && !formData.passport_photo) e.passport_photo = 'Passport photo required';
        if (!hasSignature && !formData.candidate_signature) e.candidate_signature = 'Signature required';

        if (formData.participation_type === 'team' && formData.team_members.length === 0) {
            e.team_members = 'Add at least one team member';
        }

        return e;
    };

    const uploadDocuments = async (regId: number) => {
        const uploads: Array<{ file: File; type: string }> = [];

        if (formData.passport_photo) uploads.push({ file: formData.passport_photo, type: 'passport_photo' });
        if (formData.candidate_signature) uploads.push({ file: formData.candidate_signature, type: 'candidate_signature' });

        for (const { file, type } of uploads) {
            const fd = new FormData();
            fd.append('document_type', type);
            fd.append('file', file);
            try {
                await fetch(`${API_BASE}/edu-fest/${regId}/documents`, { method: 'POST', body: fd });
            } catch (err) {
                console.error(`Upload failed for ${type}`, err);
            }
        }
    };

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            const firstKey = Object.keys(errs)[0];
            document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        setLoading(true);

        try {
            let regId: number;

            if (existingReg) {
                regId = existingReg.id;
            } else {
                const payload: any = {
                    full_name: formData.full_name,
                    dob: formData.dob,
                    student_class: formData.student_class,
                    institution_name: formData.institution_name,
                    contact_number: formData.contact_number,
                    gender: formData.gender,
                    email: formData.email,
                    alternate_contact_number: formData.alternate_contact_number || null,
                    address: formData.address,
                    father_name: formData.father_name,
                    father_occupation: formData.father_occupation,
                    competition_category: formData.competition_category,
                    participation_type: hasTeamEvent ? formData.participation_type : 'individual',
                };

                if (formData.participation_type === 'team' && hasTeamEvent) {
                    payload.team_size = formData.team_members.length + 1;
                    payload.team_members = formData.team_members.map((m: TeamMember) => ({
                        name: m.name,
                        dob: m.dob,
                        student_class: m.student_class,
                        institute: m.institution_name,
                    }));
                }

                // console.log('Submitting payload:', payload);

                const res = await fetch(`${API_BASE}/edu-fest`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error('Registration failed');
                const reg = await res.json();
                regId = reg.id;
            }

            await uploadDocuments(regId);

            const bothDocumentsUploaded = (hasPassportPhoto || !!formData.passport_photo) &&
                (hasSignature || !!formData.candidate_signature);

            // If both documents are present → Registration is considered completed
            if (bothDocumentsUploaded) {
                onNext(regId); // You can route to completion page or show success
            } else {
                onNext(regId);
            }

        } catch {
            setErrors({ submit: 'Network error. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const totalFee = calculateTotalFee(formData.competition_category, formData.participation_type, null);

    const bothDocsReady = (hasPassportPhoto || !!formData.passport_photo) &&
        (hasSignature || !!formData.candidate_signature);

    const registrationCompleted = hasPassportPhoto && hasSignature;

    useEffect(() => {
        return () => {
            if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
            if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
        };
    }, []);

    return (
        <div className="space-y-8">
            {/* Existing Registration Notice */}
            {existingReg && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <span className="text-amber-400 text-lg">⚠️</span>
                        <div>
                            <p className="text-amber-400 font-semibold text-sm">Existing Registration Found</p>
                            <p className="text-white/60 text-sm mt-1">
                                A registration already exists. You can only upload missing documents.
                            </p>
                            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                <div><span className="text-gray-400">Name:</span> <span className="text-white">{existingReg.full_name}</span></div>
                                <div>
                                    <span className="text-gray-400">Category:</span>{' '}
                                    <span className="text-emerald-400 capitalize">
                                        {Array.isArray(existingReg.competition_category)
                                            ? existingReg.competition_category.join(', ')
                                            : existingReg.competition_category}
                                    </span>
                                </div>
                                <div><span className="text-gray-400">Email:</span> <span className="text-white">{existingReg.email}</span></div>
                                <div><span className="text-gray-400">ID:</span> <span className="text-white">MEF-{String(existingReg.id).padStart(6, '0')}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Personal Details */}
            <Section title="Personal Details" icon="👤">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field id="full_name" label="Full Name" error={errors.full_name}>
                        <input
                            id="full_name"
                            className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS}
                            placeholder="Enter full name"
                            value={formData.full_name}
                            onChange={e => update('full_name', e.target.value)}
                            disabled={isFormDisabled}
                        />
                    </Field>

                    <Field id="dob" label="Date of Birth" error={errors.dob}>
                        <input
                            id="dob"
                            type="date"
                            className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS + ' [color-scheme:dark]'}
                            value={formData.dob}
                            onChange={e => update('dob', e.target.value)}
                            disabled={isFormDisabled}
                        />
                    </Field>

                    <Field id="gender" label="Gender" error={errors.gender}>
                        <Select value={formData.gender} onValueChange={v => update('gender', v)} disabled={isFormDisabled}>
                            <SelectTrigger className={`${isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS} flex items-center justify-between !h-11`}>
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f172a] border border-white/10 text-white">
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field id="email" label="Email Address" error={errors.email}>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS + (emailTouched && emailValid ? ' pr-10' : '')}
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={e => handleEmailChange(e.target.value)}
                                disabled={isFormDisabled}
                            />
                            {emailTouched && emailValid && !isFormDisabled && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">✓</span>}
                        </div>
                    </Field>

                    <Field id="contact_number" label="Contact Number" error={errors.contact_number}>
                        <div className="relative">
                            <input
                                id="contact_number"
                                className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS + (phoneTouched && phoneValid ? ' pr-10' : '')}
                                placeholder="10-digit mobile number"
                                maxLength={10}
                                value={formData.contact_number}
                                onChange={e => handlePhoneChange(e.target.value)}
                                disabled={isFormDisabled}
                            />
                            {phoneTouched && phoneValid && !isFormDisabled && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">✓</span>}
                            {lookingUp && phoneTouched && !isFormDisabled && (
                                <span className="absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                            )}
                        </div>
                    </Field>

                    <Field id="alternate_contact_number" label="Alternate Contact (Optional)">
                        <input
                            className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS}
                            placeholder="Alternate number"
                            maxLength={10}
                            value={formData.alternate_contact_number}
                            onChange={e => update('alternate_contact_number', e.target.value.replace(/\D/g, '').slice(0, 10))}
                            disabled={isFormDisabled}
                        />
                    </Field>

                    <Field id="student_class" label="Class / Grade" error={errors.student_class}>
                        <Select value={formData.student_class} onValueChange={v => update('student_class', v)} disabled={isFormDisabled}>
                            <SelectTrigger className={`${isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS} flex items-center justify-between !h-11`}>
                                <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f172a] border border-white/10 text-white max-h-60 overflow-y-auto">
                                {CLASS_OPTIONS.map(cls => (
                                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>

                    <Field id="institution_name" label="Institution Name" error={errors.institution_name}>
                        <input
                            id="institution_name"
                            className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS}
                            placeholder="School / College name"
                            value={formData.institution_name}
                            onChange={e => update('institution_name', e.target.value)}
                            disabled={isFormDisabled}
                        />
                    </Field>
                </div>

                <Field id="address" label="Address" error={errors.address}>
                    <textarea
                        id="address"
                        className={isFormDisabled ? DISABLED_INPUT_CLASS + ' resize-none h-20' : INPUT_CLASS + ' resize-none h-20'}
                        placeholder="Full address"
                        value={formData.address}
                        onChange={e => update('address', e.target.value)}
                        disabled={isFormDisabled}
                    />
                </Field>
            </Section>

            {/* Parent Info */}
            <Section title="Parent / Guardian" icon="👨‍👩‍👧">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Field id="father_name" label="Father's Name" error={errors.father_name}>
                        <input
                            id="father_name"
                            className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS}
                            placeholder="Father's full name"
                            value={formData.father_name}
                            onChange={e => update('father_name', e.target.value)}
                            disabled={isFormDisabled}
                        />
                    </Field>

                    <Field id="father_occupation" label="Father's Occupation" error={errors.father_occupation}>
                        <input
                            id="father_occupation"
                            className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS}
                            placeholder="Occupation"
                            value={formData.father_occupation}
                            onChange={e => update('father_occupation', e.target.value)}
                            disabled={isFormDisabled}
                        />
                    </Field>
                </div>
            </Section>

            {/* Competition Selection */}
            <Section
                title="Select Competitions"
                icon="🏆"
                subtitle="Registration fee is fixed per competition (no extra charge per team member)"
            >
                {errors.competition_category && (
                    <p className="text-red-400 text-sm mb-4">{errors.competition_category}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {COMPETITIONS.map(key => {
                        const selected = formData.competition_category.includes(key);
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => toggleCompetition(key)}
                                disabled={isFormDisabled}
                                className={`relative p-4 rounded-2xl border text-left transition-all duration-200 ${selected
                                        ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
                                        : 'bg-white/3 border-white/8 hover:border-white/20 hover:bg-white/5'
                                    } ${isFormDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{COMPETITION_ICONS[key]}</span>
                                        <div>
                                            <p className={`text-sm font-semibold ${selected ? 'text-emerald-300' : 'text-white'}`}>
                                                {COMPETITION_LABELS[key]}
                                            </p>
                                            <p className="text-white/30 text-sm">
                                                {COMPETITION_ELIGIBILITY[key]} · {COMPETITION_DATES[key]}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selected ? 'bg-emerald-500 border-emerald-500' : 'border-white/20'
                                        }`}>
                                        {selected && <span className="text-black text-sm font-bold">✓</span>}
                                    </div>
                                </div>
                                <div className={`mt-3 text-sm font-mono font-bold ${selected ? 'text-emerald-400' : 'text-white/30'}`}>
                                    ₹{COMPETITION_FEES[key]}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {formData.competition_category.length > 0 && (
                    <div className="mt-4 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/40 font-mono uppercase tracking-wide">Estimated Total</p>
                            <p className="text-white/60 text-sm mt-0.5">
                                {formData.competition_category.map(c => COMPETITION_LABELS[c]).join(' + ')}
                            </p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400 font-mono">₹{totalFee}</p>
                    </div>
                )}
            </Section>

            {/* Participation Type & Team Members */}
            {hasTeamEvent && (
                <Section title="Participation Type" icon="👥">
                    <div className="flex gap-3 mb-6">
                        {(['individual', 'team'] as const).map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => {
                                    if (!isFormDisabled) {
                                        update('participation_type', type);
                                        if (type === 'individual') {
                                            update('team_members', []);
                                            update('team_size', null);
                                        }
                                    }
                                }}
                                disabled={isFormDisabled}
                                className={`flex-1 py-3 rounded-xl border text-sm font-semibold capitalize transition-all ${formData.participation_type === type
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                        : 'bg-white/20 border-white/10 text-white/40 hover:text-white/60'
                                    } ${isFormDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {formData.participation_type === 'team' && (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <p className="text-sm text-gray-400 font-mono font-semibold uppercase tracking-wide">
                                    Team Members (up to {MAX_ADDITIONAL_MEMBERS} additional · {MAX_ADDITIONAL_MEMBERS + 1} total)
                                </p>
                                {formData.team_members.length < MAX_ADDITIONAL_MEMBERS && !isFormDisabled && (
                                    <button
                                        type="button"
                                        onClick={addTeamMember}
                                        className="flex items-center gap-1 text-sm text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 rounded-lg px-3 py-1.5 hover:bg-emerald-500/10 transition-all"
                                    >
                                        <span>+</span> Add Member
                                    </button>
                                )}
                            </div>

                            {errors.team_members && <p className="text-red-400 text-sm">{errors.team_members}</p>}

                            {formData.team_members.map((member, i) => (
                                <div key={i} className="relative p-4 rounded-2xl bg-white/3 border border-white/8">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-mono text-emerald-400 uppercase tracking-wide">
                                            Member {i + 2}
                                        </p>
                                        {!isFormDisabled && (
                                            <button
                                                type="button"
                                                onClick={() => removeTeamMember(i)}
                                                className="text-red-400/80 hover:text-red-400 text-sm border border-red-500/20 rounded-lg px-2 py-1 transition-all"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Field label="Full Name">
                                            <input
                                                className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS}
                                                placeholder="Member's name"
                                                value={member.name}
                                                onChange={e => updateTeamMember(i, 'name', e.target.value)}
                                                disabled={isFormDisabled}
                                            />
                                        </Field>
                                        <Field label="Date of Birth">
                                            <input
                                                type="date"
                                                className={isFormDisabled ? DISABLED_INPUT_CLASS + ' [color-scheme:dark]' : INPUT_CLASS + ' [color-scheme:dark]'}
                                                value={member.dob}
                                                onChange={e => updateTeamMember(i, 'dob', e.target.value)}
                                                disabled={isFormDisabled}
                                            />
                                        </Field>
                                        <Field label="Class / Grade">
                                            <Select
                                                value={member.student_class || ''}
                                                onValueChange={v => updateTeamMember(i, 'student_class', v)}
                                                disabled={isFormDisabled}
                                            >
                                                <SelectTrigger className={`${isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS} flex items-center justify-between !h-11`}>
                                                    <SelectValue placeholder="Select class" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#0f172a] border border-white/10 text-white max-h-60 overflow-y-auto">
                                                    {CLASS_OPTIONS.map(cls => (
                                                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field label="School / Institution">
                                            <input
                                                className={isFormDisabled ? DISABLED_INPUT_CLASS : INPUT_CLASS}
                                                placeholder="Institution name"
                                                value={member.institution_name}
                                                onChange={e => updateTeamMember(i, 'institution_name', e.target.value)}
                                                disabled={isFormDisabled}
                                            />
                                        </Field>
                                    </div>
                                </div>
                            ))}

                            {formData.team_members.length === 0 && !isFormDisabled && (
                                <div className="text-center py-6 rounded-2xl border border-dashed border-white/10 text-gray-400 text-sm md:text-base">
                                    No team members added yet.<br />
                                    <button
                                        type="button"
                                        onClick={addTeamMember}
                                        className="text-emerald-400 mt-1 hover:underline"
                                    >
                                        + Add your first team member
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </Section>
            )}

            {/* Documents Section */}
            <Section
                title="Documents & Photos"
                icon="📎"
                subtitle="Upload passport photo and signature (JPG/PNG, max 10MB)"
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FileUpload
                        id="passport_photo"
                        label="Passport Photo"
                        preview={photoPreview}
                        error={errors.passport_photo}
                        accept="image/jpeg,image/jpg,image/png"
                        ref={photoRef}
                        onChange={e => handleFileChange('photo', e)}
                        hint="Clear face photo, white background preferred"
                        isAlreadyUploaded={hasPassportPhoto}
                        uploadedText="Already uploaded on server"
                    />
                    <FileUpload
                        id="candidate_signature"
                        label="Candidate Signature"
                        preview={sigPreview}
                        error={errors.candidate_signature}
                        accept="image/jpeg,image/jpg,image/png"
                        ref={sigRef}
                        onChange={e => handleFileChange('sig', e)}
                        hint="Sign on white paper and photograph/scan"
                        isAlreadyUploaded={hasSignature}
                        uploadedText="Already uploaded on server"
                    />
                </div>
            </Section>

            {errors.submit && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-semibold">
                    {errors.submit}
                </div>
            )}

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || (existingReg ? registrationCompleted : !bothDocsReady && !formData.passport_photo && !formData.candidate_signature)}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
            >
                {loading ? (
                    <>
                        <span className="w-5 h-5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                        Processing…
                    </>
                ) : registrationCompleted ? (
                    'Registration Completed ✓'
                ) : bothDocsReady ? (
                    'Go to Payment →'
                ) : existingReg ? (
                    'Upload Missing Documents & Continue →'
                ) : (
                    'Continue to Payment →'
                )}
            </button>
        </div>
    );
}

// ── Helper Components ─────────────────────────────────────────────

function Section({ title, icon, subtitle, children }: {
    title: string;
    icon: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <span className="text-lg">{icon}</span>
                <div>
                    <h2 className="text-lg md:text-xl font-semibold text-white">{title}</h2>
                    {subtitle && <p className="text-sm md:text-base text-gray-400 mt-0.5">{subtitle}</p>}
                </div>
            </div>
            <div className="p-6 space-y-5">{children}</div>
        </div>
    );
}

function Field({ id, label, error, children }: {
    id?: string;
    label: React.ReactNode;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className={LABEL_CLASS}>{label}</label>
            {children}
            {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
        </div>
    );
}

const FileUpload = React.forwardRef<
    HTMLInputElement,
    {
        id: string;
        label: string;
        preview: string | null;
        error?: string;
        accept: string;
        hint: string;
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
        isAlreadyUploaded?: boolean;
        uploadedText?: string;
    }
>(({ id, label, preview, error, accept, hint, onChange, isAlreadyUploaded, uploadedText = "Already uploaded" }, ref) => (
    <div>
        <label className={LABEL_CLASS}>{label}</label>
        <div
            className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer overflow-hidden min-h-[120px] ${error
                    ? 'border-red-500/40 bg-red-500/5'
                    : isAlreadyUploaded || preview
                        ? 'border-emerald-500/40 bg-emerald-500/5'
                        : 'border-white/10 bg-white/3 hover:border-white/25 hover:bg-white/5'
                }`}
            onClick={() => (ref as React.RefObject<HTMLInputElement>)?.current?.click()}
        >
            <input ref={ref} type="file" accept={accept} className="hidden" onChange={onChange} />

            {preview ? (
                <div className="flex flex-col items-center justify-center p-3 h-full">
                    <img src={preview} alt="Preview" className="max-h-28 max-w-full object-contain rounded-lg" />
                    <p className="text-sm text-emerald-400 mt-2">
                        {isAlreadyUploaded ? uploadedText : '✓ Uploaded — click to change'}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white/60 text-lg">📎</div>
                    <p className="text-zinc-400/60 text-sm">{hint}</p>
                    <p className="text-gray-500 text-sm">Click to upload</p>
                </div>
            )}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
    </div>
));
FileUpload.displayName = 'FileUpload';