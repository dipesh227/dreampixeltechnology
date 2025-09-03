import { CreatorStyle, PoliticalParty, PosterStyle, AdStyle, ProfilePictureStyle, LogoStyle, HeadshotStyle, PassportPhotoStyle, PassportPhotoSize, VisitingCardStyle, EventPosterStyle } from '../types';

import creatorStylesData from '../data/creatorStyles.json';
import adStylesData from '../data/adStyles.json';
import profilePictureStylesData from '../data/profilePictureStyles.json';
import logoStylesData from '../data/logoStyles.json';
import politicalPartiesData from '../data/politicalParties.json';
import posterStylesData from '../data/posterStyles.json';
import posterThemesData from '../data/posterThemes.json';
import headshotStylesData from '../data/headshotStyles.json';
import passportPhotoSizesData from '../data/passportPhotoSizes.json';
import passportPhotoStylesData from '../data/passportPhotoStyles.json';
import visitingCardStylesData from '../data/visitingCardStyles.json';
import eventPosterStylesData from '../data/eventPosterStyles.json';

type CreatorStyles = {
    [key: string]: CreatorStyle[];
};

type AdStyles = {
    [key: string]: AdStyle[];
};

type ProfilePictureStyles = {
    [key: string]: ProfilePictureStyle[];
}

type LogoStyles = {
    [key: string]: LogoStyle[];
}

export const CREATOR_STYLES: CreatorStyles = creatorStylesData;
export const POLITICAL_PARTIES: PoliticalParty[] = politicalPartiesData;
export const POSTER_STYLES: PosterStyle[] = posterStylesData;
export const POSTER_THEMES: string[] = posterThemesData;
export const AD_STYLES: AdStyles = adStylesData;
export const PROFILE_PICTURE_STYLES: ProfilePictureStyles = profilePictureStylesData;
export const LOGO_STYLES: LogoStyles = logoStylesData;
export const HEADSHOT_STYLES: HeadshotStyle[] = headshotStylesData;
export const PASSPORT_PHOTO_SIZES: PassportPhotoSize[] = passportPhotoSizesData;
export const PASSPORT_PHOTO_STYLES: PassportPhotoStyle[] = passportPhotoStylesData;
export const VISITING_CARD_STYLES: VisitingCardStyle[] = visitingCardStylesData;
export const EVENT_POSTER_STYLES: EventPosterStyle[] = eventPosterStylesData;
