// src/data.js

export const db = {
  // ====================================================================
  // ДАННЫЕ ДЛЯ ZEEKR
  // ====================================================================
  zeekr: {
    brandName: "ZEEKR",
    models: [
      { name: "001", slug: "001", count: 551 },
      { name: "007", slug: "007", count: 185 },
      { name: "009", slug: "009", count: 148 },
      { name: "X", slug: "x", count: 119 },
      { name: "7X", slug: "7x", count: 36 },
      { name: "MIX", slug: "mix", count: 19 },
      { name: "ZEEKR 9X", slug: "9x", count: 4 },
      { name: "ZEEKR 8X", slug: "8x", count: 1 },
      { name: "ZEEKR DX1E", slug: "dx1e", count: 1 },
      { name: "ZEEKR RT", slug: "rt", count: 1 },
      { name: "M-Vision", slug: "m-vision", count: 1 },
    ],
    cars: [
      { id: 'N0907320', model: '001', name: 'ZEEKR 001 2025 4WD', price: 5754852, year: 2023, mileage: 34200, engineType: 'Электро', drivetrain: '4WD', img: 'https://i.ibb.co/L519V3j/zeekr1.png' },
      { id: 'U1677267', model: '009', name: 'ZEEKR Extreme Krypton 009 WE Version', price: 6105294, year: 2023, mileage: 34200, engineType: 'Электро', drivetrain: '4WD', img: 'https://i.ibb.co/h7gSc3g/zeekr2.png' },
      { id: 'U1669273', model: '001', name: 'ZEEKR 001 WE version 86kWh', price: 3313528, year: 2023, mileage: 34100, engineType: 'Электро', drivetrain: 'RWD', img: 'https://i.ibb.co/Gcvk5zF/zeekr3.png' },
      { id: 'U1668089', model: 'X', name: 'ZEEKR Extreme Kryptonite X Rear-wheel drive YOU versio…', price: 2161557, year: 2023, mileage: 46900, engineType: 'Электро', drivetrain: 'RWD', img: 'https://i.ibb.co/k2Vqg3p/zeekr4.png' },
      { id: 'N0907321', model: '007', name: 'ZEEKR 007 RWD', price: 4200000, year: 2024, mileage: 100, engineType: 'Электро', drivetrain: 'RWD', img: 'https://i.ibb.co/L519V3j/zeekr1.png' },
      { id: 'N0907322', model: '001', name: 'ZEEKR 001 FR', price: 8500000, year: 2024, mileage: 50, engineType: 'Электро', drivetrain: '4WD', img: 'https://i.ibb.co/Gcvk5zF/zeekr3.png' },
      { id: 'N0907323', model: 'X', name: 'ZEEKR X 4WD', price: 2800000, year: 2023, mileage: 15000, engineType: 'Электро', drivetrain: '4WD', img: 'https://i.ibb.co/k2Vqg3p/zeekr4.png' },
      { id: 'U1677268', model: '009', name: 'ZEEKR 009 ME Version', price: 7200000, year: 2024, mileage: 2000, engineType: 'Электро', drivetrain: '4WD', img: 'https://i.ibb.co/h7gSc3g/zeekr2.png' },
    ]
  },
  
  lixiang: {
    brandName: "LiXiang",
    models: [
      { name: "ONE", slug: "one", count: 1142 },
      // === ИСПРАВЛЕНИЕ ЗДЕСЬ ===
      { name: "L7", slug: "l7", count: 763, headerImages: ["https://i.ibb.co/bzzx45G/l7-1.png", "https://i.ibb.co/Y0dmyhJ/l7-2.png"] },
      { name: "L9", slug: "l9", count: 632 },
      { name: "L8", slug: "l8", count: 534 },
      { name: "Ideal i6", slug: "i6", count: 187 },
      { name: "Ideal MEGA", slug: "mega", count: 24 },
      { name: "Ideal M8", slug: "m8", count: 5 },
      { name: "L6", slug: "l6", count: 4 },
      { name: "MEGA", slug: "mega-2", count: 4 },
      { name: "理想B", slug: "b", count: 1 },
      { name: "M9", slug: "m9", count: 1 },
      { name: "M7", slug: "m7", count: 1 },
    ],
    cars: [
       { id: 'N0630269', model: 'L7', name: 'Li Xiang L7 Pro 2024 1.5L 5 seat', price: 5148163, year: 2024, mileage: 0, img: 'https://i.ibb.co/pZk3cGY/car1.png' },
       { id: 'U1670878', model: 'L7', name: 'LiXiang L7 Ultra', price: 4728548, year: 2024, mileage: 17200, img: 'https://i.ibb.co/2SLG8d2/car2.png' },
       { id: 'U1669885', model: 'L7', name: 'LiXiang L7 Max Smart Renewal', price: 5148838, year: 2025, mileage: 100, img: 'https://i.ibb.co/P9L03W3/car3.png' },
       { id: 'U1669731', model: 'L7', name: 'Li Li Pro', price: 3928536, year: 2023, mileage: 56200, img: 'https://i.ibb.co/hXN8QkL/car4.png' },
       { id: 'LX001', model: 'L9', name: 'LiXiang L9 Max', price: 7200000, year: 2023, mileage: 15000, engineType: 'Гибрид', drivetrain: '4WD', img: 'https://i.ibb.co/P9L03W3/car3.png' },
       { id: 'LX006', model: 'L8', name: 'LiXiang L8 Pro', price: 6300000, year: 2023, mileage: 22000, engineType: 'Гибрид', drivetrain: '4WD', img: 'https://i.ibb.co/pZk3cGY/car1.png' },
       { id: 'LX007', model: 'L8', name: 'LiXiang L8 Max', price: 6800000, year: 2024, mileage: 500, engineType: 'Гибрид', drivetrain: '4WD', img: 'https://i.ibb.co/2SLG8d2/car2.png' },
       { id: 'LX008', model: 'ONE', name: 'LiXiang ONE', price: 3100000, year: 2021, mileage: 75000, engineType: 'Гибрид', drivetrain: '4WD', img: 'https://i.ibb.co/P9L03W3/car3.png' },
       { id: 'LX009', model: 'MEGA', name: 'LiXiang MEGA', price: 8100000, year: 2024, mileage: 0, engineType: 'Электро', drivetrain: '4WD', img: 'https://i.ibb.co/hXN8QkL/car4.png' }
    ]
  }
};