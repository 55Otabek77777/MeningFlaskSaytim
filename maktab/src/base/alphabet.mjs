/* One alphabet conversion for the build and MU runtime. Never apply to API values. */
export function toLatin(value) {
  return String(value ?? '').split(/(https?:\/\/[^\s<>"]+|[\w.+-]+@[\w.-]+\.[a-z]{2,}|@[\w]+)/gi).map((text, i) => {
    if (i % 2) return text;
    return text.normalize('NFC').replace(/[ʻʼ‘`´']/g, '’')
      .replace(/O’/g, 'Ö').replace(/o’/g, 'ö').replace(/G’/g, 'Ğ').replace(/g’/g, 'ğ')
      .replace(/SH|Sh/g, 'Ş').replace(/sh/g, 'ş').replace(/CH|Ch/g, 'Ç').replace(/ch/g, 'ç');
  }).join('');
}
