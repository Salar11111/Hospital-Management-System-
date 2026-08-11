import { connectDB, disconnectDB } from '../config/db.js';
import { logger } from '../config/logger.js';
import { ROLES } from '../config/constants.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Medicine } from '../models/Medicine.js';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Prescription } from '../models/Prescription.js';
import { LabOrder } from '../models/LabOrder.js';
import { AdminLog } from '../models/AdminLog.js';
const PASSWORD = 'Password123!';
const daysFromNow = (days) => {
  const d = /* @__PURE__ */ new Date();
  d.setHours(9, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d;
};
const clearCollections = async () => {
  await Promise.all([
    AdminLog.deleteMany({}),
    Prescription.deleteMany({}),
    LabOrder.deleteMany({}),
    MedicalRecord.deleteMany({}),
    Appointment.deleteMany({}),
    Medicine.deleteMany({}),
    Patient.deleteMany({}),
    User.deleteMany({}),
  ]);
  logger.info('Cleared all existing collections');
};
async function main() {
  await connectDB();
  await clearCollections();
  await User.create({
    name: 'System Admin',
    email: 'admin@medicore.local',
    password: PASSWORD,
    role: ROLES.ADMIN,
    department: 'Administration',
    gender: 'Prefer not to say',
    avatarColor: '#4f46e5',
  });
  await User.create({
    name: 'Maya Patel',
    email: 'maya@medicore.local',
    password: PASSWORD,
    role: ROLES.RECEPTIONIST,
    department: 'Front Desk',
    phone: '+1 555 010 2201',
    gender: 'Female',
    avatarColor: '#0ea5e9',
  });
  await User.create([
    {
      name: 'Omar Haddad',
      email: 'pharmacy@medicore.local',
      password: PASSWORD,
      role: ROLES.PHARMACIST,
      department: 'Pharmacy',
      phone: '+1 555 010 2202',
      gender: 'Male',
      avatarColor: '#10b981',
    },
    {
      name: 'Lisa Chen',
      email: 'lab@medicore.local',
      password: PASSWORD,
      role: ROLES.LABTECH,
      department: 'Laboratory',
      phone: '+1 555 010 2203',
      gender: 'Female',
      avatarColor: '#f59e0b',
    },
  ]);
  const doctorDefinitions = [
    {
      name: 'Dr. Amelia Carter',
      email: 'amelia@medicore.local',
      department: 'Cardiology',
      specialization: 'Cardiology',
      qualifications: 'MD, FACC',
      experience: 12,
      phone: '+1 555 010 1101',
      gender: 'Female',
    },
    {
      name: 'Dr. Rajesh Iyer',
      email: 'rajesh@medicore.local',
      department: 'Neurology',
      specialization: 'Neurology',
      qualifications: 'MD, DM',
      experience: 9,
      phone: '+1 555 010 1102',
      gender: 'Male',
    },
    {
      name: 'Dr. Sarah Kim',
      email: 'sarah@medicore.local',
      department: 'Pediatrics',
      specialization: 'Pediatrics',
      qualifications: 'MD, FAAP',
      experience: 15,
      phone: '+1 555 010 1103',
      gender: 'Female',
    },
    {
      name: 'Dr. Marcus Webb',
      email: 'marcus@medicore.local',
      department: 'Orthopedics',
      specialization: 'Orthopedics',
      qualifications: 'MD, FACS',
      experience: 18,
      phone: '+1 555 010 1104',
      gender: 'Male',
    },
    {
      name: 'Dr. Priya Nair',
      email: 'priya@medicore.local',
      department: 'Gynecology & Obstetrics',
      specialization: 'Gynecology & Obstetrics',
      qualifications: 'MD, MRCOG',
      experience: 10,
      phone: '+1 555 010 1105',
      gender: 'Female',
    },
  ];
  const createdDoctors = await User.create(
    doctorDefinitions.map((d) => ({
      ...d,
      password: PASSWORD,
      role: ROLES.DOCTOR,
      isActive: true,
      avatarColor: '#6366f1',
      profile: {
        avatar: '',
        specialization: d.specialization,
        qualifications: d.qualifications,
        experience: d.experience,
      },
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', isAvailable: true },
        { day: 'Friday', startTime: '09:00', endTime: '15:00', isAvailable: true },
      ],
    }))
  );
  const patientUsers = await User.create([
    {
      name: 'John Rivers',
      email: 'john@medicore.local',
      password: PASSWORD,
      role: ROLES.PATIENT,
      phone: '+1 555 010 3301',
      gender: 'Male',
      avatarColor: '#14b8a6',
    },
    {
      name: 'Emma Wilson',
      email: 'emma@medicore.local',
      password: PASSWORD,
      role: ROLES.PATIENT,
      phone: '+1 555 010 3303',
      gender: 'Female',
      avatarColor: '#14b8a6',
    },
    {
      name: 'Noah Bennett',
      email: 'noah@medicore.local',
      password: PASSWORD,
      role: ROLES.PATIENT,
      phone: '+1 555 010 3305',
      gender: 'Male',
      avatarColor: '#14b8a6',
    },
    {
      name: 'Sofia Martinez',
      email: 'sofia@medicore.local',
      password: PASSWORD,
      role: ROLES.PATIENT,
      phone: '+1 555 010 3307',
      gender: 'Female',
      avatarColor: '#14b8a6',
    },
    {
      name: 'Liam Foster',
      email: 'liam@medicore.local',
      password: PASSWORD,
      role: ROLES.PATIENT,
      phone: '+1 555 010 3309',
      gender: 'Male',
      avatarColor: '#14b8a6',
    },
  ]);
  const patientDocs = await Patient.create([
    {
      user: patientUsers[0]._id,
      name: 'John Rivers',
      contact: {
        phone: '+1 555 010 3301',
        email: 'john@medicore.local',
        address: '12 Elm Street',
        emergencyContact: '+1 555 010 3302',
      },
      gender: 'Male',
      bloodGroup: 'O+',
      dob: /* @__PURE__ */ new Date('1985-03-14'),
      allergies: ['Penicillin'],
      medicalHistory: [
        {
          condition: 'Asthma',
          diagnosedDate: /* @__PURE__ */ new Date('2015-06-01'),
          notes: 'Mild, exercise-induced',
        },
      ],
      insurance: {
        provider: 'BlueCross',
        policyNumber: 'BC-88231',
        expiryDate: /* @__PURE__ */ new Date('2027-01-01'),
      },
    },
    {
      user: patientUsers[1]._id,
      name: 'Emma Wilson',
      contact: {
        phone: '+1 555 010 3303',
        email: 'emma@medicore.local',
        address: '88 Oak Avenue',
        emergencyContact: '+1 555 010 3304',
      },
      gender: 'Female',
      bloodGroup: 'A-',
      dob: /* @__PURE__ */ new Date('1992-07-22'),
      allergies: ['Sulfa drugs'],
      medicalHistory: [
        { condition: 'Migraine', diagnosedDate: /* @__PURE__ */ new Date('2018-02-01') },
      ],
    },
    {
      user: patientUsers[2]._id,
      name: 'Noah Bennett',
      contact: {
        phone: '+1 555 010 3305',
        email: 'noah@medicore.local',
        address: '3 Cedar Lane',
        emergencyContact: '+1 555 010 3306',
      },
      gender: 'Male',
      bloodGroup: 'B+',
      dob: /* @__PURE__ */ new Date('1978-11-05'),
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: /* @__PURE__ */ new Date('2010-09-01'),
          notes: 'Well controlled',
        },
      ],
      insurance: {
        provider: 'Aetna',
        policyNumber: 'AET-99102',
        expiryDate: /* @__PURE__ */ new Date('2026-06-30'),
      },
    },
    {
      user: patientUsers[3]._id,
      name: 'Sofia Martinez',
      contact: {
        phone: '+1 555 010 3307',
        email: 'sofia@medicore.local',
        address: '21 Maple Drive',
        emergencyContact: '+1 555 010 3308',
      },
      gender: 'Female',
      bloodGroup: 'AB+',
      dob: /* @__PURE__ */ new Date('1998-01-30'),
      medicalHistory: [
        { condition: 'Gastritis', diagnosedDate: /* @__PURE__ */ new Date('2021-04-01') },
      ],
    },
    {
      user: patientUsers[4]._id,
      name: 'Liam Foster',
      contact: {
        phone: '+1 555 010 3309',
        email: 'liam@medicore.local',
        address: '7 Birch Court',
        emergencyContact: '+1 555 010 3310',
      },
      gender: 'Male',
      bloodGroup: 'O-',
      dob: /* @__PURE__ */ new Date('2005-09-09'),
      allergies: ['Latex'],
    },
  ]);
  const medicines = await Medicine.create([
    {
      name: 'Amoxicillin',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      stockQuantity: 220,
      price: 4.5,
      supplier: 'MedSupply Co',
      reorderLevel: 25,
      expiryDate: /* @__PURE__ */ new Date('2027-03-01'),
    },
    {
      name: 'Ibuprofen',
      genericName: 'Ibuprofen',
      category: 'Pain Relief',
      stockQuantity: 15,
      price: 2.75,
      supplier: 'MedSupply Co',
      reorderLevel: 30,
      expiryDate: /* @__PURE__ */ new Date('2026-12-01'),
    },
    {
      name: 'Atorvastatin',
      genericName: 'Atorvastatin',
      category: 'Cardiology',
      stockQuantity: 80,
      price: 8.2,
      supplier: 'PharmaDirect',
      reorderLevel: 20,
      expiryDate: /* @__PURE__ */ new Date('2026-09-01'),
    },
    {
      name: 'Metformin',
      genericName: 'Metformin HCl',
      category: 'Diabetes',
      stockQuantity: 12,
      price: 3.4,
      supplier: 'PharmaDirect',
      reorderLevel: 25,
      expiryDate: /* @__PURE__ */ new Date('2027-05-01'),
    },
    {
      name: 'Salbutamol Inhaler',
      genericName: 'Albuterol',
      category: 'Respiratory',
      stockQuantity: 45,
      price: 14,
      supplier: 'RespiCare',
      reorderLevel: 10,
      expiryDate: /* @__PURE__ */ new Date('2026-11-01'),
    },
    {
      name: 'Omeprazole',
      genericName: 'Omeprazole',
      category: 'Gastro',
      stockQuantity: 130,
      price: 5.75,
      supplier: 'GastroLine',
      reorderLevel: 30,
      expiryDate: /* @__PURE__ */ new Date('2027-02-01'),
    },
    {
      name: 'Cetirizine',
      genericName: 'Cetirizine HCl',
      category: 'Allergy',
      stockQuantity: 8,
      price: 1.95,
      supplier: 'GastroLine',
      reorderLevel: 25,
      expiryDate: /* @__PURE__ */ new Date('2026-12-01'),
    },
    {
      name: 'Paracetamol',
      genericName: 'Acetaminophen',
      category: 'Pain Relief',
      stockQuantity: 400,
      price: 1.25,
      supplier: 'MedSupply Co',
      reorderLevel: 50,
      expiryDate: /* @__PURE__ */ new Date('2027-01-01'),
    },
    {
      name: 'Levothyroxine',
      genericName: 'Levothyroxine Sodium',
      category: 'Endocrine',
      stockQuantity: 5,
      price: 6.5,
      supplier: 'PharmaDirect',
      reorderLevel: 20,
      expiryDate: /* @__PURE__ */ new Date('2026-08-01'),
    },
    {
      name: 'Losartan',
      genericName: 'Losartan Potassium',
      category: 'Cardiology',
      stockQuantity: 95,
      price: 4.9,
      supplier: 'CardioLine',
      reorderLevel: 25,
      expiryDate: /* @__PURE__ */ new Date('2027-04-01'),
    },
  ]);
  const firstPatient = patientDocs[0];
  const firstDoctor = createdDoctors[0];
  if (firstPatient && firstDoctor) {
    await Appointment.create([
      {
        patient: firstPatient._id,
        doctor: firstDoctor._id,
        bookedBy: patientUsers[0]._id,
        date: daysFromNow(0),
        time: '09:30',
        reason: 'Annual cardiac check-up',
        type: 'Consultation',
        status: 'Confirmed',
      },
      {
        patient: firstPatient._id,
        doctor: firstDoctor._id,
        bookedBy: firstDoctor._id,
        date: daysFromNow(1),
        time: '11:00',
        reason: 'Follow-up blood pressure',
        type: 'Follow-up',
        status: 'Confirmed',
      },
      {
        patient: firstPatient._id,
        doctor: firstDoctor._id,
        bookedBy: firstDoctor._id,
        date: daysFromNow(-3),
        time: '14:30',
        reason: 'Chest discomfort review',
        type: 'Consultation',
        status: 'Completed',
        consultedAt: daysFromNow(-3),
      },
    ]);
    const amoxicillin = medicines.find((m) => m.name === 'Amoxicillin');
    const ibuprofen = medicines.find((m) => m.name === 'Ibuprofen');
    if (amoxicillin && ibuprofen) {
      await Prescription.create({
        doctor: firstDoctor._id,
        patient: firstPatient._id,
        status: 'Pending',
        items: [
          {
            medicine: amoxicillin._id,
            name: amoxicillin.name,
            dosage: '500mg',
            frequency: '3x daily',
            duration: '7 days',
            quantity: 21,
            price: amoxicillin.price,
          },
          {
            medicine: ibuprofen._id,
            name: ibuprofen.name,
            dosage: '400mg',
            frequency: '2x daily',
            duration: '5 days',
            quantity: 10,
            price: ibuprofen.price,
          },
        ],
        notes: 'Take with food',
      });
      await LabOrder.create([
        {
          patient: firstPatient._id,
          doctor: firstDoctor._id,
          testName: 'Complete Blood Count',
          status: 'Completed',
          results: [
            { parameter: 'Hemoglobin', value: '13.4', unit: 'g/dL', referenceRange: '13\u201317' },
            {
              parameter: 'WBC Count',
              value: '6.2',
              unit: '10\xB3/\xB5L',
              referenceRange: '4.0\u201310.0',
            },
          ],
        },
        {
          patient: firstPatient._id,
          doctor: firstDoctor._id,
          testName: 'Lipid Panel',
          status: 'Pending',
          notes: 'Fasting required',
        },
      ]);
    }
  }
  for (let i = 1; i < patientDocs.length; i++) {
    const p = patientDocs[i];
    const d = createdDoctors[i % createdDoctors.length];
    if (p && d) {
      await Appointment.create({
        patient: p._id,
        doctor: d._id,
        bookedBy: d._id,
        date: daysFromNow(i + 1),
        time: '10:30',
        reason: i % 2 === 0 ? 'Routine consultation' : 'Imaging review',
        type: 'Consultation',
        status: 'Pending',
      });
    }
  }
  logger.info('');
  logger.info('Seeding complete. Sign-in accounts (password for all: %s):', PASSWORD);
  logger.info('- Admin:        admin@medicore.local');
  logger.info('- Patient:      john@medicore.local');
  logger.info('- Receptionist: maya@medicore.local');
  logger.info('- Pharmacist:   pharmacy@medicore.local');
  logger.info('- Lab tech:     lab@medicore.local');
  logger.info(
    '- Doctors:      amelia@medicore.local, rajesh@medicore.local, sarah@medicore.local, marcus@medicore.local, priya@medicore.local'
  );
  await disconnectDB();
  process.exit(0);
}
void main().catch((err) => {
  logger.error('Seeding failed: %s', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
