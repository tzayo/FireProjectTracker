import { PrismaClient, HydrantStatus, OpenState } from '@prisma/client';

const prisma = new PrismaClient();

function statusFromOpen(open: string | undefined): HydrantStatus {
  if (!open) return 'NEEDS_SERVICE';
  const t = open.trim();
  if (t === 'V') return 'OPERATIONAL';
  if (t === 'X') return 'OUT_OF_ORDER';
  return 'NEEDS_SERVICE';
}

function openStateFromOpen(open: string | undefined): OpenState {
  if (!open) return 'UNKNOWN';
  const t = open.trim();
  if (t === 'V') return 'YES';
  if (t === 'X') return 'NO';
  return 'UNKNOWN';
}

function buildNotes(params: { area: string; equipmentPoint?: string; repair?: string; diameter?: string; open?: string }): string {
  const bits: string[] = [];
  bits.push(`אזור: ${params.area}`);
  if (params.equipmentPoint) bits.push(`נקודת ציוד קרובה: ${params.equipmentPoint}`);
  if (params.repair) bits.push(`תיקון נדרש: ${params.repair}`);
  if (params.diameter) bits.push(`קוטר: ${params.diameter}`);
  if (params.open) bits.push(`פתיחה: ${params.open}`);
  return bits.join(' | ');
}

// Data extracted from user's list (1..62)
// Coordinates are unknown at this time
const hydrants: Array<{
  num: number;
  area: string;
  equipmentPoint?: string;
  location: string;
  open?: string;
  repair?: string;
  diameter?: string;
}> = [
  // אזור נקודה 1
  { num: 1, area: 'אזור נקודה 1', equipmentPoint: "נק' 1", location: 'חורשה מול הבית של מלקולם', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 2, area: 'אזור נקודה 1', equipmentPoint: "נק' 1 או נק' 2", location: 'ליד הבית של יהודית לעאל מתחת לשביל כיוון עדי דותן', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 3, area: 'אזור נקודה 1', equipmentPoint: "נק' 1 או נק' 2", location: 'כביש ראשי ליד החניה של אריאל הורביץ', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור בוטקה ונקודה 2
  { num: 4, area: 'אזור בוטקה ונקודה 2', equipmentPoint: 'ללא', location: 'בגב הבוטקה בש.ג.', open: 'V', repair: 'בבוטקה יש 3 שרוולים ומזנק להשלים ארון, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 5, area: 'אזור בוטקה ונקודה 2', equipmentPoint: "נק' 2", location: 'בין חיליק דותן לאיקה', open: 'X', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 6, area: 'אזור בוטקה ונקודה 2', equipmentPoint: "נק' 2", location: 'חניה ליד גדי ומיכל פלג על הכביש', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 7, area: 'אזור בוטקה ונקודה 2', equipmentPoint: "נק' 1", location: 'מול רובינסקי צמוד לאילן וטלי פיקס', open: 'V', repair: 'כל המפרט חלוד, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 8, area: 'אזור בוטקה ונקודה 2', equipmentPoint: "נק' 1", location: 'מאחורי צחי והילה עמיתי מול נורית גרוסמן', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 3 מכינה
  { num: 9, area: 'אזור נקודה 3 מכינה', equipmentPoint: "נק' 3 מכינה", location: 'מתחת לבית של גבע ולילך', open: 'V', repair: 'להשלים מפתח 2 אינץ, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 10, area: 'אזור נקודה 3 מכינה', equipmentPoint: "נק' 3 מכינה", location: 'מאחורי מטיסון מול ריבקין', open: 'V', repair: 'זקיף PVC להחליף, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 11, area: 'אזור נקודה 3 מכינה', equipmentPoint: "נק' 3 מכינה", location: 'מתחת לבית של קבלו מעל דויצ\'ו', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 12, area: 'אזור נקודה 3 מכינה', equipmentPoint: "נק' 3 מכינה", location: 'כניסה תחתונה למכינה מתחת לדשא המרכזי', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 13, area: 'אזור נקודה 3 מכינה', equipmentPoint: "נק' 3 מכינה", location: 'שביל מכינה מתחת לדשא המרכזי', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 14, area: 'אזור נקודה 3 מכינה', equipmentPoint: "נק' 3 מכינה", location: 'משרדי מכינה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3 עם מעבר ל-2' },
  { num: 15, area: 'אזור נקודה 3 מכינה', equipmentPoint: "נק' 3 מכינה", location: 'מדרכה צפונית לכיוון הבריכה עם גלגלון כיבוי', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 4 מכינה עליונה
  { num: 16, area: 'אזור נקודה 4 מכינה עליונה', equipmentPoint: "נק' 4 מכינה עליונה", location: 'מכינה קומפלקס עליון ליד חדר 5', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 6 קיר מקלט מכינה
  { num: 17, area: 'אזור נקודה 6 קיר מקלט מכינה', equipmentPoint: "צמוד לנק' 6", location: 'ליד פחי אשפה מתחת לגן שקד', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 18, area: 'אזור נקודה 6 קיר מקלט מכינה', equipmentPoint: "נק' 6 קיר מקלט מכינה", location: 'ליד משאבות בריכה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 19, area: 'אזור נקודה 6 קיר מקלט מכינה', equipmentPoint: "נק' 6 קיר מקלט מכינה", location: 'שביל כניסה לבית של רזי', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 7-8 מקלט גפן
  { num: 20, area: 'אזור נקודה 7-8 מקלט גפן', equipmentPoint: "צמוד לנק' 7", location: 'מזרחית לשער הפיצה צמוד לגדר הקפית', open: 'V', repair: 'נקודה להשלמת ציוד, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 21, area: 'אזור נקודה 7-8 מקלט גפן', equipmentPoint: "נק' 8 מקלט גפן", location: 'צמוד לבית של רינות לכיוון בתיה', open: '?', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 22, area: 'אזור נקודה 7-8 מקלט גפן', equipmentPoint: "נק' 8 מקלט גפן", location: 'מעל הבית של רוסא ליד השער החשמלי בכביש', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 23, area: 'אזור נקודה 7-8 מקלט גפן', equipmentPoint: "נק' 8 מקלט גפן", location: 'מאחורי גפן צמוד לחניה החדשה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 33, area: 'אזור נקודה 7-8 מקלט גפן', equipmentPoint: "נק' 8 מקלט גפן", location: 'צומת הגנים', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 9-10 עמדת טעינה גפן
  { num: 24, area: 'אזור נקודה 9-10 עמדת טעינה גפן', equipmentPoint: "צמוד לנק' 9", location: 'מאחורי גפן צמוד לעמדת טעינת רכב', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 25, area: 'אזור נקודה 9-10 עמדת טעינה גפן', equipmentPoint: "נק' 9 עמדת טעינה גפן", location: 'חניה אור והילה גליקסמן', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 26, area: 'אזור נקודה 9-10 עמדת טעינה גפן', equipmentPoint: "נק' 9 או נק' 10", location: 'יוסי גל צמוד לכביש', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 27, area: 'אזור נקודה 9-10 עמדת טעינה גפן', equipmentPoint: "נק' 10 מעל עמוס לבון", location: 'מעל אילנה שר מעבר לכביש', open: 'X', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 28, area: 'אזור נקודה 9-10 עמדת טעינה גפן', equipmentPoint: "צמוד לנק' 10", location: 'מעל עמוס לבון מעבר לכביש', open: 'V', repair: 'להחליף ידית פתיחה, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 29, area: 'אזור נקודה 9-10 עמדת טעינה גפן', equipmentPoint: "נק' 10 מעל עמוס לבון", location: 'צומת שבילים ליד ענתבי', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 11 צוותא
  { num: 34, area: 'אזור נקודה 11 צוותא', equipmentPoint: "נק' 11 צוותא", location: 'ליד הקרטוניה מעל אברהם הלינגר', open: 'X', repair: 'להחליף ראש, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 42, area: 'אזור נקודה 11 צוותא', equipmentPoint: "נק' 11 צוותא", location: 'מאחורי רפי זמיר מול ויטקו', open: '?', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 12 דובדבן
  { num: 40, area: 'אזור נקודה 12 דובדבן', equipmentPoint: "נק' 12 דובדבן", location: 'מול הכניסה לדובדבן', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 13 רפת
  { num: 43, area: 'אזור נקודה 13 רפת', equipmentPoint: "נק' 13 רפת", location: "שכ' אקליפטוס על השביל ליד מלעי כלפה", open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 44, area: 'אזור נקודה 13 רפת', equipmentPoint: "נק' 13 רפת", location: "שכ' אקליפטוס על השביל ליד יערי קריקון", open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 45, area: 'אזור נקודה 13 רפת', equipmentPoint: "נק' 13 רפת", location: 'תאילנדים לכיוון הכולבו', open: '?', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 46, area: 'אזור נקודה 13 רפת', equipmentPoint: "נק' 13 רפת", location: 'כולבו פינה אחורית ליד הקרטוניה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 47, area: 'אזור נקודה 13 רפת', equipmentPoint: "נק' 13 רפת", location: 'חניית ביסטרו', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 14 הנה"ח וחד"א
  { num: 30, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 הנה\"ח", location: 'מתחת לכרמל קרים לכיוון הכביש', open: 'X', repair: 'להחליף ראש, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 31, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 הנה\"ח", location: 'מתחת להנה\"ח מעל אייזנברג', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 32, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 הנה\"ח", location: 'מול המוסד מאחורי הנה\"ח', open: '?', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 48, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 חד\"א קיר שירותים", location: 'בגינה מול יד שלישית אספסוף', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 49, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 חד\"א קיר שירותים", location: 'בגינה מול יד שלישית אספסוף ליד הברוש', open: 'V', repair: 'ראש שבור, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 50, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 חד\"א קיר שירותים", location: 'ליד מגדל המים מול המחסנים', open: 'X', repair: 'ראש שבור, צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 51, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 חד\"א משרד חוחובה", location: 'מתחת לחניית חד\"א מעל החוחובה בתוך קו העצים', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 52, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 חד\"א קיר שירותים", location: 'רמפה חד\"א', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 53, area: 'אזור נקודה 14 הנה"ח וחד"א', equipmentPoint: "נק' 14 חד\"א קיר שירותים", location: 'חד\"א כניסה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזור נקודה 15 משרדי חוחובה
  { num: 54, area: 'אזור נקודה 15 משרדי חוחובה', equipmentPoint: "נק' 15 משרדי חוחובה", location: 'קו פיקוסים מעל החוחובה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 55, area: 'אזור נקודה 15 משרדי חוחובה', equipmentPoint: "נק' 15 משרדי חוחובה", location: 'בין חוחובה לפרג ליד החומה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 56, area: 'אזור נקודה 15 משרדי חוחובה', equipmentPoint: "נק' 15 משרדי חוחובה", location: 'מול הכניסה לפרג', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 57, area: 'אזור נקודה 15 משרדי חוחובה', equipmentPoint: 'נק\' צמודה לא מתוחזקת', location: 'חוחובה מתקן ניקוי משרדים ישנים', open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // אזורים נוספים
  { num: 35, area: 'אזורים נוספים', equipmentPoint: 'ללא', location: 'בין הולצמן ליוסי וביאטריס גליקסמן', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 36, area: 'אזורים נוספים', equipmentPoint: 'ללא', location: 'בין סיוון ותמיר לכביש', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 37, area: 'אזורים נוספים', equipmentPoint: 'ללא', location: 'מול בני שמאי', open: 'X', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 38, area: 'אזורים נוספים', equipmentPoint: 'ללא', location: 'ליד אורה קרן לכיוון מייק פיינמן', open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 39, area: 'אזורים נוספים', equipmentPoint: 'ללא', location: 'ליד חניה מתי ויאנה ברק', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 41, area: 'אזורים נוספים', equipmentPoint: 'ללא', location: 'מעל מקלט יצירה', open: 'V', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  // שכונת הזית
  { num: 58, area: 'שכונת הזית', equipmentPoint: 'ללא', location: "שכ' הזית מחלק חשמל", open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 59, area: 'שכונת הזית', equipmentPoint: 'ללא', location: "שכ' הזית פחי אשפה ליד נויה", open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 60, area: 'שכונת הזית', equipmentPoint: 'ללא', location: "שכ' הזית ליד משפ' עדן", open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 61, area: 'שכונת הזית', equipmentPoint: 'ללא', location: "שכ' הזית ליד משפ' פיניה", open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
  { num: 62, area: 'שכונת הזית', equipmentPoint: 'ללא', location: "שכ' הזית גינה ליד משפ' עברון", open: 'ללא מידע', repair: 'צמחייה צביעה ברז', diameter: '2 או 3' },
];

async function main() {
  for (const h of hydrants) {
    const code = `H${h.num}`;
    const status = statusFromOpen(h.open);
    const openState = openStateFromOpen(h.open);
    const notes = buildNotes({ area: h.area, equipmentPoint: h.equipmentPoint, repair: h.repair, diameter: h.diameter, open: h.open });
    await prisma.hydrant.upsert({
      where: { code },
      update: { number: h.num, address: h.location, locationDescription: h.location, connectorDiameter: h.diameter, status, openState, notes, showOnMap: true, repairNeeds: h.repair ? { list: h.repair.split(',').map(s=>s.trim()) } : undefined },
      create: { code, number: h.num, address: h.location, locationDescription: h.location, connectorDiameter: h.diameter, status, openState, notes, showOnMap: true, repairNeeds: h.repair ? { list: h.repair.split(',').map(s=>s.trim()) } : undefined },
    });
  }
  console.log(`Seeded ${hydrants.length} hydrants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
