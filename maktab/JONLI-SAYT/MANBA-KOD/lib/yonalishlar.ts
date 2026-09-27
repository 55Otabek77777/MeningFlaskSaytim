/**
 * Academic directions (yo’nalishlar) — single source for the home-page grid
 * and the /yonalishlar/[slug] detail pages. v5: subject-pair tracks aligned
 * to university admission (kimyo-biologiya first).
 */

export interface Yonalish {
  slug: string;
  title: string;
  /** Icon key rendered by YonalishIcon. */
  icon: "globe" | "sigma" | "book" | "seedling" | "pulse" | "calcglobe";
  /** One-line pitch (home-page card). */
  short: string;
  /** Expanded paragraphs for the detail page (300+ words, SEO-rich). */
  paragraphs: string[];
  /** "Bu yo’nalishda nimalar o’rgatiladi" — exactly 5 items. */
  topics: [string, string, string, string, string];
}

export const YONALISHLAR: Yonalish[] = [
  {
    slug: "kimyo-biologiya",
    title: "Kimyo–Biologiya",
    icon: "pulse",
    short:
      "Tibbiyot va farmatsevtikaga tayyorlov: chuqurlashtirilgan kimyo va biologiya, laboratoriya amaliyoti, milliy sertifikatga yo’naltirilgan dastur.",
    paragraphs: [
      "Kimyo–biologiya — tibbiyot, stomatologiya va farmatsevtika orzusidagi o’quvchilar uchun asosiy yo’nalish. «Mirzo Ulug’bek» xususiy maktabida bu yo’nalish chuqurlashtirilgan dastur asosida olib boriladi: nazariya laboratoriya amaliyoti bilan mustahkamlanadi, har bir mavzu tibbiyot oliygohlari kirish talablariga bog’lab o’tiladi. O’quvchi formulani yodlamaydi — uni tushunadi va amalda qo’llaydi.",
      "Uchko’prik va Farg’ona vodiysida tibbiyotga tayyorlovning kuchli maktabini topish oson emas. Bizning yo’nalishimiz aynan shu bo’shliqni to’ldiradi: kimyodan reaksiyalar, organik va anorganik bo’limlar, biologiyadan anatomiya va fiziologiyaga alohida urg’u beriladi. Kichik guruhlar va har bir o’quvchiga individual yondashuv natijani sezilarli oshiradi.",
      "O’quvchilar milliy sertifikat imtihonlariga tizimli tayyorlanadi — 2025–2026 o’quv yilida aynan shu fanlardan o’quvchilarimiz A va A+ darajali natijalarni qo’lga kiritdi. Sertifikat nafaqat oliygohga kirishda imtiyoz beradi, balki o’quvchining fanni chuqur o’zlashtirganini tasdiqlaydi. Iqtidorli o’quvchilar uchun olimpiada guruhlari alohida ishlaydi.",
      "Maqsadimiz aniq: bitiruvchi maktabni tugatishga qadar kimyo va biologiya fanlaridan ham sertifikatli bo’lsin va tibbiyot oliygohiga ishonch bilan hujjat topshirsin. Qabul 2026 ochiq — farzandingizni shu yo’nalishda o’qitishni istasangiz, biz bilan bog’laning.",
    ],
    topics: [
      "Chuqurlashtirilgan kimyo: reaksiyalar, masalalar, laboratoriya ishlari",
      "Chuqurlashtirilgan biologiya: anatomiya va fiziologiyaga urg’u",
      "Milliy sertifikat imtihonlariga tizimli tayyorlov",
      "Tibbiyot oliygohlari kirish talablari bo’yicha mashg’ulotlar",
      "Olimpiada va tanlovlarga yo’naltirilgan alohida guruhlar",
    ],
  },
  {
    slug: "ingliz-tili",
    title: "Ingliz tili",
    icon: "globe",
    short:
      "Kuchli til bazasi va xalqaro imtihonlarga tayyorlov. Tajribali o’qituvchilar jamoasi bilan natijaga yo’naltirilgan darslar.",
    paragraphs: [
      "Ingliz tili — maktabimizning eng kuchli yo’nalishlaridan biri. Ixtisoslashtirilgan xonalar, zamonaviy metodika va darajalarga bo’lingan guruhlar orqali har bir o’quvchi o’z sur’atida o’sadi. Darslar amaliy muloqotga qurilgan: o’quvchi qoidani yodlab qolmaydi, uni jonli nutqda qo’llashni o’rganadi.",
      "Dastur darajalar bo’yicha bosqichma-bosqich quriladi: Beginner’dan boshlab har bir o’quvchi o’z guruhida o’qiydi va daraja imtihonini topshirmasdan keyingi bosqichga o’tmaydi. Speaking klublari, bahs-munozaralar va taqdimotlar til ko’nikmasini kundalik odatga aylantiradi.",
      "O’quvchilarimiz CEFR darajalari bo’yicha muntazam imtihon topshiradi va sertifikat oladi. Xalqaro imtihonga (IELTS) alohida tayyorlov guruhlari ishlaydi — Listening, Reading, Writing va Speaking bo’limlari bo’yicha strategiyalar alohida o’rgatiladi. O’qituvchimizning shaxsiy IELTS 8.0 natijasi darslar sifatining amaliy kafolati.",
      "Maqsad aniq: bitiruvchi maktabni ingliz tilida erkin so’zlashadigan va xalqaro sertifikatga ega darajada tugatsin. Bu unga ham mahalliy oliygohlarda imtiyoz, ham xalqaro dasturlarga yo’l ochadi.",
    ],
    topics: [
      "Darajaga mos guruhlar: Beginner’dan IELTS tayyorlovgacha",
      "Speaking klublari va jonli muloqot amaliyoti",
      "CEFR (A1–C1) imtihonlariga tizimli tayyorlov",
      "IELTS strategiyalari: Listening, Reading, Writing, Speaking",
      "Xalqaro darsliklar va multimedia xonalarida mashg’ulotlar",
    ],
  },
  {
    slug: "matematika-fizika",
    title: "Matematika–Fizika",
    icon: "sigma",
    short:
      "Texnik oliygohlarga poydevor: olimpiada, sertifikat va kirish imtihonlariga tizimli tayyorlov.",
    paragraphs: [
      "Matematika–fizika juftligi — muhandislik, arxitektura, energetika va texnik oliygohlarni maqsad qilganlar uchun. Mustahkam nazariy poydevor ko’p miqdorda masala yechish amaliyoti bilan birlashtiriladi: har bir mavzu oddiy misoldan nostandart masalagacha bosqichma-bosqich mustahkamlanadi.",
      "Darslar natijaga qaratilgan tizimda olib boriladi: muntazam mavzuli testlar, xatolar tahlili va har bir o’quvchining o’sishini kuzatib boruvchi individual yondashuv. Fizikada nazariya amaliy tajribalar bilan boyitiladi — o’quvchi formulaning qayerdan kelganini tushunib yechadi.",
      "Iqtidorli o’quvchilar olimpiada guruhlariga jalb qilinadi va tuman-viloyat bosqichlarida qatnashadi. Milliy sertifikat hamda DTM formatidagi imtihonlarga alohida tayyorlov olib boriladi — bitiruvchi texnik oliygohga ishonch bilan hujjat topshiradi.",
    ],
    topics: [
      "Matematikadan chuqurlashtirilgan dastur va nostandart masalalar",
      "Fizika: nazariya, masala yechish va amaliy tajribalar",
      "Olimpiada tayyorlovi (tuman va viloyat bosqichlari)",
      "Milliy sertifikat va DTM imtihonlariga tizimli tayyorlov",
      "Texnik oliygohlar kirish talablariga mos mashg’ulotlar",
    ],
  },
  {
    slug: "matematika-ingliz",
    title: "Matematika–Ingliz tili",
    icon: "calcglobe",
    short:
      "Eng ko’p talab qilinadigan juftlik: iqtisod, IT va xalqaro dasturlar uchun.",
    paragraphs: [
      "Matematika–ingliz tili — bugungi kunda eng ko’p talab qilinadigan fanlar juftligi. Iqtisod, moliya, IT va xalqaro grant dasturlariga kirishda aynan shu ikki fan hal qiluvchi rol o’ynaydi.",
      "Dastur ikki yo’nalishda parallel olib boriladi: matematikadan sertifikat va kirish imtihonlariga tayyorlov, ingliz tilidan CEFR/IELTS darajalariga chiqish. Mantiqiy fikrlash, test strategiyalari va vaqtni boshqarish ko’nikmalari alohida mashq qilinadi — imtihonda bilim bilan birga taktika ham hal qiladi.",
      "Bu juftlikni tanlagan o’quvchi eng keng imkoniyatga ega bo’ladi: mahalliy oliygohlarning iqtisod va IT yo’nalishlari, xalqaro universitetlar hamda grant dasturlari — barchasiga bitta poydevor xizmat qiladi.",
    ],
    topics: [
      "Matematikadan milliy sertifikatga yo’naltirilgan dastur",
      "Ingliz tilidan CEFR (B1–C1) va IELTS tayyorlovi",
      "Iqtisod va IT yo’nalishlari kirish talablariga moslashgan mashg’ulotlar",
      "Mantiqiy fikrlash va test strategiyalari",
      "Xalqaro grant dasturlari uchun til va fan poydevori",
    ],
  },
  {
    slug: "ona-tili-adabiyot",
    title: "Ona tili–Adabiyot",
    icon: "book",
    short: "Milliy sertifikat natijalari va filologiya yo’nalishlariga tayyorlov.",
    paragraphs: [
      "Ona tili va adabiyot yo’nalishi o’quvchining savodxonligi, nutq madaniyati va badiiy didini shakllantiradi. Darslarda grammatika qoidalari jonli matnlar, insho va bahs-munozaralar orqali mustahkamlanadi — o’quvchi qoidani quruq yodlamaydi, uni yozma va og’zaki nutqida ishlatadi.",
      "Insho yozish alohida maktab sifatida olib boriladi: fikrni to’g’ri qurish, dalillash va badiiy vositalardan o’rinli foydalanish bosqichma-bosqich o’rgatiladi. Adabiy asarlar tahlili o’quvchining mustaqil fikrlashini o’stiradi.",
      "Bu fan bo’yicha maktabimiz milliy sertifikat imtihonlarida eng ko’p natija olgan yo’nalishlardan biri. Filologiya, jurnalistika va pedagogika yo’nalishlarini maqsad qilgan o’quvchilar uchun alohida tayyorlov olib boriladi.",
    ],
    topics: [
      "Savodxonlik: imlo va tinish belgilari amaliyoti",
      "Nutq madaniyati va notiqlik ko’nikmalari",
      "Insho va ijodiy matn yozish maktabi",
      "Adabiy asarlarni tahlil qilish ko’nikmasi",
      "Milliy sertifikat va DTM imtihonlariga tayyorlov",
    ],
  },
  {
    slug: "5-7-sinflar",
    title: "5–7-sinflar",
    icon: "seedling",
    short:
      "Hozirda maktabimizda 8–11-sinflar ta’lim oladi. 5-sinfdan 7-sinfgacha bo’lgan o’quvchilar uchun zamon talablariga mos yangi bino qurilmoqda — ochilishi 2026-yil sentabrga rejalashtirilgan.",
    paragraphs: [
      "Hozirda maktabimizda 8-sinfdan 11-sinfgacha bo’lgan o’quvchilar ta’lim oladi. 5-sinfdan 7-sinfgacha bo’lgan o’quvchilar uchun esa zamon talablariga to’liq javob beradigan yangi ko’p qavatli bino qurilmoqda — ochilishi 2026-yil sentabr oyiga rejalashtirilgan.",
      "Yangi binoda zamonaviy sinf xonalari, qulay o’quv muhiti va maktabimizning ko’p yillik tajribasiga tayangan kuchli dastur o’quvchilarni kutadi. Maqsad — 5–7-sinf o’quvchilari yuqori sinflarga mustahkam poydevor bilan o’tishi.",
      "Batafsil ma’lumot uchun maktab adminlari bilan bog’laning. Telegram kanalimizda kuzatib boring — yangi bino va 5–7-sinflarga qabul haqidagi yangiliklar birinchi bo’lib e’lon qilinadi.",
    ],
    topics: [
      "Yangi ko’p qavatli bino — 5–7-sinf o’quvchilari uchun",
      "Zamonaviy sinf xonalari va o’quv sharoitlari",
      "Asosiy fanlardan mustahkam poydevor — yuqori sinflarga tayyorlov",
      "Har bir o’quvchiga alohida e’tibor va tarbiya",
      "Ota-ona bilan doimiy aloqa va rivojlanish hisobotlari",
    ],
  },
];

export function findYonalish(slug: string): Yonalish | undefined {
  return YONALISHLAR.find((y) => y.slug === slug);
}
