import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { DOSE_STATUS } from '../lib/constants';
import { formatTimeTo12Hour, checkIsFutureDose, getLocalDateString, toISOStringSafe } from '../lib/dateUtils';

const CareCircleContext = createContext(null);

// Default realistic sample data for initial demonstration
const SEED_CARE_CIRCLE = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Sharma Family Care Circle',
  is_demo: true,
};

const SEED_ELDERLY_PROFILE = {
  id: '22222222-2222-2222-2222-222222222222',
  full_name: 'Kamla Sharma',
  date_of_birth: '1952-08-15',
  gender: 'Female',
  blood_group: 'B+',
  allergies: 'Penicillin, Aspirin (Mild skin rash)',
  medical_conditions: 'Hypertension, Type-2 Diabetes, Mild Osteoarthritis',
  emergency_contact_name: 'Rohan Sharma',
  emergency_contact_phone: '+91 98765 43211',
  emergency_contact_relation: 'Son',
  primary_doctor_name: 'Dr. Rajiv Verma (Cardiologist)',
  primary_doctor_phone: '+91 98111 22334',
  timezone: 'Asia/Kolkata',
};

const SEED_MEDICATIONS = [
  {
    id: 'med-1',
    name: 'Amlodipine Besylate',
    dosage: '5 mg',
    form: 'tablet',
    instructions: 'Take 1 tablet with warm water 30 minutes after breakfast.',
    is_active: true,
    scheduled_time: '08:00:00',
  },
  {
    id: 'med-2',
    name: 'Metformin HCl ER',
    dosage: '500 mg',
    form: 'tablet',
    instructions: 'Take with lunch. Do not crush or chew.',
    is_active: true,
    scheduled_time: '13:00:00',
  },
  {
    id: 'med-3',
    name: 'Atorvastatin Calcium',
    dosage: '10 mg',
    form: 'tablet',
    instructions: 'Take at bedtime for cholesterol management.',
    is_active: true,
    scheduled_time: '21:00:00',
  },
];

const SEED_MEMBERS = [
  { id: 'mem-1', full_name: 'Kamla Sharma', role: 'elderly', permissions: 'admin', relationship_label: 'Self (Mother)' },
  { id: 'mem-2', full_name: 'Rohan Sharma', role: 'family', permissions: 'admin', relationship_label: 'Son (Primary Admin)' },
  { id: 'mem-3', full_name: 'Nurse Priya Rao', role: 'caregiver', permissions: 'write', relationship_label: 'Visiting Care Nurse' },
];

const SEED_APPOINTMENTS = [
  {
    id: 'appt-1',
    doctor_name: 'Dr. Rajiv Verma',
    specialty: 'Cardiology Review',
    clinic_or_hospital: 'Apollo Specialty Clinic, Room 304',
    appointment_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    notes: 'Bring latest ECG report and 30-day blood pressure monitoring log.',
  },
  {
    id: 'appt-2',
    doctor_name: 'Dr. Sunita Patel',
    specialty: 'Diabetology Follow-up',
    clinic_or_hospital: 'City Healthcare Center',
    appointment_time: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'upcoming',
    notes: 'Fasting blood glucose test required prior to consultation.',
  },
];

const SEED_TODAY_DOSES = [
  {
    id: 'dose-1',
    medication_id: 'med-1',
    med_name: 'Amlodipine Besylate',
    dosage: '5 mg',
    scheduled_time: '08:00:00',
    status: DOSE_STATUS.TAKEN,
    recorded_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    recorded_by_name: 'Kamla Sharma',
    notes: 'Taken after light breakfast with warm water',
  },
  {
    id: 'dose-2',
    medication_id: 'med-2',
    med_name: 'Metformin HCl ER',
    dosage: '500 mg',
    scheduled_time: '13:00:00',
    status: DOSE_STATUS.UPCOMING,
    recorded_at: null,
    recorded_by_name: null,
    notes: null,
  },
  {
    id: 'dose-3',
    medication_id: 'med-3',
    med_name: 'Atorvastatin Calcium',
    dosage: '10 mg',
    scheduled_time: '21:00:00',
    status: DOSE_STATUS.UPCOMING,
    recorded_at: null,
    recorded_by_name: null,
    notes: null,
  },
];

const SEED_ACTIVITY_LOGS = [
  {
    id: 'act-1',
    action_type: 'dose_taken',
    description: 'Kamla Sharma marked morning dose of Amlodipine 5mg as TAKEN.',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'act-2',
    action_type: 'appointment_created',
    description: 'Rohan Sharma scheduled Cardiology Review with Dr. Rajiv Verma.',
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

const SEED_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'dose_reminder',
    title: 'Afternoon Dose Upcoming',
    message: 'Metformin 500mg is scheduled for 1:00 PM today.',
    is_read: false,
    created_at: new Date().toISOString(),
  },
];

export function CareCircleProvider({ children }) {
  const { user, profile } = useAuth();

  const [careCircle, setCareCircle] = useState(SEED_CARE_CIRCLE);
  const [elderlyProfile, setElderlyProfile] = useState(SEED_ELDERLY_PROFILE);
  const [members, setMembers] = useState(SEED_MEMBERS);
  const [medications, setMedications] = useState(SEED_MEDICATIONS);
  const [appointments, setAppointments] = useState(SEED_APPOINTMENTS);
  const [todayDoses, setTodayDoses] = useState(SEED_TODAY_DOSES);
  const [activityLogs, setActivityLogs] = useState(SEED_ACTIVITY_LOGS);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);

  // Determine current user's Care Circle permission
  const currentMember = members.find(
    (m) => m.id === profile?.id || m.profile_id === user?.id || m.role === profile?.role
  );
  const currentPermissions = currentMember?.permissions || (profile?.role === 'elderly' ? 'admin' : 'write');
  const isReadOnly = currentPermissions === 'read';
  const canModifyDoses = !isReadOnly;

  // Load Real Supabase Data when user is logged in and DB configured
  const fetchCircleData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    try {
      const { data: memberData } = await supabase
        .from('care_circle_members')
        .select('*, care_circles(*)')
        .eq('profile_id', user.id)
        .limit(1);

      if (memberData && memberData.length > 0) {
        const activeCircle = memberData[0].care_circles;
        if (activeCircle) {
          setCareCircle(activeCircle);

          const { data: elderlyData } = await supabase
            .from('elderly_profiles')
            .select('*')
            .eq('care_circle_id', activeCircle.id)
            .single();

          if (elderlyData) {
            setElderlyProfile(elderlyData);

            // Timezone-safe local date string eliminates UTC midnight boundary desync (DATA-HIGH-04)
            const todayStr = getLocalDateString(new Date(), elderlyData.timezone || 'Asia/Kolkata');
            await supabase.rpc('generate_daily_doses', {
              p_elderly_id: elderlyData.id,
              p_target_date: todayStr,
            });

            await supabase.rpc('evaluate_missed_doses', {
              p_elderly_id: elderlyData.id,
            });

            const { data: medsData } = await supabase
              .from('medications')
              .select('*')
              .eq('elderly_id', elderlyData.id)
              .eq('is_active', true);
            if (medsData) setMedications(medsData);

            // Include instructions to eliminate hardcoded instruction bug (UI-MED-07)
            const { data: dosesData } = await supabase
              .from('medication_doses')
              .select('*, medications(name, dosage, form, instructions)')
              .eq('elderly_id', elderlyData.id)
              .eq('dose_date', todayStr)
              .order('scheduled_time', { ascending: true });

            if (dosesData) {
              setTodayDoses(
                dosesData.map((d) => ({
                  ...d,
                  med_name: d.medications?.name || 'Medication',
                  dosage: d.medications?.dosage || '',
                  instructions: d.medications?.instructions || '',
                }))
              );
            }

            const { data: apptsData } = await supabase
              .from('appointments')
              .select('*')
              .eq('elderly_id', elderlyData.id)
              .order('appointment_time', { ascending: true });
            if (apptsData) setAppointments(apptsData);

            const { data: allMembers } = await supabase
              .from('care_circle_members')
              .select('*, profiles(full_name, email, phone)')
              .eq('care_circle_id', activeCircle.id);
            if (allMembers) {
              setMembers(
                allMembers.map((m) => ({
                  id: m.id,
                  profile_id: m.profile_id,
                  full_name: m.profiles?.full_name || 'Member',
                  role: m.member_role,
                  permissions: m.permissions,
                  relationship_label: m.relationship_label,
                }))
              );
            }

            const { data: logsData } = await supabase
              .from('activity_logs')
              .select('*')
              .eq('care_circle_id', activeCircle.id)
              .order('created_at', { ascending: false })
              .limit(20);
            if (logsData) setActivityLogs(logsData);
          }
        }
      }
    } catch (err) {
      console.warn('Notice loading care circle data from DB:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchCircleData();
  }, [fetchCircleData]);

  // Mark Dose Status (Never auto-marks; records actor & timestamp; validates early admin)
  const markDose = async (doseId, newStatus, notes = '', isEarlyConfirmed = false) => {
    if (!canModifyDoses) {
      return {
        success: false,
        error: 'Permission Denied: Read-only members are not authorized to update medication doses.',
      };
    }

    const targetDose = todayDoses.find((d) => d.id === doseId);
    if (!targetDose) return { success: false, error: 'Dose not found' };

    const actorName = profile?.full_name || user?.email || 'Care Circle Member';
    const actualRecordedTime = new Date();
    const recordedAt = actualRecordedTime.toISOString();
    const formattedActualTime = actualRecordedTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

    // Check if premature dose confirmation
    let finalNotes = notes || '';
    if (newStatus === DOSE_STATUS.TAKEN && targetDose.scheduled_time) {
      const futureCheck = checkIsFutureDose(targetDose.scheduled_time);
      if (futureCheck.isFuture) {
        if (!isEarlyConfirmed) {
          return {
            success: false,
            needsEarlyConfirmation: true,
            dose: targetDose,
            minutesAhead: futureCheck.minutesAhead,
          };
        }
        // Append explicit early notation
        finalNotes = `[Early Administration at ${formattedActualTime} • Scheduled for ${futureCheck.formattedScheduled}] ${finalNotes}`.trim();
      }
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase
          .from('medication_doses')
          .update({
            status: newStatus,
            recorded_at: recordedAt,
            recorded_by: user.id,
            notes: finalNotes || null,
            updated_at: recordedAt,
          })
          .eq('id', doseId);

        if (error) throw error;
        await fetchCircleData();
        return { success: true };
      } catch (err) {
        console.error('Error updating dose:', err);
        return { success: false, error: err.message };
      }
    }

    // Local state fallback update
    setTodayDoses((prev) =>
      prev.map((d) =>
        d.id === doseId
          ? {
              ...d,
              status: newStatus,
              recorded_at: recordedAt,
              recorded_by_name: actorName,
              notes: finalNotes,
            }
          : d
      )
    );

    const medName = targetDose.med_name || 'Medication';
    const newLog = {
      id: `act-${Date.now()}`,
      action_type: 'dose_marked',
      description: `${actorName} marked ${medName} as ${newStatus.toUpperCase()}${finalNotes ? ` ("${finalNotes}")` : ''}.`,
      created_at: recordedAt,
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  // Add Medication
  const addMedication = async (medData) => {
    if (isSupabaseConfigured && supabase && elderlyProfile?.id && user) {
      try {
        const { data: newMed, error: medError } = await supabase
          .from('medications')
          .insert({
            elderly_id: elderlyProfile.id,
            name: medData.name,
            dosage: medData.dosage,
            form: medData.form,
            instructions: medData.instructions,
            start_date: medData.startDate || new Date().toISOString().split('T')[0],
            end_date: medData.endDate || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (medError) throw medError;

        if (newMed && medData.scheduledTime) {
          await supabase.from('medication_schedules').insert({
            medication_id: newMed.id,
            scheduled_time: medData.scheduledTime,
            frequency_type: 'daily',
          });
        }

        await fetchCircleData();
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    const newMedItem = {
      id: `med-${Date.now()}`,
      name: medData.name,
      dosage: medData.dosage,
      form: medData.form,
      instructions: medData.instructions,
      is_active: true,
      scheduled_time: medData.scheduledTime,
    };
    setMedications((prev) => [...prev, newMedItem]);

    const newDose = {
      id: `dose-${Date.now()}`,
      medication_id: newMedItem.id,
      med_name: newMedItem.name,
      dosage: newMedItem.dosage,
      scheduled_time: medData.scheduledTime,
      status: DOSE_STATUS.UPCOMING,
      recorded_at: null,
      recorded_by_name: null,
    };
    setTodayDoses((prev) => [...prev, newDose]);

    return { success: true };
  };

  // Add Doctor Appointment (Safely converts localized datetime to ISO - DATA-HIGH-05)
  const addAppointment = async (apptData) => {
    const isoAppointmentTime = toISOStringSafe(apptData.appointmentTime);
    if (isSupabaseConfigured && supabase && elderlyProfile?.id && user) {
      try {
        const { error } = await supabase.from('appointments').insert({
          elderly_id: elderlyProfile.id,
          doctor_name: apptData.doctorName,
          specialty: apptData.specialty,
          clinic_or_hospital: apptData.clinicOrHospital,
          appointment_time: isoAppointmentTime,
          notes: apptData.notes,
          created_by: user.id,
        });
        if (error) throw error;
        await fetchCircleData();
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    const newAppt = {
      id: `appt-${Date.now()}`,
      doctor_name: apptData.doctorName,
      specialty: apptData.specialty,
      clinic_or_hospital: apptData.clinicOrHospital,
      appointment_time: isoAppointmentTime,
      notes: apptData.notes,
      status: 'upcoming',
    };
    setAppointments((prev) => [newAppt, ...prev]);

    const actorName = profile?.full_name || 'Care Circle Member';
    const newLog = {
      id: `act-${Date.now()}`,
      action_type: 'appointment_created',
      description: `${actorName} scheduled an appointment with ${apptData.doctorName}.`,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  // Update Appointment Status (e.g. 'completed', 'cancelled', 'upcoming')
  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    if (!canModifyDoses) {
      return { success: false, error: 'Permission denied: Read-only members cannot update appointments.' };
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', appointmentId);
        if (error) throw error;
        await fetchCircleData();
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Local fallback
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
    );

    const targetAppt = appointments.find((a) => a.id === appointmentId);
    const actorName = profile?.full_name || 'Care Circle Member';
    const newLog = {
      id: `act-${Date.now()}`,
      action_type: 'appointment_updated',
      description: `${actorName} marked consultation with ${targetAppt?.doctor_name || 'Doctor'} as ${newStatus.toUpperCase()}.`,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  // Archive Medication (Soft-delete to preserve dose history - FUNC-MED-08)
  const archiveMedication = async (medicationId) => {
    if (!canModifyDoses) {
      return { success: false, error: 'Permission denied: Read-only members cannot archive medications.' };
    }

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase
          .from('medications')
          .update({
            is_active: false,
            archived_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', medicationId);

        if (error) throw error;
        await fetchCircleData();
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Local fallback update
    setMedications((prev) =>
      prev.map((m) =>
        m.id === medicationId ? { ...m, is_active: false, archived_at: new Date().toISOString() } : m
      )
    );

    const targetMed = medications.find((m) => m.id === medicationId);
    const actorName = profile?.full_name || 'Care Circle Member';
    const newLog = {
      id: `act-${Date.now()}`,
      action_type: 'medication_archived',
      description: `${actorName} archived medication ${targetMed?.name || 'prescription'}.`,
      created_at: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);

    return { success: true };
  };

  // Atomic Care Circle Creation for New Users (FUNC-HIGH-06)
  const createCareCircle = async (circleData) => {
    if (isSupabaseConfigured && supabase && user) {
      try {
        const { data, error } = await supabase.rpc('create_care_circle_atomic', {
          p_circle_name: circleData.circleName,
          p_elderly_name: circleData.elderlyName,
          p_date_of_birth: circleData.dateOfBirth || null,
          p_gender: circleData.gender || 'Not specified',
          p_blood_group: circleData.bloodGroup || 'Unknown',
          p_allergies: circleData.allergies || 'None reported',
          p_medical_conditions: circleData.medicalConditions || 'None reported',
          p_emergency_name: circleData.emergencyName,
          p_emergency_phone: circleData.emergencyPhone,
          p_emergency_relation: circleData.emergencyRelation || 'Family',
          p_doctor_name: circleData.doctorName || null,
          p_doctor_phone: circleData.doctorPhone || null,
          p_timezone: circleData.timezone || 'Asia/Kolkata',
          p_user_role: profile?.role || 'elderly',
        });

        if (error) throw error;
        await fetchCircleData();
        return { success: true, data };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Local fallback
    const newCircle = { id: `circle-${Date.now()}`, name: circleData.circleName, is_demo: false };
    const newElderly = {
      id: `elderly-${Date.now()}`,
      full_name: circleData.elderlyName,
      emergency_contact_name: circleData.emergencyName,
      emergency_contact_phone: circleData.emergencyPhone,
      allergies: circleData.allergies || 'None reported',
      medical_conditions: circleData.medicalConditions || 'None reported',
      timezone: circleData.timezone || 'Asia/Kolkata',
    };
    setCareCircle(newCircle);
    setElderlyProfile(newElderly);
    return { success: true };
  };

  // Accept Cryptographic Invitation (FUNC-HIGH-03)
  const acceptInvitation = async (rawToken) => {
    try {
      // 1. Compute SHA-256 hash using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(rawToken);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const tokenHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

      if (isSupabaseConfigured && supabase && user) {
        const { data: resData, error } = await supabase.rpc('accept_care_circle_invitation', {
          p_token_hash: tokenHash,
        });

        if (error) throw error;
        await fetchCircleData();
        return { success: true, data: resData };
      }

      // Local fallback
      const actorName = profile?.full_name || 'New Member';
      const newMember = {
        id: `mem-${Date.now()}`,
        full_name: actorName,
        role: 'family',
        permissions: 'write',
        relationship_label: 'Care Circle Member',
      };
      setMembers((prev) => [...prev, newMember]);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Invalid or expired invitation token.' };
    }
  };

  // Predictable Demo State Reset Function
  const resetDemoData = () => {
    setCareCircle(SEED_CARE_CIRCLE);
    setElderlyProfile(SEED_ELDERLY_PROFILE);
    setMembers(SEED_MEMBERS);
    setMedications(SEED_MEDICATIONS);
    setAppointments(SEED_APPOINTMENTS);
    setTodayDoses([
      {
        id: 'dose-1',
        medication_id: 'med-1',
        med_name: 'Amlodipine Besylate',
        dosage: '5 mg',
        scheduled_time: '08:00:00',
        status: DOSE_STATUS.TAKEN,
        recorded_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        recorded_by_name: 'Kamla Sharma',
        notes: 'Taken after light breakfast with warm water',
      },
      {
        id: 'dose-2',
        medication_id: 'med-2',
        med_name: 'Metformin HCl ER',
        dosage: '500 mg',
        scheduled_time: '13:00:00',
        status: DOSE_STATUS.UPCOMING,
        recorded_at: null,
        recorded_by_name: null,
        notes: null,
      },
      {
        id: 'dose-3',
        medication_id: 'med-3',
        med_name: 'Atorvastatin Calcium',
        dosage: '10 mg',
        scheduled_time: '21:00:00',
        status: DOSE_STATUS.UPCOMING,
        recorded_at: null,
        recorded_by_name: null,
        notes: null,
      },
    ]);
    setActivityLogs(SEED_ACTIVITY_LOGS);
    setNotifications(SEED_NOTIFICATIONS);
    return true;
  };

  const isDemo = Boolean(!user || user.is_demo || careCircle?.is_demo);

  // =========================================================================
  // MATHEMATICALLY RIGOROUS ADHERENCE METRICS
  // =========================================================================
  const takenCount = todayDoses.filter((d) => d.status === DOSE_STATUS.TAKEN).length;
  const missedCount = todayDoses.filter((d) => d.status === DOSE_STATUS.MISSED).length;
  const skippedCount = todayDoses.filter((d) => d.status === DOSE_STATUS.SKIPPED).length;
  const upcomingCount = todayDoses.filter((d) => d.status === DOSE_STATUS.UPCOMING).length;
  const unconfirmedCount = todayDoses.filter((d) => d.status === DOSE_STATUS.UNCONFIRMED).length;
  const totalCount = todayDoses.length;

  // Eligible / Due doses: all doses that have reached their scheduled time or were resolved early
  const dueDosesCount = takenCount + missedCount + skippedCount + unconfirmedCount;
  
  // Adherence on eligible due doses: (Taken / (Taken + Missed + Skipped + Unconfirmed)) * 100
  const adherenceRate = dueDosesCount > 0 
    ? Math.round((takenCount / dueDosesCount) * 100) 
    : null; // null indicates no doses have come due yet

  // Overall day completion rate
  const dayCompletionRate = totalCount > 0 
    ? Math.round((takenCount / totalCount) * 100) 
    : 0;

  return (
    <CareCircleContext.Provider
      value={{
        careCircle,
        elderlyProfile,
        members,
        medications,
        appointments,
        todayDoses,
        activityLogs,
        notifications,
        canModifyDoses,
        isReadOnly,
        currentPermissions,
        adherenceMetrics: {
          takenCount,
          missedCount,
          skippedCount,
          upcomingCount,
          unconfirmedCount,
          dueDosesCount,
          totalCount,
          hasDueDoses: dueDosesCount > 0,
          adherenceRate,
          dayCompletionRate,
        },
        markDose,
        addMedication,
        archiveMedication,
        addAppointment,
        updateAppointmentStatus,
        createCareCircle,
        acceptInvitation,
        resetDemoData,
        isDemo,
        refreshData: fetchCircleData,
      }}
    >
      {children}
    </CareCircleContext.Provider>
  );
}

export const useCareCircle = () => {
  const context = useContext(CareCircleContext);
  if (!context) {
    throw new Error('useCareCircle must be used within a CareCircleProvider');
  }
  return context;
};
