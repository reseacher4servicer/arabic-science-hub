import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Computer Science' },
      update: {},
      create: {
        name: 'Computer Science',
        nameAr: 'علوم الحاسوب',
        description: 'Computer Science and Information Technology',
        color: '#3B82F6',
        icon: '💻',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Mathematics' },
      update: {},
      create: {
        name: 'Mathematics',
        nameAr: 'الرياضيات',
        description: 'Pure and Applied Mathematics',
        color: '#10B981',
        icon: '🔢',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Physics' },
      update: {},
      create: {
        name: 'Physics',
        nameAr: 'الفيزياء',
        description: 'Theoretical and Experimental Physics',
        color: '#8B5CF6',
        icon: '⚛️',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Chemistry' },
      update: {},
      create: {
        name: 'Chemistry',
        nameAr: 'الكيمياء',
        description: 'Organic, Inorganic, and Physical Chemistry',
        color: '#F59E0B',
        icon: '🧪',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Biology' },
      update: {},
      create: {
        name: 'Biology',
        nameAr: 'الأحياء',
        description: 'Life Sciences and Biotechnology',
        color: '#EF4444',
        icon: '🧬',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Medicine' },
      update: {},
      create: {
        name: 'Medicine',
        nameAr: 'الطب',
        description: 'Medical Research and Healthcare',
        color: '#EC4899',
        icon: '🏥',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Engineering' },
      update: {},
      create: {
        name: 'Engineering',
        nameAr: 'الهندسة',
        description: 'All Engineering Disciplines',
        color: '#6366F1',
        icon: '⚙️',
      },
    }),
    prisma.category.upsert({
      where: { name: 'Social Sciences' },
      update: {},
      create: {
        name: 'Social Sciences',
        nameAr: 'العلوم الاجتماعية',
        description: 'Psychology, Sociology, and Anthropology',
        color: '#14B8A6',
        icon: '👥',
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ahmed.researcher@example.com' },
      update: {},
      create: {
        email: 'ahmed.researcher@example.com',
        username: 'ahmed_researcher',
        name: 'د. أحمد محمد',
        bio: 'باحث في علوم الحاسوب والذكاء الاصطناعي',
        institution: 'جامعة الملك عبدالعزيز',
        department: 'علوم الحاسوب',
        position: 'أستاذ مساعد',
        verified: true,
        role: 'RESEARCHER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'fatima.physics@example.com' },
      update: {},
      create: {
        email: 'fatima.physics@example.com',
        username: 'fatima_physics',
        name: 'د. فاطمة الزهراء',
        bio: 'متخصصة في الفيزياء النظرية وميكانيكا الكم',
        institution: 'الجامعة الأمريكية في بيروت',
        department: 'الفيزياء',
        position: 'أستاذ مشارك',
        verified: true,
        role: 'RESEARCHER',
      },
    }),
    prisma.user.upsert({
      where: { email: 'omar.math@example.com' },
      update: {},
      create: {
        email: 'omar.math@example.com',
        username: 'omar_math',
        name: 'د. عمر السعيد',
        bio: 'عالم رياضيات متخصص في النظريات الجبرية',
        institution: 'جامعة القاهرة',
        department: 'الرياضيات',
        position: 'أستاذ',
        verified: true,
        role: 'RESEARCHER',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create sample papers
  const papers = await Promise.all([
    prisma.paper.create({
      data: {
        title: 'تطبيقات الذكاء الاصطناعي في معالجة اللغة العربية',
        abstract: 'تتناول هذه الورقة البحثية أحدث التطورات في مجال تطبيق تقنيات الذكاء الاصطناعي لمعالجة النصوص العربية، مع التركيز على التحديات الخاصة باللغة العربية وحلولها المبتكرة.',
        keywords: ['الذكاء الاصطناعي', 'معالجة اللغة الطبيعية', 'اللغة العربية', 'التعلم الآلي'],
        language: 'ar',
        status: 'PUBLISHED',
        categoryId: categories[0].id,
        publishedAt: new Date(),
        authors: {
          create: {
            userId: users[0].id,
            order: 0,
          },
        },
      },
    }),
    prisma.paper.create({
      data: {
        title: 'نظرية الأوتار والأبعاد الإضافية في الفيزياء الحديثة',
        abstract: 'دراسة شاملة لنظرية الأوتار ودورها في فهم الأبعاد الإضافية للكون، مع تحليل الآثار النظرية والتطبيقية لهذه النظرية في الفيزياء المعاصرة.',
        keywords: ['نظرية الأوتار', 'الأبعاد الإضافية', 'الفيزياء النظرية', 'ميكانيكا الكم'],
        language: 'ar',
        status: 'PUBLISHED',
        categoryId: categories[2].id,
        publishedAt: new Date(),
        authors: {
          create: {
            userId: users[1].id,
            order: 0,
          },
        },
      },
    }),
    prisma.paper.create({
      data: {
        title: 'الهندسة الجبرية وتطبيقاتها في الرياضيات الحديثة',
        abstract: 'تقدم هذه الورقة مراجعة شاملة للهندسة الجبرية وتطبيقاتها المتنوعة في مختلف فروع الرياضيات، مع التركيز على الاكتشافات الحديثة والاتجاهات المستقبلية.',
        keywords: ['الهندسة الجبرية', 'الرياضيات', 'النظريات الجبرية', 'التطبيقات الرياضية'],
        language: 'ar',
        status: 'PUBLISHED',
        categoryId: categories[1].id,
        publishedAt: new Date(),
        authors: {
          create: {
            userId: users[2].id,
            order: 0,
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${papers.length} papers`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

