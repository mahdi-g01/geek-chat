
import { Preferences } from '@capacitor/preferences';

export type PreferenceKeys = "language"|"api_token"|"device_public_key"|"device_private_key";

export async function setPreference(key: PreferenceKeys|string, value: string) {
    await Preferences.set({key, value});
}

export async function getPreference(key: PreferenceKeys|string) {
    const ret = await Preferences.get({ key });
    return (ret.value);
}

export async function removePreference(key: PreferenceKeys|string) {
    return await Preferences.remove({ key });
}
