import i18next from 'i18next';
import { Platform, NativeModules } from 'react-native';
import { getLanguages } from 'react-native-i18n';
import { GetStoreData } from '../helpers/General';
import { LANG_OVERRIDE } from '../constants/storage';
import moment from 'moment/min/moment-with-locales';

// Refer this for checking the codes and creating new folders https://developer.chrome.com/webstore/i18n

// Adding/updating a language:
// 1. Update i18next-parser.config.js to ensure the xy language is in "locales"
// 2. run: npm run i18n:extract
// 3. All known/new keys will be added into xy.json
//    - any removed keys will be put into xy_old.json, do not commit this file
// 4. Update translations as needed
// 5. REMOVE all empty translations. e.g. "key": "", this will allow fallback to the default: English
// 6. import xyIndex from `./xy.json` and add the language to the block at the bottom

import en from './en.json';
import ht from './ht.json';
import it from './it.json';

const deviceLocale =
  Platform.OS === 'ios'
    ? NativeModules.SettingsManager.settings.AppleLocale ||
      NativeModules.SettingsManager.settings.AppleLanguages[0] // iOS 13
    : NativeModules.I18nManager.localeIdentifier;

// console.warn('locale', deviceLocale);
moment.locale([deviceLocale, 'en']);

// This will fetch the user's language
// Set up as a function so first onboarding screen can also update
// ...from async language override setting
export function findUserLang(callback) {
  let userLang = undefined;
  getLanguages().then(languages => {
    userLang = languages[0].split('-')[0]; // ['en-US' will become 'en']

    // If the user specified a language override, use it instead
    GetStoreData(LANG_OVERRIDE).then(res => {
      if (typeof res === 'string') {
        console.log('Found user language override:');
        console.log(res);
        userLang = res;
        i18next.changeLanguage(res);
        moment.locale(res);
      } else {
        i18next.changeLanguage(userLang);
        moment.locale(userLang);
      }

      // Run state updating callback to trigger rerender
      typeof callback === 'function' ? callback(userLang) : null;

      return userLang;
    });
  });
}

findUserLang();

i18next.init({
  interpolation: {
    // React already does escaping
    escapeValue: false,
  },
  lng: 'en', // 'en' | 'es',
  fallbackLng: 'en', // If language detector fails
  resources: {
    en: { label: 'English', translation: en },
    ht: { label: 'Kreyòl ayisyen', translation: ht },
    it: { label: 'Italian', translation: it },
  },
});

export default i18next;
