import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import connectMongoDB from '../lib/mongoDb/connect.js';
import Pack from '../models/Pack.js';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: join(__dirname, '../../.env.local') });

async function seedPacks() {
  await connectMongoDB(); // Connect to DB

  const packs = [
    {
      category: 'Pack Single',
      sessions: [
        { price: 325, sessionCount: 1, expirationDays: 15 },
        { price: 1794, sessionCount: 6, expirationDays: 30 },
        { price: 3486, sessionCount: 12, expirationDays: 60 },
        { price: 6480, sessionCount: 24, expirationDays: 90 },
        { price: 13250, sessionCount: 50, expirationDays: 180 }
      ],
      features: {
        en: [
          'Your first session is free',
          'Personalized training plan',
          'Access to all types of workouts',
          'Comprehensive fitness assessment',
          'Complete nutritional program for all goals with free guidance',
          'Free body composition analysis',
          'Session duration: 60 minutes'
        ],
        ar: [
          'حصتك الأولى مجانيه',
          'خطة تدريب شخصية',
          'إمكانيةاختيار جميع أنواع التمارين',
          'تقييم لياقة بدنية شامل',
          'برنامج غدائي متكامل لجميع الأهداف وتوجيه مجاني',
          'تحليل تكوين الجسم مجاني',
          'مدة الجلسة 60 دقيقة'
        ]
      }
    },
    {
      category: 'Body Package',
      sessions: [
        { price: 445, sessionCount: 1, expirationDays: 15 },
        { price: 2394, sessionCount: 6, expirationDays: 30 },
        { price: 4548, sessionCount: 12, expirationDays: 60 },
        { price: 7180, sessionCount: 20, expirationDays: 90 }
      ],
      features: {
        en: [
          'Two-person training session',
          'Your first session is free',
          'Personalized training plan for both individuals',
          'Access to all types of workouts',
          'Comprehensive fitness assessment for both individuals',
          'Complete nutritional program for all goals with free guidance for both individuals',
          'Free body composition analysis for both individuals',
          'Session duration: 60 minutes'
        ],
        ar: [
          'تمرين شخصين مع بعض',
          'حصتك الأولى مجانيه',
          'خطة تدريب شخصية لكلا شخصين',
          'إمكانية اختيار جميع أنواع التمارين',
          'تقييم لياقة بدنية شامل لكلا الشخصي',
          'برنامج غدائي متكامل لجميع الأهداف لكلا شخصين وتوجيه مجاني',
          'تحليل تكوين الجسم مجاني لكلا الشخصين',
          'مدة الجلسة 60 دقيقة'
        ]
      }
    },
    {
      category: 'Pack Nutrition',
      sessions: [{ price: 499, sessionCount: 1, expirationDays: 15 }],
      features: {
        en: [
          'Free initial online consultation',
          'Personalized nutrition plan',
          'Regular assessments to encourage commitment',
          'Daily support'
        ],
        ar: [
          'جلسة استشاريةأولية مجانيه عبر الإنترنت',
          'خطة غدائية مخصصة',
          'تقييم دوري لتشجيع الإلتزام بالخطة',
          'الدعم اليومي'
        ]
      }
    }
  ];

  try {
    await Pack.deleteMany(); // Clear previous data
    await Pack.insertMany(packs);
    console.log('✅ Packs seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding packs:', error);
  } finally {
    console.log("finish")
    mongoose.connection.close(); // Close connection after seeding
  }
}

seedPacks();
