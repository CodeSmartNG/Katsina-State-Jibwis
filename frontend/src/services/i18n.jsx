import { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    appName: 'JIBWIS Portal',
    home: 'Home',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    announcements: 'Announcements',
    activities: 'Activities',
    members: 'Members',
    fullName: 'Full Name',
    email: 'Email',
    password: 'Password',
    phone: 'Phone',
    state: 'State',
    lga: 'LGA',
    ward: 'Ward',
    submit: 'Submit',
    approve: 'Approve',
    pending: 'Pending Approval',
    roles: 'Roles',
    welcome: 'Welcome',
    createAnnouncement: 'Create Announcement',
    createActivity: 'Create Activity',
    title: 'Title',
    body: 'Body',
    date: 'Date',
    location: 'Location',
    publish: 'Publish',
  },
  ha: {
    appName: 'Dandalin JIBWIS',
    home: 'Gida',
    login: 'Shiga',
    register: 'Yi Rijista',
    logout: 'Fita',
    dashboard: 'Dashboard',
    announcements: 'Sanarwa',
    activities: 'Ayyuka',
    members: 'Mambobi',
    fullName: 'Cikakken Suna',
    email: 'Imel',
    password: 'Kalmar Sirri',
    phone: 'Waya',
    state: 'Jiha',
    lga: 'Karamar Hukuma',
    ward: 'Gunduma',
    submit: 'Aika',
    approve: 'Amince',
    pending: 'Ana Jira',
    roles: 'Matsayi',
    welcome: 'Barka da zuwa',
    createAnnouncement: 'Ƙirƙiri Sanarwa',
    createActivity: 'Ƙirƙiri Aiki',
    title: 'Take',
    body: 'Abun ciki',
    date: 'Kwanan wata',
    location: 'Wuri',
    publish: 'Wallafa',
  },
};

const LanguageContext = createContext(null);
export const useLang = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang][key] || key;
  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
