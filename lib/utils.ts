import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(number: number) {
  const formattedNumber = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number);

  // Replace periods with commas and commas with periods
  return formattedNumber.replace(/\./g, '#').replace(/,/g, '.').replace(/#/g, ',');
}

export function numberToWords(num: number) {
  const units = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
  const teens = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas", "enam belas", "tujuh belas", "delapan belas", "sembilan belas"];
  const tens = ["", "sepuluh", "dua puluh", "tiga puluh", "empat puluh", "lima puluh", "enam puluh", "tujuh puluh", "delapan puluh", "sembilan puluh"];
  const thousands = ["", "ribu", "juta", "miliar", "triliun"];

  if (num === 0) return "nol";

  function translateChunk(num: number) {
    let str = '';
    if (num >= 100) {
      if (num >= 200) {
        str += units[Math.floor(num / 100)] + ' ratus ';
      } else {
        str += 'seratus ';
      }
      num %= 100;
    }
    if (num >= 20) {
      str += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      str += teens[num - 10] + ' ';
      num = 0;
    }
    if (num > 0) {
      str += units[num] + ' ';
    }
    return str.trim();
  }

  function translate(num: number) {
    let str = '';
    let chunkIndex = 0;
    while (num > 0) {
      let chunk = num % 1000;
      if (chunk > 0) {
        str = translateChunk(chunk) + ' ' + thousands[chunkIndex] + ' ' + str;
      }
      num = Math.floor(num / 1000);
      chunkIndex++;
    }
    return str.trim();
  }

  return translate(num);
}

