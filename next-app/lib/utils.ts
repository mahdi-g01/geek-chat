import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function addThousandsSeparator(
    input: string | number,
    separator: string = ','
): string {
    const [integer, fraction] = String(input).split('.');
    const formattedInt = integer.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        separator
    );
    return fraction ? `${formattedInt}.${fraction}` : formattedInt;
}

export const buildUrlWithParams =
    (path: string, queryParams: Record<string, string | number | boolean>, withFullDomain: boolean = false) => {
        const params = new URLSearchParams(Object.keys(queryParams).reduce((acc, key, index) => {
            return {
                ...acc,
                [key]: `${queryParams[key]}`
            }
        }, {} as Record<string, string>))
        const domain = `${withFullDomain ? window.location.origin : ""}`;
        if (queryParams == undefined || Object.keys(queryParams).length == 0)
            return `${domain}${path}`.trim();
        return `${domain}${path}?${params.toString()}`.trim();
    };

export const addDotPrefixToFileExtensionList = (input: string) => {
    // Input example: jpg,pdf,png
    // Output example: .jpg,.pdf,.png
    return "." + input.split(",").join(",.");
};

export const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

export const byteToMegabyte = (size: number) => {
    const mb = size / 1024 / 1024;
    return Math.round(mb * 10) / 10;
}

export const kbToMegabyte = (size: number) => {
    const mb = size / 1024;
    return Math.round(mb * 10) / 10;
}

export const fixDoubleLineBreak = (text: string) => {
    return text.replace("\r\n", "\n\n")
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}


const digitMap: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
};
const englishToPersianMap: Record<string, string> = {
    '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
    '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹'
};
