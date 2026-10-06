export interface KuwaitBank {
  id: string;
  nameAr: string;
  nameEn: string;
  prefixes: string[];
  themeColor: string;
}

export const KUWAIT_BANKS: KuwaitBank[] = [
  {
    id: 'nbk',
    nameAr: 'بنك الكويت الوطني (الوطني)',
    nameEn: 'National Bank of Kuwait (NBK)',
    prefixes: ['588845', '543363', '404919', '521175'],
    themeColor: '#002B49'
  },
  {
    id: 'kfh',
    nameAr: 'بيت التمويل الكويتي (بيتك)',
    nameEn: 'Kuwait Finance House (KFH)',
    prefixes: ['537015', '450778', '532672', '415254'],
    themeColor: '#007A3D'
  },
  {
    id: 'boubyan',
    nameAr: 'بنك بوبيان',
    nameEn: 'Boubyan Bank',
    prefixes: ['404919', '458838', '531470'],
    themeColor: '#C41230'
  },
  {
    id: 'gulf',
    nameAr: 'بنك الخليج',
    nameEn: 'Gulf Bank',
    prefixes: ['521175', '415254', '531633'],
    themeColor: '#E4002B'
  },
  {
    id: 'cbk',
    nameAr: 'البنك التجاري الكويتي (التجاري)',
    nameEn: 'Commercial Bank of Kuwait (CBK)',
    prefixes: ['532672', '490805'],
    themeColor: '#004B87'
  },
  {
    id: 'burgan',
    nameAr: 'بنك برقان',
    nameEn: 'Burgan Bank',
    prefixes: ['402978', '517419', '464452'],
    themeColor: '#002F6C'
  },
  {
    id: 'warba',
    nameAr: 'بنك وربة',
    nameEn: 'Warba Bank',
    prefixes: ['532749', '540759'],
    themeColor: '#00857C'
  },
  {
    id: 'abk',
    nameAr: 'البنك الأهلي الكويتي (الأهلي)',
    nameEn: 'Al Ahli Bank of Kuwait (ABK)',
    prefixes: ['403622', '532414'],
    themeColor: '#00205B'
  },
  {
    id: 'kib',
    nameAr: 'بنك الكويت الدولي (الدولي)',
    nameEn: 'Kuwait International Bank (KIB)',
    prefixes: ['415254', '537016'],
    themeColor: '#00558C'
  },
  {
    id: 'aub',
    nameAr: 'البنك الأهلي المتحد (المتحد)',
    nameEn: 'Ahli United Bank (AUB)',
    prefixes: ['409056', '521175'],
    themeColor: '#002855'
  }
];
