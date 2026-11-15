import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { DOSE_STATUS } from '../lib/constants';

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

export function CareCircleProvider({ children }) {
  const { user, profile } = useAuth();

  const [careCircle, setCareCircle] = useState(SEED_CARE_CIRCLE);
  const [elderlyProfile, setElderlyProfile] = useState(SEED_ELDERLY_PROFILE);
  const [members, setMembers] = useState(SEED_MEMBERS);
  const [medications, setMedications] = useState(SEED_MEDICATIONS);
  const [appointments, setAppointments] = useState(SEED_APPOINTMENTS);
  const [todayDoses, setTodayDoses] = useState([
    {
      id: 'dose-1',
      medication_id: 'med-1',
      med_name: 'Amlodipine Besylate',
      dosage: '5 mg',
      scheduled_time: '08:00:00',
      status: DOSE_STATUS.TAKEN,
      recorded_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      recorded_by_name: 'Kamla Sharma',
      notes: 'Taken after light breakfast',
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

  const [activityLogs, setActivityLogs] = useState([
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
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      type: 'dose_reminder',
      title: 'Afternoon Dose Upcoming',
      message: 'Metformin 500mg is scheduled for 1:00 PM today.',
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ]);

  // Load Real Supabase Data when user is logged in and DB configured
  const fetchCircleData = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    try {
      // 1. Fetch user's Care Circle membership
      const { data: memberData } = await supabase
        .from('care_circle_members')
        .select('*, care_circles(*)')
        .eq('profile_id', user.id)
        .limit(1);

      if (memberData && memberData.length > 0) {
        const activeCircle = memberData[0].care_circles;
        if (activeCircle) {
          setCareCircle(activeCircle);

          // 2. Fetch Elderly Profile
          const { data: elderlyData } = await supabase
            .from('elderly_profiles')
            .select('*')
            .eq('care_circle_id', activeCircle.id)
            .single();

          if (elderlyData) {
            setElderlyProfile(elderlyData);

            // 3. Trigger Idempotent Dose Generation for Today
            const todayStr = new Date().toISOString().split('T')[0];
            await supabase.rpc('generate_daily_doses', {
              p_elderly_id: elderlyData.id,
              p_target_date: todayStr,
            });

            // 4. Trigger Missed Dose Evaluator
            await supabase.rpc('evaluate_missed_doses', {
              p_elderly_id: elderlyData.id,
            });

            // 5. Fetch Medications
            const { data: medsData } = await supabase
              .from('medications')
              .select('*')
              .eq('elderly_id', elderlyData.id)
              .eq('is_active', true);
            if (medsData) setMedications(medsData);

            // 6. Fetch Today's Doses
            const { data: dosesData } = await supabase
              .from('medication_doses')
              .select('*, medications(name, dosage, form)')
              .eq('elderly_id', elderlyData.id)
              .eq('dose_date', todayStr)
              .order('scheduled_time', { ascending: true });

            if (dosesData) {
              setTodayDoses(
                dosesData.map((d) => ({
                  ...d,
                  med_name: d.medications?.name || 'Medication',
                  dosage: d.medications?.dosage || '',
                }))
              );
            }

            // 7. Fetch Appointments
            const { data: apptsData } = await supabase
              .from('appointments')
              .select('*')
              .eq('elderly_id', elderlyData.id)
              .order('appointment_time', { ascending: true });
            if (apptsData) setAppointments(apptsData);

            // 8. Fetch Members
            const { data: allMembers } = await supabase
              .from('care_circle_members')
              .select('*, profiles(full_name, email, phone)')
              .eq('care_circle_id', activeCircle.id);
            if (allMembers) {
              setMembers(
                allMembers.map((m) => ({
                  id: m.id,
                  full_name: m.profiles?.full_name || 'Member',
                  role: m.member_role,
                  permissions: m.permissions,
                  relationship_label: m.relationship_label,
                }))
              );
            }

            // 9. Fetch Activity Logs
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

  // Mark Dose Status (Never auto-marks; records actor & timestamp)
  const markDose = async (doseId, newStatus, notes = '') => {
    const actorName = profile?.full_name || user?.email || 'Care Circle Member';
    const recordedAt = new Date().toISOString();

    if (isSupabaseConfigured && supabase && user) {
      try {
        const { error } = await supabase
          .from('medication_doses')
          .update({
            status: newStatus,
            recorded_at: recordedAt,
            recorded_by: user.id,
            notes: notes || null,
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
              notes,
            }
          : d
      )
    );

    // Append to activity log
    const med = todayDoses.find((d) => d.id === doseId);
    const medName = med?.med_name || 'Medication';
    const newLog = {
      id: `act-${Date.now()}`,
      action_type: 'dose_marked',
      description: `${actorName} marked ${medName} as ${newStatus.toUpperCase()}${notes ? ` ("${notes}")` : ''}.`,
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

        // Create schedule
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

    // Local fallback
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

    // Add corresponding upcoming dose for today
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

  // Add Doctor Appointment
  const addAppointment = async (apptData) => {
    if (isSupabaseConfigured && supabase && elderlyProfile?.id && user) {
      try {
        const { error } = await supabase.from('appointments').insert({
          elderly_id: elderlyProfile.id,
          doctor_name: apptData.doctorName,
          specialty: apptData.specialty,
          clinic_or_hospital: apptData.clinicOrHospital,
          appointment_time: apptData.appointmentTime,
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
      appointment_time: apptData.appointmentTime,
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

  // Calculate Adherence Metrics
  const takenCount = todayDoses.filter((d) => d.status === DOSE_STATUS.TAKEN).length;
  const missedCount = todayDoses.filter((d) => d.status === DOSE_STATUS.MISSED).length;
  const upcomingCount = todayDoses.filter((d) => d.status === DOSE_STATUS.UPCOMING).length;
  const totalCount = todayDoses.length;
  const adherenceRate = totalCount > 0 ? Math.round((takenCount / (totalCount - upcomingCount || 1)) * 100) : 100;

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
        adherenceMetrics: {
          takenCount,
          missedCount,
          upcomingCount,
          totalCount,
          adherenceRate: Math.min(100, Math.max(0, adherenceRate)),
        },
        markDose,
        addMedication,
        addAppointment,
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
