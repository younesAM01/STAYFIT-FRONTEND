import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import connectMongoDB from '../lib/mongoDb/connect.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../../.env.local') });

async function seedCoaches() {
  await connectMongoDB();

  const coaches = [
    {
      email: 'ishak@example.com',
      firstName: 'Ishak',
      lastName: 'Coach',
      supabaseId: 'coach-ishak',
      role: 'coach',
      rating: 4.9,
      reviews: 22,
      aboutContent: {
        paragraphs: [
          'Passionate Personal Trainer Adept At Making Workouts Fun And Rewarding. Expertise In Instructing Clients On Proper Lifting Techniques And Educating Clients On Proper Nutrition And Hydration Needs. Experience Providing Instruction For One On One Session And Ability To Motivate Others Toward Accomplishing Weight Loss.',
          '🏆 Moroccan kickboxing champion in 2010 and boxing champion for the Greater Shawiya in 2012.'
        ],
        languages: [
          { code: 'en', name: 'English' }
        ]
      },
      specialties: [
        'Weight Management', 'Body Conditioning', 'Martial Arts', 'Grappling', 'Boxing', 'Kettlebell',
        'Plyometric', 'Bodybuilding', 'Flexibility & Stretching', 'Core training', 'Nutrition'
      ].map(title => ({ title, description: '' })),
      certifications: [
        { title: 'Certified personal trainer (ACE)' },
        { title: 'Resistance Training Specialist (IFBB)' },
        { title: 'Hypertrophy level 1 (ASP)' },
        { title: 'Fat loss specialization (ASP)' },
        { title: 'Certified personal trainer (ISSI)' },
        { title: 'Certified specialist sport nutrition (ISSA)' },
        { title: 'Certified specialist transformation (ISSA)' },
        { title: 'Certified box 12 (Hatton Academy)' },
        { title: 'Coach MMA diploma' },
        { title: 'Coach kick boxing diploma' },
        { title: 'Coach Muay Thai diploma' },
        { title: 'Physical therapy' },
        { title: 'Exercise corrective' }
      ]
    },
    {
      email: 'oussama@example.com',
      firstName: 'Oussama',
      lastName: 'Coach',
      supabaseId: 'coach-oussama',
      role: 'coach',
      rating: 4.8,
      reviews: 19,
      aboutContent: {
        paragraphs: [
          'Trainer with over 9 years of experience in personal training and boxing. Passionate about helping individuals achieve their health and fitness goals through customized training programs. Committed to providing a motivating and respectful environment for results in fitness and nutrition.'
        ],
        languages: [
          { code: 'en', name: 'English' }
        ]
      },
      specialties: [
        'Personal Training', 'Boxing', 'Kickboxing', 'Muay Thai', 'Weight Management', 'General Fitness', 'Nutrition'
      ].map(title => ({ title, description: '' })),
      certifications: [
        { title: 'Certified Sports Nutrition Coach (NASM)' },
        { title: 'Certified Personal Trainer (NASM)' },
        { title: 'Certified Personal Trainer (ISSA)' },
        { title: 'Certified CPR & AED (ISSA)' },
        { title: 'Fitness Facility Management (ACE)' },
        { title: 'Instructor (Hatton Boxing Academy)' },
        { title: 'Body Combat Instructor (Les Mills)' },
        { title: 'Nutrition for Performance (Optimum)' },
        { title: 'Certified Trainer (Global Academy)' },
        { title: 'Glute Relocation & Hip Correction' },
        { title: 'Instructor (International Muay Thai Federation)' }
      ]
    },
    {
      email: 'khadija@example.com',
      firstName: 'Khadija',
      lastName: 'Coach',
      supabaseId: 'coach-khadija',
      role: 'coach',
      rating: 4.9,
      reviews: 21,
      aboutContent: {
        paragraphs: [
          'Dedicated trainer with over 8 years of experience in personal training, dance, and martial arts. Passionate about creating dynamic sessions that motivate and empower clients.',
          '🏆 3x Moroccan champion in karate, winner of KSA women’s karate championship, and the Champions Cup in karate.'
        ],
        languages: [
          { code: 'en', name: 'English' }
        ]
      },
      specialties: [
        'Personal Training', 'Yoga', 'Pilates', 'Karate', 'Boxing', 'Dancing'
      ].map(title => ({ title, description: '' })),
      certifications: [
        { title: 'Certified Personal Trainer (ISSA)' },
        { title: 'Kickboxing Instructor (ISSA)' },
        { title: 'Official Zumba Instructor B1' },
        { title: 'Zumba Instructor ZIN' },
        { title: 'CPR & AED (Saudi Tred)' },
        { title: 'Level 4 Fitness Trainer License (LDI)' },
        { title: 'Elite Trainer (ISSA)' },
        { title: 'MMA Saudia Certificate' },
        { title: 'Body Combat & Pump (Les Mills)' },
        { title: 'Black Belt Shotokan Karate' }
      ]
    },
    {
      email: 'ghaytha@example.com',
      firstName: 'Ghaytha',
      lastName: 'Coach',
      supabaseId: 'coach-ghaytha',
      role: 'coach',
      rating: 4.7,
      reviews: 16,
      aboutContent: {
        paragraphs: [
          'Certified in personal training, sport injuries, fitness, and nutrition. Passionate about functional training and stretching for sustainable health.'
        ],
        languages: [
          { code: 'en', name: 'English' }
        ]
      },
      specialties: [
        'Weight Management', 'Body Conditioning', 'Bodybuilding', 'Core Training', 'Flexibility & Stretching', 'Nutrition Counseling', 'Functional Training'
      ].map(title => ({ title, description: '' })),
      certifications: [
        { title: 'Personal Trainer Program Design (ACE)' },
        { title: 'Sport Injuries (Swedish Academy)' },
        { title: 'Sport Nutrition (Swedish Academy)' },
        { title: 'Fitness Course (Swedish Academy)' },
        { title: 'Aerobic Zumba / Step / Body Barre' },
        { title: 'Kickboxing Trainer' }
      ]
    },
    {
      email: 'othman@example.com',
      firstName: 'Othman',
      lastName: 'Coach',
      supabaseId: 'coach-othman',
      role: 'coach',
      rating: 5.0,
      reviews: 25,
      aboutContent: {
        paragraphs: [
          'I am a passionate personal trainer skilled at making workouts enjoyable and rewarding. I have experience teaching clients proper striking techniques and helping them gain self-confidence.',
          '🏆 Moroccan and international kickboxing and Muay Thai champion with multiple titles from 2016 to 2023.'
        ],
        languages: [
          { code: 'en', name: 'English' }
        ]
      },
      specialties: [
        'Weight Management', 'Fitness Improvement', 'Martial Arts', 'Boxing', 'Kickboxing', 'Muay Thai', 'Bodybuilding', 'Flexibility & Stretching', 'Core Training'
      ].map(title => ({ title, description: '' })),
      certifications: [
        { title: 'Certified Personal Trainer' },
        { title: 'Resistance Training Specialist' },
        { title: 'Fat Loss Specialist' },
        { title: 'Black Belt Kickboxing' },
        { title: 'Black Belt Muay Thai' },
        { title: 'Kickboxing Coach Diploma' },
        { title: 'Muay Thai Coach Diploma' },
        { title: 'Corrective Exercise' }
      ]
    },
    {
      email: 'fatima@example.com',
      firstName: 'Fatima Zahra',
      lastName: 'Coach',
      supabaseId: 'coach-fatima',
      role: 'coach',
      rating: 4.95,
      reviews: 23,
      aboutContent: {
        paragraphs: [
          'I am a passionate personal trainer experienced in Muay Thai and kickboxing. I help clients build self-confidence and reach fitness goals through effective coaching.',
          '🏆 Moroccan and African champion in multiple combat sports including kickboxing, karate, and Muay Thai.'
        ],
        languages: [
          { code: 'en', name: 'English' }
        ]
      },
      specialties: [
        'Weight Management', 'Bodybuilding', 'Functional Training', 'Fitness Improvement', 'Martial Arts', 'Boxing', 'Kickboxing', 'Muay Thai', 'Flexibility & Stretching', 'Core Training'
      ].map(title => ({ title, description: '' })),
      certifications: [
        { title: 'Certified Personal Trainer (ISSA)' },
        { title: 'Resistance Training Specialist' },
        { title: 'Fat Loss Specialist' },
        { title: 'Black Belt Kickboxing' },
        { title: 'Kickboxing Coach Diploma' },
        { title: 'Muay Thai Coach Diploma' },
        { title: 'Corrective Exercise' }
      ]
    }
  ];

  try {
    await User.deleteMany({ role: 'coach' });
    await User.insertMany(coaches);
    console.log('✅ Coaches seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding coaches:', error);
  } finally {
    console.log('Finish');
    mongoose.connection.close();
  }
}

seedCoaches();