export interface ExamPreset {
    name: string;
    width: number; // in pixels
    height: number; // in pixels
    minSize: number; // in KB
    maxSize: number; // in KB
}

export const PHOTO_PRESETS: ExamPreset[] = [
    { name: 'UPSC Civil Services', width: 350, height: 350, minSize: 20, maxSize: 300 },
    { name: 'SSC CGL/CHSL', width: 100, height: 120, minSize: 20, maxSize: 50 },
    { name: 'IBPS PO/Clerk', width: 200, height: 230, minSize: 20, maxSize: 50 },
    { name: 'SBI PO/Clerk', width: 200, height: 230, minSize: 20, maxSize: 50 },
    { name: 'RRB NTPC/Group D', width: 120, height: 140, minSize: 20, maxSize: 50 },
    { name: 'GATE', width: 240, height: 320, minSize: 20, maxSize: 200 },
    { name: 'JEE Main', width: 140, height: 180, minSize: 10, maxSize: 200 }, // Approx 3.5x4.5cm at 100dpi
    { name: 'NEET', width: 120, height: 160, minSize: 10, maxSize: 200 }, // Passport size
    { name: 'CAT', width: 120, height: 150, minSize: 20, maxSize: 80 },
    { name: 'UGC NET', width: 132, height: 170, minSize: 10, maxSize: 200 }, // 3.5x4.5cm
    { name: 'CTET', width: 132, height: 170, minSize: 10, maxSize: 100 },
    { name: 'NDA', width: 350, height: 350, minSize: 20, maxSize: 300 },
    { name: 'State PSC (General)', width: 150, height: 200, minSize: 20, maxSize: 50 },
    { name: 'Police Constable', width: 150, height: 200, minSize: 20, maxSize: 50 },
    { name: 'Bank of Baroda', width: 200, height: 230, minSize: 20, maxSize: 50 },
    { name: 'RBI Grade B', width: 200, height: 230, minSize: 20, maxSize: 50 },
    { name: 'LIC AAO', width: 200, height: 230, minSize: 20, maxSize: 50 },
    { name: 'Indian Army/Navy/Air Force', width: 132, height: 170, minSize: 20, maxSize: 50 },
    { name: 'KVS/NVS', width: 150, height: 200, minSize: 10, maxSize: 100 },
    { name: 'e-Shram Card', width: 170, height: 212, minSize: 20, maxSize: 50 }, // 4.5x5.6cm
];

export const SIGNATURE_PRESETS: ExamPreset[] = [
    { name: 'UPSC Civil Services', width: 350, height: 350, minSize: 20, maxSize: 300 },
    { name: 'SSC CGL/CHSL', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'IBPS PO/Clerk', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'SBI PO/Clerk', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'RRB NTPC/Group D', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'GATE', width: 560, height: 190, minSize: 10, maxSize: 200 }, // Wide aspect ratio
    { name: 'JEE Main', width: 140, height: 60, minSize: 4, maxSize: 30 },
    { name: 'NEET', width: 140, height: 60, minSize: 4, maxSize: 30 },
    { name: 'CAT', width: 302, height: 113, minSize: 10, maxSize: 80 }, // 80x30mm at 96dpi
    { name: 'UGC NET', width: 132, height: 57, minSize: 4, maxSize: 30 }, // 3.5x1.5cm
    { name: 'CTET', width: 132, height: 57, minSize: 3, maxSize: 30 },
    { name: 'NDA', width: 350, height: 350, minSize: 20, maxSize: 300 },
    { name: 'State PSC (General)', width: 140, height: 60, minSize: 5, maxSize: 20 },
    { name: 'Police Constable', width: 140, height: 60, minSize: 5, maxSize: 20 },
    { name: 'Bank of Baroda', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'RBI Grade B', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'LIC AAO', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'Indian Army/Navy/Air Force', width: 140, height: 60, minSize: 5, maxSize: 20 },
    { name: 'KVS/NVS', width: 140, height: 60, minSize: 10, maxSize: 30 },
    { name: 'e-Shram Card', width: 140, height: 60, minSize: 2, maxSize: 20 },
];

export const THUMB_PRESETS: ExamPreset[] = [
    { name: 'IBPS PO/Clerk', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'SBI PO/Clerk', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'RRB NTPC/Group D', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'Bank of Baroda', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'RBI Grade B', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'LIC AAO', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'State Bank Exams (General)', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'ESIC', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'Indian Post GDS', width: 240, height: 240, minSize: 20, maxSize: 50 },
    { name: 'State PSC (Some)', width: 240, height: 240, minSize: 10, maxSize: 50 },
    { name: 'EPFO SSA', width: 140, height: 60, minSize: 10, maxSize: 20 },
    { name: 'Railway Recruitment Board (RRB) ALP', width: 240, height: 240, minSize: 20, maxSize: 50},
];
